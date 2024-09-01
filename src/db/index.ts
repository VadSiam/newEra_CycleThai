import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Complete User interface
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  stravaId: string | null;
  lastActivityRecordDate?: Date | null;
}

dotenv.config();

// Define the users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  stravaId: text('strava_id').unique(),
  lastActivityRecordDate: integer('last_activity_record_date', { mode: 'timestamp' }),
  // Add more fields as needed
});

// Create a database connection
const sqlite = new Database(process.env.DB_URL?.replace('file:', '') || 'sqlite.db');
export const db = drizzle(sqlite);

// Define the climbing efforts table
export const climbingEfforts = sqliteTable('climbing_efforts', {
  id: integer('id').primaryKey(),
  userId: text('user_id').notNull(),
  stravaId: text('strava_id').notNull(),
  effortData: text('effort_data').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export async function updateUserLastActivityDate(userId: string, lastActivityDate: Date): Promise<void> {
  await db.update(users)
    .set({ lastActivityRecordDate: lastActivityDate })
    .where(sql`${users.id} = ${userId}`);
}

export async function getUserById(userId: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(sql`${users.id} = ${userId}`).limit(1);
  return result[0];
}