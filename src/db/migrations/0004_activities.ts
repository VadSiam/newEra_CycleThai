import { sql } from 'drizzle-orm';

export const up = sql`
  CREATE TABLE IF NOT EXISTS "activities" (
    "id" text PRIMARY KEY,
    "user_id" text NOT NULL REFERENCES "users"("id"),
    "name" text NOT NULL,
    "distance" text NOT NULL,
    "elapsed_time" text NOT NULL,
    "total_elevation_gain" text NOT NULL,
    "start_date" timestamp NOT NULL,
    "type" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  );

  CREATE INDEX IF NOT EXISTS "idx_activities_user_id" ON "activities"("user_id");
  CREATE INDEX IF NOT EXISTS "idx_activities_start_date" ON "activities"("start_date");
`;

export const down = sql`DROP TABLE IF EXISTS "activities";`;