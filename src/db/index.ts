import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { count } from 'drizzle-orm'; // Import count aggregate
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Use this object to send drizzle queries to your DB
export const db = drizzle(sql, { schema });

// Optional: Check if the connection is successful
async function checkConnection() {
  try {
    // A simple query to verify connection using count()
    const result = await db.select({ value: count() }).from(schema.tasks).limit(1);
    console.log('Database connection successful. Count result:', result);
  } catch (error) {
    console.error('Database connection failed:', error);
    // Optionally re-throw or handle as needed
    // process.exit(1); // Exit if connection is critical for startup
  }
}

// Call the check function - might want to remove this in production/non-debug scenarios
// checkConnection();
