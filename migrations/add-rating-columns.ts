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
  console.log('🔧 Starting database migration: Adding rating columns...');

  try {
    // Add thumbs_up and thumbs_down columns to users table
    console.log('Adding thumbs up/down columns to users table...');
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS thumbs_up INTEGER NOT NULL DEFAULT 0;
    `);
    console.log('✓ Added thumbs_up column to users table');
    
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS thumbs_down INTEGER NOT NULL DEFAULT 0;
    `);
    console.log('✓ Added thumbs_down column to users table');

    // Create the user_ratings table
    console.log('Creating user_ratings table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        provider_id INTEGER NOT NULL REFERENCES users(id),
        is_positive BOOLEAN NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, provider_id)
      );
    `);
    console.log('✓ Created user_ratings table');

    console.log('✅ Database migration completed successfully!');
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