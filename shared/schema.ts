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
  thumbsUp: integer("thumbs_up").default(0).notNull(),
  thumbsDown: integer("thumbs_down").default(0).notNull(),
  bio: text("bio"),
  isProvider: boolean("is_provider").default(false),
  providerDisplayName: text("provider_display_name"),
  signalFee: integer("signal_fee"), // Monthly subscription fee in pence/cents
  isAdmin: boolean("is_admin").default(false),
  adminPermissions: jsonb("admin_permissions").$type<string[]>().default([]),
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

// Analysis Usage tracking
export const analysisUsage = pgTable("analysis_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow().notNull(),
  count: integer("count").default(1).notNull(),
});

export const insertAnalysisUsageSchema = createInsertSchema(analysisUsage).omit({
  id: true,
});

export type InsertAnalysisUsage = z.infer<typeof insertAnalysisUsageSchema>;
export type AnalysisUsage = typeof analysisUsage.$inferSelect;

// Trading Signals - Updated to match actual database structure
export const tradingSignals = pgTable("trading_signals", {
  id: serial("id").primaryKey(),
  providerId: integer("providerId").notNull().references(() => users.id),
  title: text("title"),
  asset: text("asset"),
  timeframe: text("timeframe").notNull(),
  direction: text("direction").notNull(), // 'buy' or 'sell'
  entryPrice: integer("entryPrice"),
  stopLoss: integer("stopLoss"),
  takeProfit: integer("takeProfit"),
  riskRewardRatio: integer("riskRewardRatio"),
  analysis: text("analysis"),
  imageUrl: text("imageUrl"),
  isPremium: boolean("isPremium").default(false).notNull(),
  price: integer("price"), // Monthly subscription price in pence/cents
  expiresAt: timestamp("expiresAt"),
  status: text("status"),
  outcome: text("outcome"),
  actualPips: integer("actualPips"),
  isEdited: boolean("isEdited").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const insertTradingSignalSchema = createInsertSchema(tradingSignals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Signal Subscriptions for premium signals
export const signalSubscriptions = pgTable("signal_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => users.id),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull(), // 'active', 'cancelled', 'past_due'
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSignalSubscriptionSchema = createInsertSchema(signalSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Provider Earnings to track revenue from signal subscriptions
export const providerEarnings = pgTable("provider_earnings", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => users.id),
  subscriptionId: integer("subscription_id").references(() => signalSubscriptions.id),
  grossAmount: integer("gross_amount").notNull(), // Total amount before fee in pence/cents
  feePercentage: integer("fee_percentage").default(15).notNull(), // Platform fee percentage
  feeAmount: integer("fee_amount").notNull(), // Amount of fee in pence/cents
  netAmount: integer("net_amount").notNull(), // Amount after fee in pence/cents
  currency: text("currency").default("GBP").notNull(),
  status: text("status").notNull(), // 'available', 'pending_payout', 'paid_out'
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProviderEarningsSchema = createInsertSchema(providerEarnings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Signal Payouts to track payments to signal providers
export const signalPayouts = pgTable("signal_payouts", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // Amount in pence/cents
  currency: text("currency").default("GBP").notNull(),
  stripeTransferId: text("stripe_transfer_id"), 
  status: text("status").notNull(), // 'pending', 'paid', 'failed'
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSignalPayoutSchema = createInsertSchema(signalPayouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTradingSignal = z.infer<typeof insertTradingSignalSchema>;
export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertSignalSubscription = z.infer<typeof insertSignalSubscriptionSchema>;
export type SignalSubscription = typeof signalSubscriptions.$inferSelect;
export type InsertProviderEarnings = z.infer<typeof insertProviderEarningsSchema>;
export type ProviderEarnings = typeof providerEarnings.$inferSelect;
export type InsertSignalPayout = z.infer<typeof insertSignalPayoutSchema>;
export type SignalPayout = typeof signalPayouts.$inferSelect;

// User ratings table for signal providers
export const userRatings = pgTable("user_ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => users.id),
  rating: boolean("is_positive").notNull(), // true = thumbs up, false = thumbs down
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserRatingSchema = createInsertSchema(userRatings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserRating = z.infer<typeof insertUserRatingSchema>;
export type UserRating = typeof userRatings.$inferSelect;

// Market alerts and watchlists
export const marketAlerts = pgTable("market_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  asset: text("asset").notNull(), // e.g., "BTC/USD", "AAPL", "EUR/USD"
  assetType: text("asset_type").notNull(), // forex, stocks, crypto, etc.
  alertType: text("alert_type").notNull(), // price, technical, volume, news
  condition: text("condition").notNull(), // above, below, crosses, pattern_formed
  targetValue: text("target_value"), // price level, pattern name, etc.
  currentValue: text("current_value"), // last known value
  message: text("message"), // custom alert message
  isActive: boolean("is_active").default(true).notNull(),
  isTriggered: boolean("is_triggered").default(false).notNull(),
  triggeredAt: timestamp("triggered_at"),
  expiresAt: timestamp("expires_at"), // optional expiration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  assets: jsonb("assets").notNull().$type<Array<{
    value: string;
    label: string;
    type: string;
  }>>(),
  alertsEnabled: boolean("alerts_enabled").default(true).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Economic calendar events
export const economicEvents = pgTable("economic_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  country: text("country").notNull(),
  currency: text("currency"), // affected currency
  impact: text("impact").notNull(), // low, medium, high
  eventTime: timestamp("event_time").notNull(),
  forecast: text("forecast"), // expected value
  previous: text("previous"), // previous value
  actual: text("actual"), // actual value when released
  description: text("description"),
  category: text("category"), // employment, inflation, gdp, etc.
  source: text("source"), // data provider
  affectedAssets: jsonb("affected_assets").$type<string[]>(), // assets that might be impacted
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Risk calculations and settings
export const riskProfiles = pgTable("risk_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  accountSize: text("account_size").notNull(), // encrypted account balance
  riskPercentage: integer("risk_percentage").default(2).notNull(), // % of account to risk per trade
  maxDailyLoss: integer("max_daily_loss_percentage").default(5).notNull(),
  maxPositions: integer("max_positions").default(3).notNull(),
  preferredTimeframes: jsonb("preferred_timeframes").$type<string[]>(),
  tradingStyle: text("trading_style"), // scalping, day_trading, swing, position
  experienceLevel: text("experience_level"), // beginner, intermediate, advanced, expert
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketAlertSchema = createInsertSchema(marketAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEconomicEventSchema = createInsertSchema(economicEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRiskProfileSchema = createInsertSchema(riskProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMarketAlert = z.infer<typeof insertMarketAlertSchema>;
export type MarketAlert = typeof marketAlerts.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlists.$inferSelect;
export type InsertEconomicEvent = z.infer<typeof insertEconomicEventSchema>;
export type EconomicEvent = typeof economicEvents.$inferSelect;
export type InsertRiskProfile = z.infer<typeof insertRiskProfileSchema>;
export type RiskProfile = typeof riskProfiles.$inferSelect;

// Admin Actions Log
export const adminActions = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(), // e.g., "viewed_user", "updated_subscription", "deleted_signal"
  targetType: text("target_type").notNull(), // e.g., "user", "trading_signal", "subscription"
  targetId: integer("target_id"), // ID of the affected entity
  details: jsonb("details").$type<Record<string, any>>(), // Additional context
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminActionSchema = createInsertSchema(adminActions).omit({ 
  id: true, 
  createdAt: true 
});

export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;
export type AdminAction = typeof adminActions.$inferSelect;
