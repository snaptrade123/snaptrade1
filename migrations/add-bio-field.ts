import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log('Adding bio field to users table...');
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));