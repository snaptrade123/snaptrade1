import { analysis, namedAnalysis, users, referrals, assetLists, analysisUsage, tradingSignals, signalSubscriptions, signalPayouts, providerEarnings, userRatings, type Analysis, type NamedAnalysis, type InsertAnalysis, type InsertNamedAnalysis, type User, type InsertUser, type InsertReferral, type Referral, type AssetList, type InsertAssetList, type AnalysisUsage, type InsertAnalysisUsage, type TradingSignal, type InsertTradingSignal, type SignalSubscription, type InsertSignalSubscription, type SignalPayout, type InsertSignalPayout, type ProviderEarnings, type InsertProviderEarnings, type UserRating, type InsertUserRating } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);

// Interface for storage
export interface IStorage {
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getAnalyses(): Promise<Analysis[]>;
  saveNamedAnalysis(namedAnalysis: InsertNamedAnalysis): Promise<NamedAnalysis>;
  getNamedAnalysis(id: number): Promise<NamedAnalysis | undefined>;
  getNamedAnalyses(): Promise<NamedAnalysis[]>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: number, updates: { bio?: string; email?: string }): Promise<User>;
  updateProviderProfile(userId: number, updates: { 
    isProvider?: boolean;
    providerDisplayName?: string;
    bio?: string;
    signalFee?: number;
  }): Promise<User>;
  
  // User Rating methods
  rateProvider(userId: number, providerId: number, isPositive: boolean): Promise<UserRating>;
  getUserRating(userId: number, providerId: number): Promise<UserRating | undefined>;
  getProviderRatings(providerId: number): Promise<{ thumbsUp: number, thumbsDown: number }>;
  deleteUserRating(userId: number, providerId: number): Promise<void>;
  updateUserRatingCounts(providerId: number): Promise<void>;
  
  // Stripe subscription methods
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
  updateUserSubscription(userId: number, stripeSubscriptionId: string, status: string, tier: string, endDate?: Date): Promise<User>;
  getUserSubscriptionStatus(userId: number): Promise<{ active: boolean, tier?: string, endDate?: Date, dailyLimit?: number, usageCount?: number }>;
  
  // Analysis usage methods
  trackAnalysisUsage(userId: number): Promise<AnalysisUsage>;
  getDailyAnalysisUsage(userId: number): Promise<number>;
  getUserDailyLimit(userId: number): Promise<number>;
  
  // Referral methods
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  getUserByCustomName(customName: string): Promise<User | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  getUserReferrals(userId: number): Promise<Referral[]>;
  getUserReferralsCount(userId: number): Promise<number>;
  updateReferralStatus(referralId: number, subscriptionPurchased: boolean, bonusAwarded: boolean): Promise<Referral>;
  updateReferralCode(userId: number, customName?: string): Promise<User>;
  updateReferralBonusBalance(userId: number, amount: number): Promise<User>;
  
  // Asset List methods
  createAssetList(assetList: InsertAssetList): Promise<AssetList>;
  getAssetList(id: number): Promise<AssetList | undefined>;
  getUserAssetLists(userId: number): Promise<AssetList[]>;
  updateAssetList(id: number, updates: Partial<InsertAssetList>): Promise<AssetList>;
  deleteAssetList(id: number): Promise<void>;
  setDefaultAssetList(userId: number, assetListId: number): Promise<AssetList>;
  
  // Trading Signal methods
  createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal>;
  getTradingSignal(id: number): Promise<TradingSignal | undefined>;
  getAllTradingSignals(options?: { limit?: number, includeExpired?: boolean }): Promise<TradingSignal[]>;
  getFreeTradingSignals(options?: { limit?: number }): Promise<TradingSignal[]>;
  getPremiumTradingSignals(options?: { limit?: number }): Promise<TradingSignal[]>;
  getUserTradingSignals(userId: number): Promise<TradingSignal[]>;
  getProviderTradingSignals(providerId: number): Promise<TradingSignal[]>;
  updateTradingSignal(id: number, updates: Partial<InsertTradingSignal>): Promise<TradingSignal>;
  deleteTradingSignal(id: number): Promise<void>;
  
  // Signal Subscription methods
  createSignalSubscription(subscription: InsertSignalSubscription): Promise<SignalSubscription>;
  getUserSignalSubscriptions(userId: number): Promise<SignalSubscription[]>;
  getProviderSubscribers(providerId: number): Promise<SignalSubscription[]>;
  updateSignalSubscription(id: number, updates: Partial<InsertSignalSubscription>): Promise<SignalSubscription>;
  cancelSignalSubscription(id: number): Promise<SignalSubscription>;
  
  // Provider Earnings methods
  createProviderEarning(earning: InsertProviderEarnings): Promise<ProviderEarnings>;
  getProviderEarnings(providerId: number, status?: string): Promise<ProviderEarnings[]>;
  getProviderEarningsSummary(providerId: number): Promise<{
    availableBalance: number;
    pendingBalance: number;
    totalEarned: number;
    totalFees: number;
  }>;
  updateProviderEarningStatus(ids: number[], newStatus: string): Promise<ProviderEarnings[]>;
  recordProviderEarning(providerId: number, subscriptionId: number, amount: number, currency?: string): Promise<ProviderEarnings>;
  
  // Signal Payout methods
  createSignalPayout(payout: InsertSignalPayout): Promise<SignalPayout>;
  getProviderPayouts(providerId: number): Promise<SignalPayout[]>;
  updateSignalPayout(id: number, updates: Partial<InsertSignalPayout>): Promise<SignalPayout>;
  requestPayout(providerId: number, amount: number): Promise<SignalPayout>;
  
  // Session store
  sessionStore: session.Store;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
  
  // User Rating methods
  async rateProvider(userId: number, providerId: number, isPositive: boolean): Promise<UserRating> {
    // Check if the user has already rated this provider
    const existingRating = await this.getUserRating(userId, providerId);
    
    if (existingRating) {
      // If rating is the same, no change needed
      if (existingRating.rating === isPositive) {
        return existingRating;
      }
      
      // Delete the old rating first
      await this.deleteUserRating(userId, providerId);
      
      // Update the provider's thumbs up/down counts
      const updateField = existingRating.rating ? 'thumbsUp' : 'thumbsDown';
      await db.update(users)
        .set({ [updateField]: db.raw(`${updateField} - 1`) })
        .where(eq(users.id, providerId));
    }
    
    // Add the new rating
    const [rating] = await db.insert(userRatings)
      .values({
        userId,
        providerId,
        rating: isPositive
      })
      .returning();
    
    // Update the provider's thumbs up/down counts
    const updateField = isPositive ? 'thumbsUp' : 'thumbsDown';
    await db.update(users)
      .set({ [updateField]: db.raw(`${updateField} + 1`) })
      .where(eq(users.id, providerId));
    
    return rating;
  }
  
  async getUserRating(userId: number, providerId: number): Promise<UserRating | undefined> {
    const ratings = await db.select()
      .from(userRatings)
      .where(and(
        eq(userRatings.userId, userId),
        eq(userRatings.providerId, providerId)
      ));
    
    return ratings[0];
  }
  
  async getProviderRatings(providerId: number): Promise<{ thumbsUp: number, thumbsDown: number }> {
    const [provider] = await db.select({
      thumbsUp: users.thumbsUp,
      thumbsDown: users.thumbsDown
    })
      .from(users)
      .where(eq(users.id, providerId));
    
    return provider ? { 
      thumbsUp: provider.thumbsUp || 0, 
      thumbsDown: provider.thumbsDown || 0 
    } : { 
      thumbsUp: 0, 
      thumbsDown: 0 
    };
  }
  
  async deleteUserRating(userId: number, providerId: number): Promise<void> {
    const rating = await this.getUserRating(userId, providerId);
    
    if (rating) {
      // Update the provider's thumbs up/down counts before deleting
      const updateField = rating.rating ? 'thumbsUp' : 'thumbsDown';
      await db.update(users)
        .set({ [updateField]: db.raw(`${updateField} - 1`) })
        .where(eq(users.id, providerId));
      
      // Delete the rating
      await db.delete(userRatings)
        .where(and(
          eq(userRatings.userId, userId),
          eq(userRatings.providerId, providerId)
        ));
    }
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const [result] = await db.insert(analysis).values(insertAnalysis).returning();
    return result;
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const [result] = await db.select().from(analysis).where(eq(analysis.id, id));
    return result;
  }

  async getAnalyses(): Promise<Analysis[]> {
    return await db.select().from(analysis).orderBy(desc(analysis.timestamp));
  }

  async saveNamedAnalysis(insertNamedAnalysis: InsertNamedAnalysis): Promise<NamedAnalysis> {
    const [result] = await db.insert(namedAnalysis).values(insertNamedAnalysis).returning();
    return result;
  }

  async getNamedAnalysis(id: number): Promise<NamedAnalysis | undefined> {
    const [result] = await db.select().from(namedAnalysis).where(eq(namedAnalysis.id, id));
    return result;
  }

  async getNamedAnalyses(): Promise<NamedAnalysis[]> {
    return await db.select().from(namedAnalysis).orderBy(desc(namedAnalysis.timestamp));
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async updateUserProfile(userId: number, updates: { bio?: string; email?: string }): Promise<User> {
    const updateData: Partial<typeof users.$inferInsert> = {};
    
    if (updates.bio !== undefined) {
      updateData.bio = updates.bio;
    }
    
    if (updates.email !== undefined) {
      updateData.email = updates.email;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
  
  async updateProviderProfile(userId: number, updates: { 
    isProvider?: boolean;
    providerDisplayName?: string;
    bio?: string;
    signalFee?: number;
  }): Promise<User> {
    // Use the users schema object to ensure proper column mapping
    const updateData: Partial<typeof users.$inferInsert> = {};
    
    if (updates.isProvider !== undefined) {
      updateData.isProvider = updates.isProvider;
    }
    
    if (updates.providerDisplayName !== undefined) {
      updateData.providerDisplayName = updates.providerDisplayName;
    }
    
    if (updates.bio !== undefined) {
      updateData.bio = updates.bio;
    }
    
    if (updates.signalFee !== undefined) {
      updateData.signalFee = updates.signalFee;
    }
    
    try {
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating provider profile:", error);
      throw error;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      subscriptionTier: null,
      subscriptionEndDate: null
    }).returning();
    return user;
  }
  
  // Stripe subscription methods
  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    
    return user;
  }
  
  async updateUserSubscription(
    userId: number, 
    stripeSubscriptionId: string, 
    status: string, 
    tier: string, 
    endDate?: Date
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeSubscriptionId,
        subscriptionStatus: status,
        subscriptionTier: tier,
        subscriptionEndDate: endDate || null
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    
    return user;
  }
  
  async getUserSubscriptionStatus(userId: number): Promise<{ active: boolean, tier?: string, endDate?: Date, dailyLimit?: number, usageCount?: number }> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return { active: false };
    }
    
    // A subscription is active if it has status "active" or "trialing"
    const active = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
    
    // Get daily usage count
    const usageCount = await this.getDailyAnalysisUsage(userId);
    
    if (!active) {
      return { active, usageCount };
    }
    
    // Determine daily limit based on tier
    const tier = user.subscriptionTier || 'standard';
    const dailyLimit = tier === 'premium' ? 20 : 10; // Premium gets 20, Standard gets 10
    
    return {
      active,
      tier: tier,
      endDate: user.subscriptionEndDate,
      dailyLimit: dailyLimit,
      usageCount: usageCount
    };
  }
  
  // Get current day's usage count for a user
  async getDailyAnalysisUsage(userId: number): Promise<number> {
    try {
      // Get today's date in ISO format YYYY-MM-DD
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of day
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1); // Start of next day
      
      // Find existing record for today
      const [existingUsage] = await db
        .select()
        .from(analysisUsage)
        .where(eq(analysisUsage.userId, userId));
      
      // Check if the record is from today
      if (existingUsage) {
        const usageDate = new Date(existingUsage.date);
        if (usageDate >= today && usageDate < tomorrow) {
          return existingUsage.count;
        }
      }
      
      return 0; // No usage today
    } catch (error) {
      console.error(`Error getting analysis usage for user ${userId}:`, error);
      return 0;
    }
  }
  
  // Get daily limit based on subscription tier
  async getUserDailyLimit(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return 0;
    }
    
    const active = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
    if (!active) {
      return 0;
    }
    
    return user.subscriptionTier === "premium" ? 20 : 10;
  }
  
  // Track a new analysis usage
  async trackAnalysisUsage(userId: number): Promise<AnalysisUsage> {
    try {
      // Get today's date in ISO format YYYY-MM-DD
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of day
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1); // Start of next day
      
      // Find existing record for today
      const [existingUsage] = await db
        .select()
        .from(analysisUsage)
        .where(eq(analysisUsage.userId, userId));
      
      // Check if the record is from today
      if (existingUsage) {
        const usageDate = new Date(existingUsage.date);
        if (usageDate >= today && usageDate < tomorrow) {
          // Update existing record
          const [updatedUsage] = await db
            .update(analysisUsage)
            .set({ count: existingUsage.count + 1 })
            .where(eq(analysisUsage.id, existingUsage.id))
            .returning();
            
          return updatedUsage;
        }
      }
      
      // Create new record for today
      const [newUsage] = await db
        .insert(analysisUsage)
        .values({
          userId,
          date: today,
          count: 1
        })
        .returning();
        
      return newUsage;
    } catch (error) {
      console.error(`Error tracking analysis usage for user ${userId}:`, error);
      throw error;
    }
  }

  // Referral methods
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user;
  }
  
  async getUserByCustomName(customName: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCustomName, customName));
    return user;
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [result] = await db.insert(referrals).values(referral).returning();
    return result;
  }

  async getUserReferrals(userId: number): Promise<Referral[]> {
    return await db.select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async getUserReferralsCount(userId: number): Promise<number> {
    const results = await db.select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));
    return results.length;
  }

  async updateReferralStatus(referralId: number, subscriptionPurchased: boolean, bonusAwarded: boolean): Promise<Referral> {
    const [result] = await db
      .update(referrals)
      .set({ 
        subscriptionPurchased,
        bonusAwarded
      })
      .where(eq(referrals.id, referralId))
      .returning();
    
    if (!result) {
      throw new Error(`Referral not found with ID: ${referralId}`);
    }
    
    return result;
  }

  async updateReferralCode(userId: number, customName?: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ 
        referralCustomName: customName || null
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async updateReferralBonusBalance(userId: number, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    const currentBalance = user.referralBonusBalance || 0;
    const newBalance = currentBalance + amount;

    const [updatedUser] = await db
      .update(users)
      .set({ 
        referralBonusBalance: newBalance
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  // Asset List Methods
  async createAssetList(insertAssetList: InsertAssetList): Promise<AssetList> {
    // If this is the first asset list for the user, set it as default
    const userLists = await this.getUserAssetLists(insertAssetList.userId);
    const isDefault = userLists.length === 0 ? true : !!insertAssetList.isDefault;
    
    // If setting as default, unset any previous defaults
    if (isDefault) {
      await db
        .update(assetLists)
        .set({ isDefault: false })
        .where(eq(assetLists.userId, insertAssetList.userId));
    }

    const [result] = await db
      .insert(assetLists)
      .values({
        ...insertAssetList,
        isDefault
      })
      .returning();
    
    return result;
  }

  async getAssetList(id: number): Promise<AssetList | undefined> {
    const [result] = await db
      .select()
      .from(assetLists)
      .where(eq(assetLists.id, id));
    
    return result;
  }

  async getUserAssetLists(userId: number): Promise<AssetList[]> {
    return await db
      .select()
      .from(assetLists)
      .where(eq(assetLists.userId, userId))
      .orderBy(desc(assetLists.createdAt));
  }

  async updateAssetList(id: number, updates: Partial<InsertAssetList>): Promise<AssetList> {
    // If setting as default, unset any previous defaults
    if (updates.isDefault) {
      const [assetList] = await db
        .select()
        .from(assetLists)
        .where(eq(assetLists.id, id));
      
      if (assetList) {
        await db
          .update(assetLists)
          .set({ isDefault: false })
          .where(eq(assetLists.userId, assetList.userId));
      }
    }

    const [result] = await db
      .update(assetLists)
      .set(updates)
      .where(eq(assetLists.id, id))
      .returning();
    
    if (!result) {
      throw new Error(`Asset list not found with ID: ${id}`);
    }
    
    return result;
  }

  async deleteAssetList(id: number): Promise<void> {
    const [assetList] = await db
      .select()
      .from(assetLists)
      .where(eq(assetLists.id, id));
    
    if (!assetList) {
      throw new Error(`Asset list not found with ID: ${id}`);
    }

    await db
      .delete(assetLists)
      .where(eq(assetLists.id, id));
    
    // If this was a default list, set another list as default if available
    if (assetList.isDefault) {
      const otherLists = await db
        .select()
        .from(assetLists)
        .where(eq(assetLists.userId, assetList.userId))
        .orderBy(desc(assetLists.createdAt));
      
      if (otherLists.length > 0) {
        await db
          .update(assetLists)
          .set({ isDefault: true })
          .where(eq(assetLists.id, otherLists[0].id));
      }
    }
  }

  async setDefaultAssetList(userId: number, assetListId: number): Promise<AssetList> {
    // First, unset any existing default lists for this user
    await db
      .update(assetLists)
      .set({ isDefault: false })
      .where(eq(assetLists.userId, userId));
    
    // Then, set the specified list as default
    const [result] = await db
      .update(assetLists)
      .set({ isDefault: true })
      .where(eq(assetLists.id, assetListId))
      .returning();
    
    if (!result) {
      throw new Error(`Asset list not found with ID: ${assetListId}`);
    }
    
    return result;
  }

  // Trading Signal methods
  async createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal> {
    const [newSignal] = await db.insert(tradingSignals)
      .values(signal)
      .returning();
    return newSignal;
  }

  async getTradingSignal(id: number): Promise<TradingSignal | undefined> {
    const [signal] = await db.select()
      .from(tradingSignals)
      .where(eq(tradingSignals.id, id));
    return signal;
  }

  async getAllTradingSignals(options?: { limit?: number, includeExpired?: boolean }): Promise<TradingSignal[]> {
    const query = db.select()
      .from(tradingSignals)
      .orderBy(desc(tradingSignals.createdAt));
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    
    return await query;
  }

  async getFreeTradingSignals(options?: { limit?: number }): Promise<TradingSignal[]> {
    const query = db.select()
      .from(tradingSignals)
      .where(eq(tradingSignals.isPremium, false))
      .orderBy(desc(tradingSignals.createdAt));
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    
    try {
      return await query;
    } catch (error) {
      console.error("Error in getFreeTradingSignals:", error);
      return []; // Return empty array rather than error to avoid breaking the app
    }
  }

  async getPremiumTradingSignals(options?: { limit?: number }): Promise<TradingSignal[]> {
    const query = db.select()
      .from(tradingSignals)
      .where(eq(tradingSignals.isPremium, true))
      .orderBy(desc(tradingSignals.createdAt));
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    
    try {
      return await query;
    } catch (error) {
      console.error("Error in getPremiumTradingSignals:", error);
      return []; // Return empty array rather than error to avoid breaking the app
    }
  }

  async getUserTradingSignals(userId: number): Promise<TradingSignal[]> {
    return await db.select()
      .from(tradingSignals)
      .where(eq(tradingSignals.providerId, userId))
      .orderBy(desc(tradingSignals.createdAt));
  }

  async getProviderTradingSignals(providerId: number): Promise<TradingSignal[]> {
    try {
      return await db.select()
        .from(tradingSignals)
        .where(eq(tradingSignals.providerId, providerId))
        .orderBy(desc(tradingSignals.createdAt));
    } catch (error) {
      console.error("Error getting provider trading signals:", error);
      return []; // Return empty array to avoid breaking the app
    }
  }

  async updateTradingSignal(id: number, updates: Partial<InsertTradingSignal>): Promise<TradingSignal> {
    const [updatedSignal] = await db.update(tradingSignals)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(tradingSignals.id, id))
      .returning();
    return updatedSignal;
  }

  async deleteTradingSignal(id: number): Promise<void> {
    await db.delete(tradingSignals)
      .where(eq(tradingSignals.id, id));
  }

  // Signal Subscription methods
  async createSignalSubscription(subscription: InsertSignalSubscription): Promise<SignalSubscription> {
    const [newSubscription] = await db.insert(signalSubscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }

  async getUserSignalSubscriptions(userId: number): Promise<SignalSubscription[]> {
    return await db.select()
      .from(signalSubscriptions)
      .where(eq(signalSubscriptions.userId, userId))
      .orderBy(desc(signalSubscriptions.createdAt));
  }

  async getProviderSubscribers(providerId: number): Promise<SignalSubscription[]> {
    return await db.select()
      .from(signalSubscriptions)
      .where(eq(signalSubscriptions.providerId, providerId))
      .orderBy(desc(signalSubscriptions.createdAt));
  }

  async updateSignalSubscription(id: number, updates: Partial<InsertSignalSubscription>): Promise<SignalSubscription> {
    const [updatedSubscription] = await db.update(signalSubscriptions)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(signalSubscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  async cancelSignalSubscription(id: number): Promise<SignalSubscription> {
    const [cancelledSubscription] = await db.update(signalSubscriptions)
      .set({
        status: 'cancelled',
        updatedAt: new Date()
      })
      .where(eq(signalSubscriptions.id, id))
      .returning();
    return cancelledSubscription;
  }

  // Provider Earnings methods
  async createProviderEarning(earning: InsertProviderEarnings): Promise<ProviderEarnings> {
    const [newEarning] = await db.insert(providerEarnings)
      .values(earning)
      .returning();
    return newEarning;
  }
  
  async getProviderEarnings(providerId: number, status?: string): Promise<ProviderEarnings[]> {
    let query = db.select()
      .from(providerEarnings)
      .where(eq(providerEarnings.providerId, providerId));
    
    if (status) {
      query = query.where(eq(providerEarnings.status, status));
    }
    
    return await query.orderBy(desc(providerEarnings.createdAt));
  }
  
  async getProviderEarningsSummary(providerId: number): Promise<{
    availableBalance: number;
    pendingBalance: number;
    totalEarned: number;
    totalFees: number;
  }> {
    const earnings = await this.getProviderEarnings(providerId);
    
    return earnings.reduce((summary, earning) => {
      // Add to total earned and fees regardless of status
      summary.totalEarned += earning.grossAmount;
      summary.totalFees += earning.feeAmount;
      
      // Add to available balance if status is 'available'
      if (earning.status === 'available') {
        summary.availableBalance += earning.netAmount;
      }
      
      // Add to pending balance if status is 'pending_payout'
      if (earning.status === 'pending_payout') {
        summary.pendingBalance += earning.netAmount;
      }
      
      return summary;
    }, {
      availableBalance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      totalFees: 0
    });
  }
  
  async updateProviderEarningStatus(ids: number[], newStatus: string): Promise<ProviderEarnings[]> {
    const updatedEarnings = await db
      .update(providerEarnings)
      .set({
        status: newStatus,
        updatedAt: new Date()
      })
      .where(inArray(providerEarnings.id, ids))
      .returning();
    
    return updatedEarnings;
  }
  
  async recordProviderEarning(
    providerId: number, 
    subscriptionId: number, 
    amount: number, 
    currency: string = 'GBP'
  ): Promise<ProviderEarnings> {
    // Calculate the platform fee (15%)
    const feePercentage = 15;
    const feeAmount = Math.round(amount * (feePercentage / 100));
    const netAmount = amount - feeAmount;
    
    // Create the earning record
    const earning = await this.createProviderEarning({
      providerId,
      subscriptionId,
      grossAmount: amount,
      feePercentage,
      feeAmount,
      netAmount,
      currency,
      status: 'available',
      earnedAt: new Date()
    });
    
    return earning;
  }
  
  // Signal Payout methods
  async createSignalPayout(payout: InsertSignalPayout): Promise<SignalPayout> {
    const [newPayout] = await db.insert(signalPayouts)
      .values(payout)
      .returning();
    return newPayout;
  }

  async getProviderPayouts(providerId: number): Promise<SignalPayout[]> {
    return await db.select()
      .from(signalPayouts)
      .where(eq(signalPayouts.providerId, providerId))
      .orderBy(desc(signalPayouts.createdAt));
  }

  async updateSignalPayout(id: number, updates: Partial<InsertSignalPayout>): Promise<SignalPayout> {
    const [updatedPayout] = await db.update(signalPayouts)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(signalPayouts.id, id))
      .returning();
    return updatedPayout;
  }
  
  async requestPayout(providerId: number, amount: number): Promise<SignalPayout> {
    // Get available balance
    const summary = await this.getProviderEarningsSummary(providerId);
    
    if (summary.availableBalance < amount) {
      throw new Error(`Insufficient available balance. Available: £${(summary.availableBalance / 100).toFixed(2)}`);
    }
    
    // Create a payout request
    const payout = await this.createSignalPayout({
      providerId,
      amount,
      currency: 'GBP',
      status: 'pending',
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      periodEnd: new Date()
    });
    
    // Update earnings status to pending_payout
    // We'll need to find earnings that add up to the requested amount
    const availableEarnings = await this.getProviderEarnings(providerId, 'available');
    let remainingAmount = amount;
    const earningIdsToUpdate: number[] = [];
    
    for (const earning of availableEarnings) {
      if (remainingAmount <= 0) break;
      
      // Take as much as needed from this earning
      earningIdsToUpdate.push(earning.id);
      remainingAmount -= earning.netAmount;
    }
    
    // Update the earnings status
    if (earningIdsToUpdate.length > 0) {
      await this.updateProviderEarningStatus(earningIdsToUpdate, 'pending_payout');
    }
    
    return payout;
  }
  
  // Provider Rating methods
  async getUserRating(userId: number, providerId: number): Promise<UserRating | undefined> {
    const results = await db
      .select()
      .from(userRatings)
      .where(and(
        eq(userRatings.userId, userId),
        eq(userRatings.providerId, providerId)
      ));
    
    if (results.length > 0) {
      return results[0];
    }
    
    return undefined;
  }
  
  async getProviderRatings(providerId: number): Promise<{ thumbsUp: number, thumbsDown: number }> {
    const provider = await this.getUser(providerId);
    
    if (!provider) {
      return { thumbsUp: 0, thumbsDown: 0 };
    }
    
    return {
      thumbsUp: provider.thumbsUp || 0,
      thumbsDown: provider.thumbsDown || 0
    };
  }
  
  async rateProvider(userId: number, providerId: number, isPositive: boolean): Promise<UserRating> {
    // Check if user already rated this provider
    const existingRating = await this.getUserRating(userId, providerId);
    
    if (existingRating) {
      // If the rating changed, update it
      if (existingRating.rating !== isPositive) {
        const updatedRatings = await db
          .update(userRatings)
          .set({ 
            rating: isPositive,
            updatedAt: new Date()
          })
          .where(and(
            eq(userRatings.userId, userId),
            eq(userRatings.providerId, providerId)
          ))
          .returning();
        
        // Update the provider's thumbs up/down counts
        await this.updateUserRatingCounts(providerId);
        
        return updatedRatings[0];
      }
      
      // If rating didn't change, return existing
      return existingRating;
    }
    
    // Otherwise create a new rating
    const newRatings = await db
      .insert(userRatings)
      .values({
        userId,
        providerId,
        rating: isPositive
      })
      .returning();
    
    // Update the provider's thumbs up/down counts
    await this.updateUserRatingCounts(providerId);
    
    return newRatings[0];
  }
  
  async deleteUserRating(userId: number, providerId: number): Promise<void> {
    await db
      .delete(userRatings)
      .where(and(
        eq(userRatings.userId, userId),
        eq(userRatings.providerId, providerId)
      ));
    
    // Update the provider's thumbs up/down counts
    await this.updateUserRatingCounts(providerId);
  }
  
  async updateUserRatingCounts(providerId: number): Promise<void> {
    // Count positive ratings (thumbs up)
    const thumbsUpResults = await db
      .select()
      .from(userRatings)
      .where(and(
        eq(userRatings.providerId, providerId),
        eq(userRatings.rating, true)
      ));
    
    // Count negative ratings (thumbs down)
    const thumbsDownResults = await db
      .select()
      .from(userRatings)
      .where(and(
        eq(userRatings.providerId, providerId),
        eq(userRatings.rating, false)
      ));
    
    // Update the provider's user record with the new counts
    await db
      .update(users)
      .set({
        thumbsUp: thumbsUpResults.length,
        thumbsDown: thumbsDownResults.length
      })
      .where(eq(users.id, providerId));
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();
