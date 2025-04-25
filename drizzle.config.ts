import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env.local', // Load .env.local file
});

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // Use dialect instead of driver
  dbCredentials: {
    url: process.env.POSTGRES_URL!, // Use url instead of connectionString
  },
  verbose: true,
  strict: true,
});
