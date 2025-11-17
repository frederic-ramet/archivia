import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Database connection
const sqlite = new Database(process.env.DATABASE_URL || "./data/archivia.db");

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export schema for use in other packages
export * from "./schema";

// Export types
export type Database = typeof db;
