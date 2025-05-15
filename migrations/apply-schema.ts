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
      provider_id INTEGER NOT NULL,
      pair TEXT NOT NULL,
      direction TEXT NOT NULL, 
      entry TEXT NOT NULL,
      stop_loss TEXT NOT NULL,
      take_profit_1 TEXT NOT NULL,
      take_profit_2 TEXT,
      take_profit_3 TEXT,
      timeframe TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
      is_premium BOOLEAN DEFAULT FALSE NOT NULL,
      price INTEGER
    );
  `);
  
  // Create signal_subscriptions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS signal_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      stripe_subscription_id TEXT,
      status TEXT NOT NULL,
      start_date TIMESTAMP DEFAULT NOW() NOT NULL,
      end_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);
  
  // Create signal_payouts table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS signal_payouts (
      id SERIAL PRIMARY KEY,
      provider_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'GBP' NOT NULL,
      stripe_transfer_id TEXT,
      status TEXT NOT NULL,
      period_start TIMESTAMP NOT NULL,
      period_end TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  console.log('Database schema has been updated successfully.');
  await pool.end();
}

main().catch((err) => {
  console.error('Error applying schema:', err);
  process.exit(1);
});