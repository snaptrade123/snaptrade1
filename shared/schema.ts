import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Pattern detection
const patternDetectionSchema = z.object({
  name: z.string(),
  type: z.enum(['bullish', 'bearish', 'neutral']),
  confidence: z.number().min(0).max(100),
});

// News article
const newsArticleSchema = z.object({
  title: z.string(),
  source: z.string(),
  time: z.string(),
  summary: z.string(),
  sentiment: z.number().min(-1).max(1),
  url: z.string().optional(),
});

// News sentiment
const newsSentimentSchema = z.object({
  score: z.number().min(-1).max(1),
  articles: z.array(newsArticleSchema),
});

// Trading Recommendation
const tradingRecommendationSchema = z.object({
  entryPrice: z.number().nullable().optional(),
  stopLoss: z.number().nullable().optional(),
  takeProfit: z.number().nullable().optional(),
  entryCondition: z.string().optional(),
  timeframe: z.string().optional(),
  riskRewardRatio: z.number().nullable().optional(),
});

// Prediction
const predictionSchema = z.object({
  direction: z.enum(['bullish', 'bearish', 'neutral']),
  confidence: z.number().min(0).max(100),
  explanation: z.string(),
  weights: z.object({
    technical: z.number().min(0).max(100),
    news: z.number().min(0).max(100),
  }),
  tradingRecommendation: tradingRecommendationSchema.optional(),
});

// Analysis result
export const analysis = pgTable("analyses", {
  id: serial("id").primaryKey(),
  asset: text("asset").notNull(),
  imageUrl: text("image_url").notNull(),
  patterns: jsonb("patterns").$type<z.infer<typeof patternDetectionSchema>[]>().notNull(),
  newsSentiment: jsonb("news_sentiment").$type<z.infer<typeof newsSentimentSchema>>().notNull(),
  prediction: jsonb("prediction").$type<z.infer<typeof predictionSchema>>().notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Named saved analysis
export const namedAnalysis = pgTable("named_analyses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  notes: text("notes"),
  result: jsonb("result").$type<z.infer<typeof analysisSchema>>().notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Create schemas
export const analysisSchema = createInsertSchema(analysis).omit({ id: true });
export const namedAnalysisSchema = createInsertSchema(namedAnalysis).omit({ id: true });

// Types
export type InsertAnalysis = z.infer<typeof analysisSchema>;
export type Analysis = typeof analysis.$inferSelect;

export type InsertNamedAnalysis = z.infer<typeof namedAnalysisSchema>;
export type NamedAnalysis = typeof namedAnalysis.$inferSelect;

// Base user schema (keep as required by the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"),
  subscriptionTier: text("subscription_tier"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  referralCode: text("referral_code").unique(),
  referralCustomName: text("referral_custom_name"),
  referralBonusBalance: integer("referral_bonus_balance").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Referrals table to track who referred whom
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  referredId: integer("referred_id").notNull().unique().references(() => users.id),
  bonusAwarded: boolean("bonus_awarded").default(false),
  subscriptionPurchased: boolean("subscription_purchased").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
}).extend({
  referredBy: z.string().optional(),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({ 
  id: true, 
  createdAt: true 
});

// Custom Asset Lists
export const assetLists = pgTable("asset_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  assets: jsonb("assets").$type<{ type: string, value: string, label: string }[]>().notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAssetListSchema = createInsertSchema(assetLists).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertAssetList = z.infer<typeof insertAssetListSchema>;
export type AssetList = typeof assetLists.$inferSelect;
