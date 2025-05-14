import { analysis, namedAnalysis, users, type Analysis, type NamedAnalysis, type InsertAnalysis, type InsertNamedAnalysis, type User } from "@shared/schema";

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
  
  // Stripe subscription methods
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
  updateUserSubscription(userId: number, stripeSubscriptionId: string, status: string, tier: string, endDate?: Date): Promise<User>;
  getUserSubscriptionStatus(userId: number): Promise<{ active: boolean, tier?: string, endDate?: Date }>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private analyses: Map<number, Analysis>;
  private namedAnalyses: Map<number, NamedAnalysis>;
  public users: Map<number, User>;
  private analysisId: number;
  private namedAnalysisId: number;
  private userId: number;

  constructor() {
    this.analyses = new Map();
    this.namedAnalyses = new Map();
    this.users = new Map();
    this.analysisId = 1;
    this.namedAnalysisId = 1;
    this.userId = 1;
    
    // Add a test user
    this.users.set(1, {
      id: 1,
      username: 'testuser',
      password: 'password',
      email: 'test@example.com'
    });
    this.userId = 2; // Next user will be ID 2
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.analysisId++;
    const analysis: Analysis = { ...insertAnalysis, id };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB.getTime() - dateA.getTime(); // Sort by most recent
    });
  }

  async saveNamedAnalysis(insertNamedAnalysis: InsertNamedAnalysis): Promise<NamedAnalysis> {
    const id = this.namedAnalysisId++;
    const namedAnalysis: NamedAnalysis = { ...insertNamedAnalysis, id };
    this.namedAnalyses.set(id, namedAnalysis);
    return namedAnalysis;
  }

  async getNamedAnalysis(id: number): Promise<NamedAnalysis | undefined> {
    return this.namedAnalyses.get(id);
  }

  async getNamedAnalyses(): Promise<NamedAnalysis[]> {
    return Array.from(this.namedAnalyses.values()).sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB.getTime() - dateA.getTime(); // Sort by most recent
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  // Stripe subscription methods
  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    
    const updatedUser = { ...user, stripeCustomerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserSubscription(
    userId: number, 
    stripeSubscriptionId: string, 
    status: string, 
    tier: string, 
    endDate?: Date
  ): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    
    const updatedUser = { 
      ...user, 
      stripeSubscriptionId,
      subscriptionStatus: status,
      subscriptionTier: tier,
      subscriptionEndDate: endDate || null
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getUserSubscriptionStatus(userId: number): Promise<{ active: boolean, tier?: string, endDate?: Date }> {
    const user = this.users.get(userId);
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
export const storage = new MemStorage();
