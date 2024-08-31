import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';

// This will run migrations on the database, creating tables if they don't exist.
migrate(db, { migrationsFolder: './drizzle' });

console.log('Migration complete');