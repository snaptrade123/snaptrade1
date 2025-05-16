import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Starting migration: Adding provider fields to users table');

    // Add is_provider column
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_provider BOOLEAN DEFAULT FALSE
    `);
    console.log('Added is_provider column');

    // Add provider_display_name column
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS provider_display_name TEXT
    `);
    console.log('Added provider_display_name column');

    // Add signal_fee column
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS signal_fee INTEGER
    `);
    console.log('Added signal_fee column');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

main();