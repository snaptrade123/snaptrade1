import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Adding market alerts, watchlists, economic events, and risk profiles...");

  // Create market_alerts table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "market_alerts" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL REFERENCES "users"("id"),
      "asset" text NOT NULL,
      "asset_type" text NOT NULL,
      "alert_type" text NOT NULL,
      "condition" text NOT NULL,
      "target_value" text,
      "current_value" text,
      "message" text,
      "is_active" boolean DEFAULT true NOT NULL,
      "is_triggered" boolean DEFAULT false NOT NULL,
      "triggered_at" timestamp,
      "expires_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  // Create watchlists table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "watchlists" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL REFERENCES "users"("id"),
      "name" text NOT NULL,
      "assets" jsonb NOT NULL,
      "alerts_enabled" boolean DEFAULT true NOT NULL,
      "is_default" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  // Create economic_events table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "economic_events" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" text NOT NULL,
      "country" text NOT NULL,
      "currency" text,
      "impact" text NOT NULL,
      "event_time" timestamp NOT NULL,
      "forecast" text,
      "previous" text,
      "actual" text,
      "description" text,
      "category" text,
      "source" text,
      "affected_assets" jsonb,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  // Create risk_profiles table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "risk_profiles" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL REFERENCES "users"("id"),
      "account_size" text NOT NULL,
      "risk_percentage" integer DEFAULT 2 NOT NULL,
      "max_daily_loss_percentage" integer DEFAULT 5 NOT NULL,
      "max_positions" integer DEFAULT 3 NOT NULL,
      "preferred_timeframes" jsonb,
      "trading_style" text,
      "experience_level" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  console.log("✅ Market alerts and advanced features tables created successfully!");
}

main().catch(console.error);