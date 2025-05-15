import { analysis, namedAnalysis, users, referrals, assetLists, analysisUsage, type Analysis, type NamedAnalysis, type InsertAnalysis, type InsertNamedAnalysis, type User, type InsertUser, type InsertReferral, type Referral, type AssetList, type InsertAssetList, type AnalysisUsage, type InsertAnalysisUsage } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
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
}

// Export a singleton instance
export const storage = new DatabaseStorage();
