import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

const runMigrate = async () => {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('Error: POSTGRES_URL environment variable is not set.');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    const migrationClient = postgres(connectionString, { max: 1 });
    const db = drizzle(migrationClient);

    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: 'drizzle' });

    console.log('Migrations applied successfully!');
    await migrationClient.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrate();
