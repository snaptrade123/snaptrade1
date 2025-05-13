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

// Prediction
const predictionSchema = z.object({
  direction: z.enum(['bullish', 'bearish', 'neutral']),
  confidence: z.number().min(0).max(100),
  explanation: z.string(),
  weights: z.object({
    technical: z.number().min(0).max(100),
    news: z.number().min(0).max(100),
  }),
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
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
