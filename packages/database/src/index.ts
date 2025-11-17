import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Database connection using libSQL (no native compilation needed)
const client = createClient({
  url: process.env.DATABASE_URL || "file:./data/archivia.db",
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in other packages
export * from "./schema";

// Export types
export type Database = typeof db;

// Export client for direct access if needed
export { client };
