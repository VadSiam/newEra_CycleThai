import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { desc, eq } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

dotenv.config();

interface Activity {
  id: string;
  name: string;
  distance: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: Date;
  type: string;
}

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

export async function getActivitiesFromDB(userId: string): Promise<Activity[]> {
  // Using Drizzle ORM
  const dbActivities = await db
    .select()
    .from(activities)
    .where(eq(activities.userId, userId))
    .orderBy(desc(activities.start_date));

  return dbActivities.map((activity) => ({
    id: activity.id,
    name: activity.name,
    distance: +(activity.distance),
    elapsed_time: +(activity.elapsed_time),
    total_elevation_gain: +(activity.total_elevation_gain),
    start_date: activity.start_date as Date,
    type: activity.type
  }));
}

export async function saveActivitiesToDB(userId: string, activities: Activity[]): Promise<void> {
  const activitiesToInsert = activities.map(activity => ({
    id: activity.id,
    user_id: userId,
    name: activity.name,
    distance: activity.distance,
    elapsed_time: activity.elapsed_time,
    total_elevation_gain: activity.total_elevation_gain,
    start_date: activity.start_date,
    type: activity.type
  }));

  const { error } = await supabase
    .from('activities')
    .upsert(activitiesToInsert, {
      onConflict: 'id'  // This ensures we don't duplicate activities
    });

  if (error) {
    console.error('Error saving activities to DB:', error);
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

// Also need to add the activities table definition to match other tables:
export const activities = pgTable('activities', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  distance: text('distance').notNull(),
  elapsed_time: text('elapsed_time').notNull(),
  total_elevation_gain: text('total_elevation_gain').notNull(),
  start_date: timestamp('start_date').notNull(),
  type: text('type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});