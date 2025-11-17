import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Ensure data directory exists
  const dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = process.env.DATABASE_URL || "./data/archivia.db";
  console.log(`Migrating database at: ${dbPath}`);

  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  console.log("Running migrations...");

  migrate(db, { migrationsFolder: "./drizzle" });

  console.log("Migrations completed successfully!");
  sqlite.close();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
