import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { LibsqlClient } from "@libsql/client";
import * as schema from "./schema";

// Lazy initialization to avoid Edge Runtime issues
let _client: LibsqlClient | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

// Database connection using libSQL (no native compilation needed)
function getClient() {
  if (!_client) {
    _client = createClient({
      url: process.env.DATABASE_URL || "file:./data/archivia.db",
    });
  }
  return _client;
}

// Get Drizzle instance (lazy initialization)
function getDb() {
  if (!_db) {
    _db = drizzle(getClient(), { schema });
  }
  return _db;
}

// Export lazy getter as db for backward compatibility
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    return (getDb() as any)[prop];
  },
});

// Export schema for use in other packages
export * from "./schema";

// Export types
export type Database = ReturnType<typeof getDb>;

// Export client getter for direct access if needed
export const client = new Proxy({} as LibsqlClient, {
  get(target, prop) {
    return (getClient() as any)[prop];
  },
});
