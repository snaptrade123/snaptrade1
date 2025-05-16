import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import 'dotenv/config';
import ws from 'ws';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure Neon to use the WebSocket constructor
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log('🔧 Starting database migrations...');

  try {
    console.log('Creating provider_earnings table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS provider_earnings (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER NOT NULL REFERENCES users(id),
        subscription_id INTEGER REFERENCES signal_subscriptions(id),
        gross_amount INTEGER NOT NULL,
        fee_percentage INTEGER NOT NULL DEFAULT 15,
        fee_amount INTEGER NOT NULL,
        net_amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'GBP',
        status TEXT NOT NULL,
        earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ provider_earnings table created');

    console.log('Creating signal_payouts table if it doesn\'t exist...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS signal_payouts (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER NOT NULL REFERENCES users(id),
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'GBP',
        stripe_transfer_id TEXT,
        status TEXT NOT NULL,
        period_start TIMESTAMP WITH TIME ZONE NOT NULL,
        period_end TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ signal_payouts table created');

    // Add thumbs_up and thumbs_down columns to users table
    console.log('Adding thumbs up/down columns to users table...');
    const usersColumns = await db.execute(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    
    const hasThumbsUp = usersColumns.rows.some(row => row.column_name === 'thumbs_up');
    const hasThumbsDown = usersColumns.rows.some(row => row.column_name === 'thumbs_down');
    
    if (!hasThumbsUp) {
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN thumbs_up INTEGER NOT NULL DEFAULT 0;
      `);
      console.log('✓ Added thumbs_up column to users table');
    }
    
    if (!hasThumbsDown) {
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN thumbs_down INTEGER NOT NULL DEFAULT 0;
      `);
      console.log('✓ Added thumbs_down column to users table');
    }

    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});