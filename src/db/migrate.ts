import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';

export async function runMigrations() {
  // This will run migrations on the in-memory database
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migration complete');
}