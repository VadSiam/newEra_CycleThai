import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();

export default {
  schema: './src/db/index.ts',
  out: './drizzle',
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_URL || 'sqlite.db',
  },
} satisfies Config;