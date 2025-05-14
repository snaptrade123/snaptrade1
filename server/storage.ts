import { analysis, namedAnalysis, users, referrals, type Analysis, type NamedAnalysis, type InsertAnalysis, type InsertNamedAnalysis, type User, type InsertUser, type InsertReferral, type Referral } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

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
  getUserSubscriptionStatus(userId: number): Promise<{ active: boolean, tier?: string, endDate?: Date }>;
  
  // Referral methods
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  getUserByCustomName(customName: string): Promise<User | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  getUserReferrals(userId: number): Promise<Referral[]>;
  getUserReferralsCount(userId: number): Promise<number>;
  updateReferralStatus(referralId: number, subscriptionPurchased: boolean, bonusAwarded: boolean): Promise<Referral>;
  updateReferralCode(userId: number, customName?: string): Promise<User>;
  updateReferralBonusBalance(userId: number, amount: number): Promise<User>;
  
  // Session store
  sessionStore: session.Store;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
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
  
  async getUserSubscriptionStatus(userId: number): Promise<{ active: boolean, tier?: string, endDate?: Date }> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return { active: false };
    }
    
    // A subscription is active if it has status "active" or "trialing"
    const active = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
    
    if (!active) {
      return { active };
    }
    
    return {
      active,
      tier: user.subscriptionTier || undefined,
      endDate: user.subscriptionEndDate || undefined
    };
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
}

// Export a singleton instance
export const storage = new DatabaseStorage();
