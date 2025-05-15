import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '../shared/schema';

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Creating tables...');
  // Create analysis tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analyses (
      id SERIAL PRIMARY KEY,
      asset TEXT,
      "imageUrl" TEXT,
      patterns JSONB,
      "newsSentiment" JSONB,
      prediction JSONB,
      timestamp TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS named_analyses (
      id SERIAL PRIMARY KEY,
      name TEXT,
      result JSONB,
      "userId" INTEGER,
      timestamp TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create users table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT,
      password TEXT,
      email TEXT,
      "stripeCustomerId" TEXT,
      "stripeSubscriptionId" TEXT,
      "subscriptionStatus" TEXT,
      "subscriptionTier" TEXT,
      "subscriptionEndDate" TIMESTAMP,
      "referralCode" TEXT,
      "referralCustomName" TEXT,
      "referralBonusBalance" INTEGER DEFAULT 0,
      "createdAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create referrals table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS referrals (
      id SERIAL PRIMARY KEY,
      "referrerId" INTEGER,
      "referredId" INTEGER,
      "subscriptionPurchased" BOOLEAN DEFAULT FALSE,
      "bonusAwarded" BOOLEAN DEFAULT FALSE,
      "createdAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create asset_lists table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS asset_lists (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      "userId" INTEGER NOT NULL,
      assets JSONB NOT NULL,
      "isDefault" BOOLEAN DEFAULT FALSE,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create analysis_usage table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analysis_usage (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create trading_signals table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trading_signals (
      id SERIAL PRIMARY KEY,
      "providerId" INTEGER NOT NULL,
      title TEXT NOT NULL,
      asset TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      direction TEXT NOT NULL,
      "entryPrice" DOUBLE PRECISION NOT NULL,
      "stopLoss" DOUBLE PRECISION NOT NULL,
      "takeProfit" DOUBLE PRECISION NOT NULL,
      "riskRewardRatio" DOUBLE PRECISION NOT NULL,
      analysis TEXT,
      "imageUrl" TEXT,
      "isPremium" BOOLEAN DEFAULT FALSE,
      price DOUBLE PRECISION,
      "expiresAt" TIMESTAMP,
      status TEXT DEFAULT 'active',
      outcome TEXT,
      "actualPips" DOUBLE PRECISION,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `);
  
  // Create signal_subscriptions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS signal_subscriptions (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      "providerId" INTEGER NOT NULL,
      price DOUBLE PRECISION NOT NULL,
      status TEXT DEFAULT 'active',
      "stripeSubscriptionId" TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `);
  
  // Create signal_payouts table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS signal_payouts (
      id SERIAL PRIMARY KEY,
      "providerId" INTEGER NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      status TEXT DEFAULT 'pending',
      "payoutDate" TIMESTAMP,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Database schema has been updated successfully.');
  await pool.end();
}

main().catch((err) => {
  console.error('Error applying schema:', err);
  process.exit(1);
});