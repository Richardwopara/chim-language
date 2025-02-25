import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { log } from "./vite";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000 // 5 second timeout
});

// Add error handler for the pool
pool.on('error', (err) => {
  log(`Unexpected database pool error: ${err.message}`, 'database');
});

// Test the database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    log('Successfully connected to database', 'database');
    client.release();
    return true;
  } catch (error) {
    log(`Failed to connect to database: ${error.message}`, 'database');
    return false;
  }
}

export const db = drizzle({ client: pool, schema });

// Initial connection test
testConnection().catch((error) => {
  console.error('Initial database connection test failed:', error);
  process.exit(1);
});