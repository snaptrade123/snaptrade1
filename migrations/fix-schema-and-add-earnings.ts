import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log('🔧 Starting database migrations...');

  // Check if provider_earnings table exists
  try {
    console.log('Checking if provider_earnings table exists...');
    await db.execute(`
      SELECT 1 FROM provider_earnings LIMIT 1;
    `);
    console.log('✓ provider_earnings table already exists');
  } catch (error) {
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
  }

  // Check the schema of trading_signals table
  console.log('Checking trading_signals table schema...');
  const columns = await db.execute(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'trading_signals';
  `);

  // Check if we need to rename providerId to provider_id
  let hasProviderId = false;
  let hasProviderIdColumn = false;

  columns.rows.forEach((row: any) => {
    if (row.column_name === 'providerId') {
      hasProviderId = true;
    }
    if (row.column_name === 'provider_id') {
      hasProviderIdColumn = true;
    }
  });

  if (hasProviderId && !hasProviderIdColumn) {
    console.log('Renaming providerId to provider_id...');
    await db.execute(`
      ALTER TABLE trading_signals 
      RENAME COLUMN "providerId" TO provider_id;
    `);
    console.log('✓ Renamed providerId to provider_id');
  } else if (!hasProviderId && !hasProviderIdColumn) {
    console.log('Creating provider_id column...');
    await db.execute(`
      ALTER TABLE trading_signals 
      ADD COLUMN provider_id INTEGER REFERENCES users(id);
    `);
    console.log('✓ Created provider_id column');
  } else {
    console.log('✓ provider_id column already exists');
  }

  // Add price column with default value if it doesn't exist
  let hasPriceColumn = false;

  columns.rows.forEach((row: any) => {
    if (row.column_name === 'price') {
      hasPriceColumn = true;
    }
  });

  if (!hasPriceColumn) {
    console.log('Adding price column to trading_signals...');
    await db.execute(`
      ALTER TABLE trading_signals 
      ADD COLUMN price INTEGER DEFAULT 0;
    `);
    console.log('✓ Added price column');
  } else {
    console.log('✓ price column already exists');
  }

  console.log('✅ Database migrations completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });