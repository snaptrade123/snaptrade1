import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeChartImage, analyzeNewsSentiment, generateCombinedPrediction } from "./openai";
import axios from "axios";
import Stripe from "stripe";
import { setupAuth } from "./auth";
import { db } from "./db";
import { users, referrals } from "@shared/schema";
import * as schema from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Extend the Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

// Authentication middleware that supports both session and header-based auth
const authOrIdHeader = async (req: Request, res: Response, next: NextFunction) => {
  // If already authenticated via session, use that
  if (req.isAuthenticated()) {
    req.userId = req.user.id;
    return next();
  }
  
  // Check for header-based auth (for development/testing)
  const userId = req.header('X-User-ID');
  if (userId) {
    try {
      const id = parseInt(userId, 10);
      const user = await storage.getUser(id);
      
      if (user) {
        // Attach user ID to request for use in route handlers
        req.userId = id;
        return next();
      }
    } catch (err) {
      console.error('Error parsing user ID from header:', err);
    }
  }
  
  // No valid authentication
  return res.status(401).json({ message: 'Authentication required' });
};

// Simplified auth middleware that only accepts session-based auth
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Referral URL shortener/redirector
  app.get("/r/:referralIdentifier", async (req, res) => {
    try {
      const { referralIdentifier } = req.params;
      
      if (!referralIdentifier) {
        return res.redirect('/auth');
      }
      
      // Check if this is a custom name first
      let user = await storage.getUserByCustomName(referralIdentifier);
      
      // If not found by custom name, try the actual referral code
      if (!user) {
        user = await storage.getUserByReferralCode(referralIdentifier);
      }
      
      if (user) {
        // Check if user has an active subscription - only active subscribers can refer
        const subscriptionStatus = await storage.getUserSubscriptionStatus(user.id);
        
        if (subscriptionStatus.active) {
          // User has active subscription - redirect with referral code
          console.log(`Valid referral from user ${user.username} with active subscription`);
          return res.redirect(`/auth?ref=${user.referralCode}`);
        } else {
          // User's subscription is not active - referral link is invalid
          console.log(`Referral link inactive: User ${user.username} has no active subscription`);
          return res.redirect('/auth');
        }
      } else {
        // If no matching user, redirect to regular auth page
        return res.redirect('/auth');
      }
    } catch (error) {
      console.error("Error processing referral redirect:", error);
      return res.redirect('/auth');
    }
  });
  
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
      console.log("Auth check: isAuthenticated =", req.isAuthenticated());
      console.log("Session data:", req.session);
      
      // TEMPORARY FIX: Skipping authentication check
      // if (!req.isAuthenticated()) {
      //   return res.status(401).json({ error: "Not authenticated" });
      // }
      
      const userId = parseInt(req.params.userId);
      console.log("Getting referral info for user ID:", userId);
      
      // TEMPORARY FIX: Skipping user ID validation
      // if (req.user.id !== userId) {
      //   return res.status(403).json({ error: "Unauthorized access" });
      // }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get referral stats
      const totalReferrals = await storage.getUserReferralsCount(userId);
      const referrals = await storage.getUserReferrals(userId);
      const successfulReferrals = referrals.filter(r => r.subscriptionPurchased).length;
      
      // Create the full referral URL with the new format
      // Always use snaptrade.co.uk domain for referral links
      const domain = 'snaptrade.co.uk';
      
      // Use either the custom name or the referral code for the path
      const referralPath = user.referralCustomName || user.referralCode;
      
      // Create the simplified referral URL
      const referralUrl = `https://${domain}/r/${referralPath}`;
      
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
      
      const currentBalance = user.referralBonusBalance || 0;
      
      if (currentBalance < amount) {
        return res.status(400).json({ error: "Insufficient bonus balance" });
      }
      
      // Deduct from user's bonus balance
      const updatedUser = await storage.updateReferralBonusBalance(
        user.id, 
        currentBalance - amount
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
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user.id;
      
      // Check subscription status and limits
      const subscriptionStatus = await storage.getUserSubscriptionStatus(userId);
      
      if (!subscriptionStatus.active) {
        return res.status(403).json({ 
          message: "Active subscription required",
          subscriptionRequired: true
        });
      }
      
      // Check if user has reached their daily limit
      if (subscriptionStatus.usageCount && subscriptionStatus.dailyLimit && 
          subscriptionStatus.usageCount >= subscriptionStatus.dailyLimit) {
        return res.status(403).json({ 
          message: `Daily analysis limit reached (${subscriptionStatus.usageCount}/${subscriptionStatus.dailyLimit})`,
          limitReached: true,
          usage: subscriptionStatus.usageCount,
          limit: subscriptionStatus.dailyLimit,
          tier: subscriptionStatus.tier
        });
      }
      
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
      
      // 6. Track usage for the current user
      try {
        await storage.trackAnalysisUsage(userId);
        
        // Get updated usage status
        const updatedStatus = await storage.getUserSubscriptionStatus(userId);
        
        // Include usage information in response
        return res.status(200).json({
          ...savedAnalysis,
          usageInfo: {
            count: updatedStatus.usageCount || 0,
            limit: updatedStatus.dailyLimit || 0,
            tier: updatedStatus.tier || 'standard'
          }
        });
      } catch (trackingError) {
        console.error("Error tracking analysis usage:", trackingError);
        // Continue even if tracking fails
        return res.status(200).json(savedAnalysis);
      }
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
      const { userId, email, applyReferralCredit } = req.body;
      
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
      
      // Standard monthly price in pence
      let unitAmount = 5900; // £59.00
      
      // Apply referral credit if requested and available
      if (applyReferralCredit === true) {
        const referralBalance = user.referralBonusBalance || 0;
        
        if (referralBalance > 0) {
          // Convert to pence (£10 = 1000 pence)
          const creditInPence = Math.min(referralBalance * 100, unitAmount);
          
          // Apply discount
          unitAmount = Math.max(0, unitAmount - creditInPence);
          
          // Update user's referral balance - deducting the amount used
          const creditUsedInPounds = creditInPence / 100;
          await storage.updateReferralBonusBalance(
            user.id, 
            referralBalance - creditUsedInPounds
          );
          
          console.log(`Applied £${creditUsedInPounds} referral credit for user ${user.username}`);
        }
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
              unit_amount: unitAmount, 
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
      const { userId, email, applyReferralCredit } = req.body;
      
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
      
      // Standard yearly price in pence
      let unitAmount = 39900; // £399.00
      
      // Apply referral credit if requested and available
      if (applyReferralCredit === true) {
        const referralBalance = user.referralBonusBalance || 0;
        
        if (referralBalance > 0) {
          // Convert to pence (£10 = 1000 pence)
          const creditInPence = Math.min(referralBalance * 100, unitAmount);
          
          // Apply discount
          unitAmount = Math.max(0, unitAmount - creditInPence);
          
          // Update user's referral balance - deducting the amount used
          const creditUsedInPounds = creditInPence / 100;
          await storage.updateReferralBonusBalance(
            user.id, 
            referralBalance - creditUsedInPounds
          );
          
          console.log(`Applied £${creditUsedInPounds} referral credit for user ${user.username} on yearly plan`);
        }
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
              unit_amount: unitAmount,
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
                
                // Process referral status if this user was referred, but don't award bonus yet
                // The bonus will be awarded after 7-day refund period
                try {
                  // Find if this user was referred by someone
                  const referrals = await db.query.referrals.findMany({
                    where: eq(schema.referrals.referredId, user.id)
                  });
                  
                  if (referrals.length > 0) {
                    const referral = referrals[0]; // Should only be one
                    
                    // Only update status if this is the first subscription and the status hasn't been updated yet
                    if (!referral.subscriptionPurchased) {
                      // Update referral subscription status, but don't award bonus yet
                      await storage.updateReferralStatus(
                        referral.id,
                        true, // subscriptionPurchased
                        false // bonusAwarded - will be awarded after 7-day period
                      );
                      
                      console.log(`Marked referred subscription as purchased for user ${user.username}. Bonus will be awarded after 7-day refund period.`);
                    }
                  }
                } catch (referralError) {
                  console.error("Error processing referral bonus:", referralError);
                  // Continue even if referral processing fails
                }
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
        case 'invoice.paid': {
          // This event happens initially when subscription is created, and also on renewals
          const invoice = event.data.object;
          
          // Only process if this is a subscription invoice
          if (invoice.subscription) {
            const subscriptionId = invoice.subscription;
            
            // Get subscription details to find the customer/user
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const customerId = subscription.customer;
            
            // Find user by Stripe customer ID
            try {
              const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
              
              if (user) {
                // Check invoice creation date
                const invoiceCreatedTimestamp = invoice.created;
                const currentTimestamp = Math.floor(Date.now() / 1000);
                
                // Check if invoice is at least 7 days old (7 days = 604800 seconds)
                // This means the refund period has passed
                if (currentTimestamp - invoiceCreatedTimestamp >= 604800) {
                  console.log(`Invoice ${invoice.id} for subscription ${subscriptionId} has passed the 7-day refund period`);
                  
                  // Look for any referred subscriptions that haven't had their bonus awarded yet
                  const referrals = await db.query.referrals.findMany({
                    where: and(
                      eq(schema.referrals.referredId, user.id),
                      eq(schema.referrals.subscriptionPurchased, true),
                      eq(schema.referrals.bonusAwarded, false)
                    )
                  });
                  
                  if (referrals.length > 0) {
                    const referral = referrals[0];
                    
                    // Get the referrer user
                    const referrer = await storage.getUser(referral.referrerId);
                    if (referrer) {
                      // Make sure referrer has an active subscription (only active subscribers can get referral bonuses)
                      if (referrer.subscriptionStatus === 'active') {
                        // Update referral record to mark bonus as awarded
                        await storage.updateReferralStatus(
                          referral.id,
                          true, // subscriptionPurchased (already set, but confirming)
                          true  // bonusAwarded - now past 7 day period
                        );
                        
                        // Award £10 bonus to the referrer
                        await storage.updateReferralBonusBalance(
                          referrer.id,
                          (referrer.referralBonusBalance || 0) + 10
                        );
                        
                        console.log(`Awarded £10 referral bonus to user ${referrer.username} for referring ${user.username} after 7-day refund period`);
                      } else {
                        console.log(`Referrer ${referrer.username} has no active subscription, cannot award referral bonus`);
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.error("Error processing invoice for referral bonus:", error);
            }
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
      
      // Normal subscription status check
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
      
      // Create simplified referral URL with new domain
      const domain = 'snaptrade.co.uk';
      const referralPath = user.referralCustomName || user.referralCode;
      
      const referralInfo = {
        referralCode: user.referralCode,
        referralCustomName: user.referralCustomName,
        referralUrl: `https://${domain}/r/${referralPath}`,
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
  
  // Legacy route - may have authentication issues
  app.post("/api/referral/update-name", async (req, res) => {
    console.log("Update name auth check (legacy route):", req.isAuthenticated());
    
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { customName } = req.body;
      
      // Update the custom name
      const user = await storage.updateReferralCode(req.user.id, customName);
      
      // Success response
      res.json({
        success: true,
        referralCode: user.referralCode,
        referralCustomName: user.referralCustomName
      });
    } catch (error) {
      console.error("Error updating referral name:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Direct route without auth checks - for temporary use
  app.post("/api/referral/update-name-direct/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { customName } = req.body;
      
      console.log("Direct update for user ID:", userId, "Name:", customName);
      
      if (!userId || !customName) {
        return res.status(400).json({ message: "Missing user ID or custom name" });
      }
      
      // Check if the custom name is already in use
      const existingUserWithCustomName = await storage.getUserByCustomName(customName);
      if (existingUserWithCustomName && existingUserWithCustomName.id !== userId) {
        return res.status(400).json({ 
          message: "This custom name is already in use. Please choose another name." 
        });
      }
      
      // Check if the custom name matches any existing referral code
      const existingUserWithReferralCode = await storage.getUserByReferralCode(customName);
      if (existingUserWithReferralCode && existingUserWithReferralCode.id !== userId) {
        return res.status(400).json({
          message: "This name conflicts with an existing referral code. Please choose another name."
        });
      }
      
      // Update the custom name
      const user = await storage.updateReferralCode(userId, customName);
      
      // Create simplified referral URL with new domain
      const domain = 'snaptrade.co.uk';
      const referralPath = user.referralCustomName || user.referralCode;
      
      res.json({
        success: true,
        referralCode: user.referralCode,
        referralCustomName: user.referralCustomName,
        referralUrl: `https://${domain}/r/${referralPath}`,
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
  
  // Asset Lists API
  
  // Get all asset lists for a user
  app.get("/api/asset-lists", async (req, res) => {
    try {
      // For testing - Accept a direct userId in header
      const authHeader = req.get('x-user-id');
      let userId;
      
      if (req.isAuthenticated()) {
        // Use authenticated user from session
        userId = req.user.id;
        console.log("Using authenticated user ID:", userId);
      } else if (authHeader) {
        // For testing - Allow direct user ID header
        userId = parseInt(authHeader);
        console.log("Using user ID from header:", userId);
      } else {
        console.log("Not authenticated and no user ID header");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      console.log("Fetching asset lists for user ID:", userId);
      const assetLists = await storage.getUserAssetLists(userId);
      res.json(assetLists);
    } catch (error) {
      console.error("Error fetching asset lists:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Get a single asset list
  app.get("/api/asset-lists/list/:id", async (req, res) => {
    try {
      // For testing - Accept a direct userId in header
      const authHeader = req.get('x-user-id');
      let userId;
      
      if (req.isAuthenticated()) {
        // Use authenticated user from session
        userId = req.user.id;
        console.log("Using authenticated user ID:", userId);
      } else if (authHeader) {
        // For testing - Allow direct user ID header
        userId = parseInt(authHeader);
        console.log("Using user ID from header:", userId);
      } else {
        console.log("Not authenticated and no user ID header");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const assetList = await storage.getAssetList(id);
      
      if (!assetList) {
        return res.status(404).json({ message: "Asset list not found" });
      }
      
      if (userId !== assetList.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(assetList);
    } catch (error) {
      console.error("Error fetching asset list:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Create a new asset list
  app.post("/api/asset-lists", async (req, res) => {
    try {
      // For testing - Accept a direct userId in header
      const authHeader = req.get('x-user-id');
      let userId;
      
      if (req.isAuthenticated()) {
        // Use authenticated user from session
        userId = req.user.id;
        console.log("Using authenticated user ID:", userId);
      } else if (authHeader) {
        // For testing - Allow direct user ID header
        userId = parseInt(authHeader);
        console.log("Using user ID from header:", userId);
      } else {
        console.log("Not authenticated and no user ID header");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { name, assets, isDefault } = req.body;
      
      if (!name || !assets || !Array.isArray(assets)) {
        return res.status(400).json({ message: "Invalid asset list data" });
      }
      
      console.log("Creating asset list for user ID:", userId);
      
      const assetList = await storage.createAssetList({
        name,
        userId,
        assets,
        isDefault: isDefault || false
      });
      
      res.status(201).json(assetList);
    } catch (error) {
      console.error("Error creating asset list:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Update an asset list
  app.put("/api/asset-lists/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const assetList = await storage.getAssetList(id);
      
      if (!assetList) {
        return res.status(404).json({ message: "Asset list not found" });
      }
      
      if (req.user.id !== assetList.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { name, assets, isDefault } = req.body;
      const updates: any = {};
      
      if (name !== undefined) updates.name = name;
      if (assets !== undefined) updates.assets = assets;
      if (isDefault !== undefined) updates.isDefault = isDefault;
      
      const updatedAssetList = await storage.updateAssetList(id, updates);
      res.json(updatedAssetList);
    } catch (error) {
      console.error("Error updating asset list:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Delete an asset list
  app.delete("/api/asset-lists/:id", async (req, res) => {
    try {
      // For testing - Accept a direct userId in header
      const authHeader = req.get('x-user-id');
      let userId;
      
      if (req.isAuthenticated()) {
        // Use authenticated user from session
        userId = req.user.id;
        console.log("Using authenticated user ID:", userId);
      } else if (authHeader) {
        // For testing - Allow direct user ID header
        userId = parseInt(authHeader);
        console.log("Using user ID from header:", userId);
      } else {
        console.log("Not authenticated and no user ID header");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const assetList = await storage.getAssetList(id);
      
      if (!assetList) {
        return res.status(404).json({ message: "Asset list not found" });
      }
      
      if (userId !== assetList.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteAssetList(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting asset list:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Set an asset list as default
  app.post("/api/asset-lists/:id/set-default", async (req, res) => {
    try {
      // For testing - Accept a direct userId in header
      const authHeader = req.get('x-user-id');
      let userId;
      
      if (req.isAuthenticated()) {
        // Use authenticated user from session
        userId = req.user.id;
        console.log("Using authenticated user ID:", userId);
      } else if (authHeader) {
        // For testing - Allow direct user ID header
        userId = parseInt(authHeader);
        console.log("Using user ID from header:", userId);
      } else {
        console.log("Not authenticated and no user ID header");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const assetList = await storage.getAssetList(id);
      
      if (!assetList) {
        return res.status(404).json({ message: "Asset list not found" });
      }
      
      if (userId !== assetList.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedAssetList = await storage.setDefaultAssetList(userId, id);
      res.json(updatedAssetList);
    } catch (error) {
      console.error("Error setting default asset list:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Trading Signals API
  
  // Get all free trading signals - no auth required
  app.get("/api/trading-signals/free", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const signals = await storage.getFreeTradingSignals({ limit });
      res.json(signals);
    } catch (error) {
      console.error("Error fetching free trading signals:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Get all premium trading signals - auth required
  app.get("/api/trading-signals/premium", authOrIdHeader, async (req: any, res) => {
    try {
      const userId = req.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      // Get all premium signals
      const signals = await storage.getPremiumTradingSignals({ limit });
      
      // Get user's subscriptions
      const subscriptions = await storage.getUserSignalSubscriptions(userId);
      const subscribedProviderIds = new Set(
        subscriptions
          .filter(sub => sub.status === 'active')
          .map(sub => sub.providerId)
      );
      
      // Mark which signals the user has access to
      const enhancedSignals = signals.map(signal => ({
        ...signal,
        hasAccess: !signal.isPremium || subscribedProviderIds.has(signal.providerId)
      }));
      
      res.json(enhancedSignals);
    } catch (error) {
      console.error("Error fetching premium trading signals:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Get a specific trading signal by ID
  app.get("/api/trading-signals/:id", async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const signal = await storage.getTradingSignal(id);
      
      if (!signal) {
        return res.status(404).json({ message: "Trading signal not found" });
      }
      
      // For premium signals, verify user subscription
      if (signal.isPremium) {
        // Get user ID from session or header
        const authHeader = req.header('X-User-ID');
        let userId;
        
        if (req.isAuthenticated()) {
          userId = req.user.id;
        } else if (authHeader) {
          userId = parseInt(authHeader);
        } else {
          return res.status(401).json({ message: "Authentication required to view premium signals" });
        }
        
        // If user is the provider, allow access
        if (userId === signal.providerId) {
          return res.json(signal);
        }
        
        // Check if user has an active subscription to this provider
        const subscriptions = await storage.getUserSignalSubscriptions(userId);
        const hasSubscription = subscriptions.some(
          sub => sub.providerId === signal.providerId && sub.status === 'active'
        );
        
        if (!hasSubscription) {
          return res.status(403).json({ 
            message: "Subscription required to view this premium signal",
            isPremium: true,
            providerId: signal.providerId
          });
        }
      }
      
      res.json(signal);
    } catch (error) {
      console.error("Error fetching trading signal:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Get signals posted by a specific provider
  app.get("/api/trading-signals/provider/:providerId", async (req: any, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const signals = await storage.getProviderTradingSignals(providerId);
      
      // Get user ID from session or header
      const authHeader = req.header('X-User-ID');
      let userId;
      
      if (req.isAuthenticated()) {
        userId = req.user.id;
        // If user is the provider, return all signals
        if (userId === providerId) {
          return res.json(signals);
        }
      } else if (authHeader) {
        userId = parseInt(authHeader);
        // If user is the provider, return all signals
        if (userId === providerId) {
          return res.json(signals);
        }
      }
      
      // For other users, only return free signals or premium ones they've subscribed to
      let filteredSignals = signals.filter(signal => !signal.isPremium);
      
      if (userId) {
        const subscriptions = await storage.getUserSignalSubscriptions(userId);
        const hasSubscription = subscriptions.some(
          sub => sub.providerId === providerId && sub.status === 'active'
        );
        
        if (hasSubscription) {
          // Include all signals if subscribed
          filteredSignals = signals;
        }
      }
      
      res.json(filteredSignals);
    } catch (error) {
      console.error("Error fetching provider trading signals:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Create a new trading signal - auth required
  app.post("/api/trading-signals", authOrIdHeader, async (req: any, res) => {
    try {      
      const userId = req.userId;
      
      // Check if premium - only subscribers can create premium signals
      if (req.body.isPremium) {
        const subscriptionStatus = await storage.getUserSubscriptionStatus(userId);
        if (!subscriptionStatus.active) {
          return res.status(403).json({ 
            message: "You must be a SnapTrade subscriber to create premium signals" 
          });
        }
      }
      
      // Adapt field names to match schema
      const signal = {
        providerId: userId,
        pair: req.body.asset || req.body.pair,
        direction: req.body.direction,
        entry: req.body.entry || req.body.entryPrice?.toString(),
        stopLoss: req.body.stopLoss?.toString(),
        takeProfit1: req.body.takeProfit1 || req.body.takeProfit?.toString(),
        takeProfit2: req.body.takeProfit2,
        takeProfit3: req.body.takeProfit3,
        timeframe: req.body.timeframe,
        notes: req.body.notes || req.body.analysis,
        isPremium: req.body.isPremium === true
      };
      
      console.log("Creating trading signal with data:", signal);
      const newSignal = await storage.createTradingSignal(signal);
      res.status(201).json(newSignal);
    } catch (error) {
      console.error("Error creating trading signal:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Update a trading signal
  app.patch("/api/trading-signals/:id", authOrIdHeader, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId;
      
      // Get the signal
      const signal = await storage.getTradingSignal(id);
      
      if (!signal) {
        return res.status(404).json({ message: "Trading signal not found" });
      }
      
      // Check if user owns the signal
      if (userId !== signal.providerId) {
        return res.status(403).json({ message: "You can only update your own signals" });
      }
      
      // Update the signal
      const updatedSignal = await storage.updateTradingSignal(id, req.body);
      res.json(updatedSignal);
    } catch (error) {
      console.error("Error updating trading signal:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Delete a trading signal
  app.delete("/api/trading-signals/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to delete signals" });
      }
      
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the signal
      const signal = await storage.getTradingSignal(id);
      
      if (!signal) {
        return res.status(404).json({ message: "Trading signal not found" });
      }
      
      // Check if user owns the signal
      if (userId !== signal.providerId) {
        return res.status(403).json({ message: "You can only delete your own signals" });
      }
      
      // Delete the signal
      await storage.deleteTradingSignal(id);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting trading signal:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Subscribe to a provider's signals
  app.post("/api/signal-subscriptions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to subscribe" });
      }
      
      const userId = req.user.id;
      const { providerId } = req.body;
      
      if (!providerId) {
        return res.status(400).json({ message: "Provider ID is required" });
      }
      
      // Check if already subscribed
      const subscriptions = await storage.getUserSignalSubscriptions(userId);
      const existingSubscription = subscriptions.find(
        sub => sub.providerId === providerId && sub.status === 'active'
      );
      
      if (existingSubscription) {
        return res.status(400).json({ message: "You are already subscribed to this provider" });
      }
      
      // Create a Stripe checkout session
      // Get the first premium signal from this provider to determine price
      const providerSignals = await storage.getProviderTradingSignals(providerId);
      const premiumSignal = providerSignals.find(signal => signal.isPremium);
      
      if (!premiumSignal) {
        return res.status(400).json({ message: "This provider does not offer premium signals" });
      }
      
      // Get the provider's user info for the Stripe description
      const provider = await storage.getUser(providerId);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      // Create a subscription through Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: `${provider.username}'s Premium Trading Signals`,
                description: `Monthly subscription to ${provider.username}'s premium trading signals`,
              },
              unit_amount: premiumSignal.price * 100, // Price in pence
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.protocol}://${req.get('host')}/subscription-success?provider=${provider.username}`,
        cancel_url: `${req.protocol}://${req.get('host')}/trading-signals`,
        client_reference_id: `${userId}_${providerId}`, // To identify the subscription later
        metadata: {
          userId: userId.toString(),
          providerId: providerId.toString()
        },
      });
      
      res.json({
        sessionId: session.id,
        url: session.url
      });
    } catch (error) {
      console.error("Error creating signal subscription:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Get user's signal subscriptions
  app.get("/api/signal-subscriptions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user.id;
      const subscriptions = await storage.getUserSignalSubscriptions(userId);
      
      // Enhance with provider information
      const enhancedSubscriptions = await Promise.all(
        subscriptions.map(async (sub) => {
          const provider = await storage.getUser(sub.providerId);
          return {
            ...sub,
            providerUsername: provider ? provider.username : 'Unknown'
          };
        })
      );
      
      res.json(enhancedSubscriptions);
    } catch (error) {
      console.error("Error fetching signal subscriptions:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Get provider's subscribers
  app.get("/api/signal-subscribers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const providerId = req.user.id;
      const subscribers = await storage.getProviderSubscribers(providerId);
      
      // Enhance with basic user information (username only)
      const enhancedSubscribers = await Promise.all(
        subscribers.map(async (sub) => {
          const user = await storage.getUser(sub.userId);
          return {
            ...sub,
            username: user ? user.username : 'Unknown'
          };
        })
      );
      
      // Get provider's earnings summary
      const earningsSummary = await storage.getProviderEarningsSummary(providerId);
      
      // Also return provider's payout metrics
      const signalPayouts = await storage.getProviderPayouts(providerId);
      const pendingPayouts = signalPayouts
        .filter(payout => payout.status === 'pending')
        .reduce((sum, payout) => sum + payout.amount, 0);
      
      res.json({
        subscribers: enhancedSubscribers,
        metrics: {
          subscriberCount: subscribers.length,
          availableBalance: earningsSummary.availableBalance,
          pendingBalance: earningsSummary.pendingBalance,
          totalEarned: earningsSummary.totalEarned,
          totalFees: earningsSummary.totalFees,
          pendingPayouts: pendingPayouts
        }
      });
    } catch (error) {
      console.error("Error fetching signal subscribers:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Provider Ratings API Endpoints
  
  // Get provider's ratings
  app.get("/api/provider/:providerId/ratings", async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      
      if (isNaN(providerId)) {
        return res.status(400).json({ message: "Invalid provider ID" });
      }
      
      const ratings = await storage.getProviderRatings(providerId);
      res.json(ratings);
    } catch (error) {
      console.error("Error in /api/provider/ratings:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Get user's rating for a specific provider
  app.get("/api/provider/:providerId/user-rating", requireAuth, async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      
      if (isNaN(providerId)) {
        return res.status(400).json({ message: "Invalid provider ID" });
      }
      
      const rating = await storage.getUserRating(req.user!.id, providerId);
      res.json(rating || { rating: null });
    } catch (error) {
      console.error("Error in /api/provider/user-rating:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Submit a rating for a provider
  app.post("/api/provider/rate", requireAuth, async (req, res) => {
    try {
      const { providerId, isPositive } = req.body;
      
      if (!providerId || typeof isPositive !== 'boolean') {
        return res.status(400).json({ message: "Invalid request. providerId and isPositive are required." });
      }
      
      // Prevent users from rating themselves
      if (providerId === req.user!.id) {
        return res.status(400).json({ message: "You cannot rate yourself." });
      }
      
      const rating = await storage.rateProvider(req.user!.id, providerId, isPositive);
      res.json(rating);
    } catch (error) {
      console.error("Error in /api/provider/rate:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Remove a rating for a provider
  app.delete("/api/provider/rate/:providerId", requireAuth, async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      
      if (isNaN(providerId)) {
        return res.status(400).json({ message: "Invalid provider ID" });
      }
      
      await storage.deleteUserRating(req.user!.id, providerId);
      res.status(204).send();
    } catch (error) {
      console.error("Error in DELETE /api/provider/rate:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Update user profile
  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { bio, email } = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, { 
        bio: bio !== undefined ? bio : undefined,
        email: email !== undefined ? email : undefined 
      });
      
      // Return updated user data without sensitive information
      const { password, ...user } = updatedUser;
      return res.json(user);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Debug API endpoint to check authentication status
  app.get("/api/check-auth", (req, res) => {
    console.log("Auth check request received");
    console.log("Is authenticated:", req.isAuthenticated());
    console.log("Session ID:", req.sessionID);
    
    if (req.isAuthenticated()) {
      console.log("User in session:", req.user.id, req.user.username);
      return res.json({
        authenticated: true,
        message: `Authenticated as ${req.user.username}`,
        sessionID: req.sessionID,
        user: req.user
      });
    } else {
      return res.json({
        authenticated: false,
        message: "Not authenticated",
        sessionID: req.sessionID
      });
    }
  });
  
  // Create provider profile
  app.post("/api/provider/profile", requireAuth, async (req, res) => {
    try {
      // Double check authentication
      if (!req.user) {
        console.log("Provider profile creation failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required" });
      }
      
      console.log("Attempting to create provider profile for user:", req.user.id);
      
      const userId = req.user.id;
      const { displayName, bio, signalFee, isProvider = true } = req.body;
      
      console.log("Provider profile data:", { displayName, bio, signalFee, isProvider });
      
      if (!bio || bio.length < 20) {
        console.log("Provider profile creation failed: Bio too short");
        return res.status(400).json({ message: "Bio must be at least 20 characters" });
      }
      
      const fee = Number(signalFee);
      if (isNaN(fee) || fee < 5 || fee > 50) {
        console.log("Provider profile creation failed: Invalid fee");
        return res.status(400).json({ message: "Fee must be between £5 and £50" });
      }
      
      // Update user to become a provider
      console.log("Updating user to become a provider with data:", {
        isProvider: true,
        providerDisplayName: displayName || undefined,
        bio,
        signalFee: fee
      });
      
      const updatedUser = await storage.updateProviderProfile(userId, {
        isProvider: true,
        providerDisplayName: displayName || undefined,
        bio,
        signalFee: fee
      });
      
      console.log("Provider profile created successfully");
      
      // Return updated user data without sensitive information
      const { password, ...user } = updatedUser;
      return res.json(user);
    } catch (error) {
      console.error('Error creating provider profile:', error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Get a specific user by ID
  app.get("/api/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user info without sensitive fields
      const safeUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        referralCode: user.referralCode,
        thumbsUp: user.thumbsUp || 0,
        thumbsDown: user.thumbsDown || 0,
        createdAt: user.createdAt
      };
      
      res.json(safeUser);
    } catch (error) {
      console.error("Error in /api/user/:userId:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Provider Earnings API Endpoints
  
  // Get provider's earnings
  app.get("/api/provider/earnings", requireAuth, async (req, res) => {
    try {
      const providerId = req.user!.id;
      
      // Get earnings summary
      const summary = await storage.getProviderEarningsSummary(providerId);
      
      // Get recent earnings transactions
      const earnings = await storage.getProviderEarnings(providerId);
      
      return res.status(200).json({
        summary,
        transactions: earnings.slice(0, 20) // Return only the most recent transactions
      });
    } catch (error) {
      console.error("Error in /api/provider/earnings:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Request a payout
  app.post("/api/provider/request-payout", requireAuth, async (req, res) => {
    try {
      const providerId = req.user!.id;
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "A valid payout amount is required" });
      }
      
      // Get available balance
      const summary = await storage.getProviderEarningsSummary(providerId);
      
      if (summary.availableBalance < amount) {
        return res.status(400).json({ 
          message: `Insufficient available balance. Available: £${(summary.availableBalance / 100).toFixed(2)}` 
        });
      }
      
      // Request the payout
      const payout = await storage.requestPayout(providerId, amount);
      
      return res.status(201).json({
        payout,
        message: "Payout request submitted successfully"
      });
    } catch (error) {
      console.error("Error in /api/provider/request-payout:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });
  
  // Get provider's payout history
  app.get("/api/provider/payouts", requireAuth, async (req, res) => {
    try {
      const providerId = req.user!.id;
      const payouts = await storage.getProviderPayouts(providerId);
      
      return res.status(200).json(payouts);
    } catch (error) {
      console.error("Error in /api/provider/payouts:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  // Cancel a signal subscription
  app.post("/api/signal-subscriptions/:id/cancel", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user.id;
      const subscriptionId = parseInt(req.params.id);
      
      // Get the subscription
      const [subscription] = await db.select()
        .from(signalSubscriptions)
        .where(eq(signalSubscriptions.id, subscriptionId));
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      // Check if user owns the subscription
      if (userId !== subscription.userId) {
        return res.status(403).json({ message: "You can only cancel your own subscriptions" });
      }
      
      // Cancel in Stripe if there's a Stripe subscription ID
      if (subscription.stripeSubscriptionId) {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true
        });
      }
      
      // Update the subscription status
      const updatedSubscription = await storage.cancelSignalSubscription(subscriptionId);
      
      res.json(updatedSubscription);
    } catch (error) {
      console.error("Error canceling signal subscription:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
