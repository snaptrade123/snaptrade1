import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeChartImage, analyzeNewsSentiment, generateCombinedPrediction } from "./openai";
import axios from "axios";
import Stripe from "stripe";
import { setupAuth } from "./auth";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // API endpoint to get info about a referrer from a referral code
  app.get("/api/referrer-info", async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: "Referral code is required" });
      }
      
      const referrer = await storage.getUserByReferralCode(code);
      
      if (!referrer) {
        return res.status(404).json({ error: "Invalid referral code" });
      }
      
      // Return only public info about the referrer
      return res.json({
        username: referrer.username,
        referralCode: referrer.referralCode,
        customName: referrer.referralCustomName
      });
    } catch (error) {
      console.error("Error fetching referrer info:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });
  
  // API endpoint to get referral info for a user
  app.get("/api/referral/:userId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = parseInt(req.params.userId);
      
      // Only allow users to view their own referral info
      if (req.user.id !== userId) {
        return res.status(403).json({ error: "Unauthorized access" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get referral stats
      const totalReferrals = await storage.getUserReferralsCount(userId);
      const referrals = await storage.getUserReferrals(userId);
      const successfulReferrals = referrals.filter(r => r.subscriptionPurchased).length;
      
      // Create the full referral URL
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://snaptrade.replit.app' 
        : 'http://localhost:5000';
      
      // Use custom name in URL if available
      const customUrlPart = user.referralCustomName 
        ? `&name=${user.referralCustomName}` 
        : '';
      
      const referralUrl = `${baseUrl}/auth?ref=${user.referralCode}${customUrlPart}`;
      
      return res.json({
        referralCode: user.referralCode,
        referralCustomName: user.referralCustomName,
        referralUrl,
        referralBonusBalance: user.referralBonusBalance,
        totalReferrals,
        successfulReferrals,
        bonusAmount: 10 // £10 per successful referral
      });
    } catch (error) {
      console.error("Error fetching referral info:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });
  
  // API endpoint to update referral custom name
  app.post("/api/referral/update-name", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { customName } = req.body;
      
      if (!customName || typeof customName !== 'string') {
        return res.status(400).json({ error: "Custom name is required" });
      }
      
      // Validate custom name format
      if (!/^[a-zA-Z0-9-_]+$/.test(customName)) {
        return res.status(400).json({ 
          error: "Custom name can only contain letters, numbers, hyphens, and underscores" 
        });
      }
      
      // Update user's referral custom name
      const updatedUser = await storage.updateReferralCode(req.user.id, customName);
      
      return res.json({
        message: "Referral name updated successfully",
        referralCustomName: updatedUser.referralCustomName
      });
    } catch (error) {
      console.error("Error updating referral name:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });
  
  // API endpoint to redeem referral bonus
  app.post("/api/referral/redeem", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { amount } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: "Valid redemption amount is required" });
      }
      
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (user.referralBonusBalance < amount) {
        return res.status(400).json({ error: "Insufficient bonus balance" });
      }
      
      // Deduct from user's bonus balance
      const updatedUser = await storage.updateReferralBonusBalance(
        user.id, 
        user.referralBonusBalance - amount
      );
      
      // Here you would normally also apply this credit to their subscription
      // For this example, we're just showing the deduction
      
      return res.json({
        message: `Successfully redeemed £${amount} from your bonus balance`,
        newBalance: updatedUser.referralBonusBalance
      });
    } catch (error) {
      console.error("Error redeeming bonus:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });
  // API endpoint for image analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { image, asset } = req.body;
      
      if (!image) {
        return res.status(400).json({ message: "No image provided" });
      }
      
      if (!asset) {
        return res.status(400).json({ message: "No asset provided" });
      }

      // 1. Detect patterns in the chart image
      const patterns = await analyzeChartImage(image);

      // 2. Fetch recent news for the asset
      const newsApiKey = process.env.NEWS_API_KEY || "";
      if (!newsApiKey) {
        return res.status(500).json({ message: "News API key not configured" });
      }

      // Convert asset name to a search query
      const searchQuery = asset.replace('/', ' ').replace('-', ' ');
      
      let newsArticles = [];
      try {
        const newsResponse = await axios.get(`https://newsapi.org/v2/everything`, {
          params: {
            q: searchQuery,
            sortBy: 'publishedAt',
            language: 'en',
            pageSize: 10,
            apiKey: newsApiKey
          }
        });

        newsArticles = newsResponse.data.articles || [];
        
        // Ensure we have at least one article
        if (newsArticles.length === 0) {
          console.log(`No news articles found for ${searchQuery}. Trying broader search...`);
          
          // Try a more general search - extract the first part of the asset name
          const broadSearchTerm = searchQuery.split(' ')[0];
          const broadNewsResponse = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
              q: broadSearchTerm,
              sortBy: 'publishedAt',
              language: 'en',
              pageSize: 5,
              apiKey: newsApiKey
            }
          });
          
          newsArticles = broadNewsResponse.data.articles || [];
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error fetching news:", errorMessage);
        // Continue without news data if there's an error
        newsArticles = [];
      }

      // 3. Analyze sentiment of news articles
      const newsSentiment = await analyzeNewsSentiment(asset, newsArticles);

      // 4. Generate combined prediction
      const prediction = await generateCombinedPrediction(patterns, newsSentiment, asset);

      // 5. Save analysis to storage
      const result = {
        asset,
        imageUrl: `data:image/jpeg;base64,${image}`,
        patterns,
        newsSentiment,
        prediction,
        timestamp: new Date() // Use Date object directly
      };

      const savedAnalysis = await storage.createAnalysis(result);

      return res.status(200).json(savedAnalysis);
    } catch (error) {
      console.error("Error in /api/analyze:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // API endpoint to save analysis with name and notes
  app.post("/api/analysis/save", async (req, res) => {
    try {
      const { name, notes, result } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Analysis name is required" });
      }
      
      if (!result) {
        return res.status(400).json({ message: "Analysis result is required" });
      }

      const savedResult = await storage.saveNamedAnalysis({
        name,
        notes: notes || "",
        result,
        timestamp: new Date()
      });

      return res.status(200).json(savedResult);
    } catch (error) {
      console.error("Error in /api/analysis/save:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // API endpoint to get saved analyses
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAnalyses();
      return res.status(200).json(analyses);
    } catch (error) {
      console.error("Error in /api/analyses:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // API endpoint to get a specific analysis
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getAnalysis(parseInt(id));
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      return res.status(200).json(analysis);
    } catch (error) {
      console.error(`Error in /api/analysis/${req.params.id}:`, error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Stripe subscription endpoints
  
  // Create a checkout session for monthly subscription
  app.post("/api/create-monthly-subscription", async (req, res) => {
    try {
      const { userId, email } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Create or get customer
      let customer;
      const user = await storage.getUser(parseInt(userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        // Create a new customer
        customer = await stripe.customers.create({
          email: email || user.email,
          metadata: {
            userId: userId
          }
        });
        
        // Update user with Stripe customer ID
        await storage.updateStripeCustomerId(user.id, customer.id);
      }
      
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer: customer.id,
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: "SnapTrade Monthly Subscription",
                description: "Advanced trading chart analysis with entry/exit points"
              },
              unit_amount: 5900, // £59.00
              recurring: {
                interval: "month"
              }
            },
            quantity: 1
          }
        ],
        success_url: `${req.headers.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing`,
      });
      
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating monthly subscription:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Create a checkout session for yearly subscription
  app.post("/api/create-yearly-subscription", async (req, res) => {
    try {
      const { userId, email } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Create or get customer
      let customer;
      const user = await storage.getUser(parseInt(userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        // Create a new customer
        customer = await stripe.customers.create({
          email: email || user.email,
          metadata: {
            userId: userId
          }
        });
        
        // Update user with Stripe customer ID
        await storage.updateStripeCustomerId(user.id, customer.id);
      }
      
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer: customer.id,
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: "SnapTrade Yearly Subscription",
                description: "Advanced trading chart analysis with entry/exit points (Annual Plan)"
              },
              unit_amount: 39900, // £399.00
              recurring: {
                interval: "year"
              }
            },
            quantity: 1
          }
        ],
        success_url: `${req.headers.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing`,
      });
      
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating yearly subscription:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Webhook for handling Stripe events
  app.post("/api/stripe-webhook", async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
    
    let event;
    
    // For testing, we'll disable the signature check since we don't have a webhook secret
    try {
      // In production, use this to verify the signature:
      // event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
      
      // For development/testing, just parse the payload directly
      event = payload;
      
      // Handle specific events
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          
          // Find the subscription
          if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription,
              { expand: ['items.data.price.product'] }
            );
            
            // Get the customer ID
            const customerId = session.customer;
            
            // Extract tier from product name
            let tier = 'monthly';
            if (subscription.items.data[0]?.price?.product?.name.includes('Yearly')) {
              tier = 'yearly';
            }
            
            // Get end date
            const endDate = new Date(subscription.current_period_end * 1000);
            
            // Find user by Stripe customer ID in the database
            try {
              // Query users from the database
              const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
              
              if (user) {
                // Update user subscription
                await storage.updateUserSubscription(
                  user.id,
                  subscription.id,
                  subscription.status,
                  tier,
                  endDate
                );
              }
            } catch (dbError) {
              console.error("Error finding user in database:", dbError);
            }
          }
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          
          // Get the customer ID
          const customerId = subscription.customer;
          
          // Extract tier from product name (need to expand the product info)
          const expandedSubscription = await stripe.subscriptions.retrieve(
            subscription.id,
            { expand: ['items.data.price.product'] }
          );
          
          let tier = 'monthly';
          if (expandedSubscription.items.data[0]?.price?.product?.name.includes('Yearly')) {
            tier = 'yearly';
          }
          
          // Get end date
          const endDate = new Date(subscription.current_period_end * 1000);
          
          // Find user by Stripe customer ID in the database
          try {
            // Query users from the database
            const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
            
            if (user) {
              // Update user subscription
              await storage.updateUserSubscription(
                user.id,
                subscription.id,
                subscription.status,
                tier,
                endDate
              );
            }
          } catch (dbError) {
            console.error("Error finding user in database:", dbError);
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          
          // Get the customer ID
          const customerId = subscription.customer;
          
          // Find user by Stripe customer ID in the database
          try {
            // Query users from the database
            const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
            
            if (user) {
              // Update user subscription status
              await storage.updateUserSubscription(
                user.id,
                subscription.id,
                'cancelled',
                user.subscriptionTier || '',
                undefined
              );
            }
          } catch (dbError) {
            console.error("Error finding user in database:", dbError);
          }
          break;
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Error in webhook:', error);
      return res.status(400).json({ message: `Webhook Error: ${error.message}` });
    }
  });
  
  // Get user's subscription status
  app.get("/api/subscription-status/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const subscriptionStatus = await storage.getUserSubscriptionStatus(parseInt(userId));
      
      res.json(subscriptionStatus);
    } catch (error) {
      console.error("Error getting subscription status:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Referral System Endpoints
  
  // Get user's referral info
  app.get("/api/referral/:userId", async (req, res) => {
    if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.userId, 10)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = parseInt(req.params.userId, 10);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get referrals count
      const referrals = await storage.getUserReferrals(userId);
      const successfulReferrals = referrals.filter(r => r.subscriptionPurchased);
      
      const referralInfo = {
        referralCode: user.referralCode,
        referralCustomName: user.referralCustomName,
        referralUrl: `${req.protocol}://${req.get('host')}/auth?ref=${user.referralCode}${user.referralCustomName ? `&name=${user.referralCustomName}` : ''}`,
        referralBonusBalance: user.referralBonusBalance || 0,
        totalReferrals: referrals.length,
        successfulReferrals: successfulReferrals.length,
        bonusAmount: 10, // £10 per successful referral
      };
      
      res.json(referralInfo);
    } catch (error) {
      console.error("Error getting referral information:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Update referral custom name
  app.post("/api/referral/update-name", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { customName } = req.body;
      
      // Update the custom name
      const user = await storage.updateReferralCode(req.user.id, customName);
      
      res.json({
        success: true,
        referralCode: user.referralCode,
        referralCustomName: user.referralCustomName,
        referralUrl: `${req.protocol}://${req.get('host')}/auth?ref=${user.referralCode}${user.referralCustomName ? `&name=${user.referralCustomName}` : ''}`,
      });
    } catch (error) {
      console.error("Error updating referral name:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Redeem referral bonus
  app.post("/api/referral/redeem", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { amount } = req.body;
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const currentBalance = user.referralBonusBalance || 0;
      
      if (currentBalance < amount) {
        return res.status(400).json({ message: "Insufficient referral bonus balance" });
      }
      
      // Deduct the amount from the balance
      const updatedUser = await storage.updateReferralBonusBalance(req.user.id, -amount);
      
      // TODO: Add logic to apply this credit to the user's subscription
      // For now, we'll just return success
      
      res.json({
        success: true,
        message: `£${amount} has been redeemed from your referral bonus balance.`,
        newBalance: updatedUser.referralBonusBalance
      });
    } catch (error) {
      console.error("Error redeeming referral bonus:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
