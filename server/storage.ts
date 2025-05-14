import { analysis, namedAnalysis, users, type Analysis, type NamedAnalysis, type InsertAnalysis, type InsertNamedAnalysis, type User, type InsertUser } from "@shared/schema";
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
}

// Export a singleton instance
export const storage = new DatabaseStorage();
