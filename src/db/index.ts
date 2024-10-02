import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

dotenv.config();

// Complete User interface
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  stravaId: string | null;
  lastActivityRecordDate?: Date | null;
}

// Define the users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  stravaId: text('strava_id').unique(),
  lastActivityRecordDate: timestamp('last_activity_record_date'),
});

// Create a Supabase client
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Create a Postgres connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

// Create a Drizzle ORM instance
export const db = drizzle(client);

// Define the climbing efforts table
export const climbingEfforts = pgTable('climbing_efforts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  stravaId: text('strava_id').notNull(),
  effortData: text('effort_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export Supabase client for other uses
export { supabase };


export async function updateUserLastActivityDate(userId: string, lastActivityDate: Date): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ last_activity_record_date: lastActivityDate.toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user last activity date:', error);
    throw error;
  }
}

export async function getUserById(userId: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user by ID:', error);
    return undefined;
  }

  if (data) {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      stravaId: data.strava_id,
      lastActivityRecordDate: data.last_activity_record_date ? new Date(data.last_activity_record_date) : null,
    };
  }

  return undefined;
}