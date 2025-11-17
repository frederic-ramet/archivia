import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "libsql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:./data/archivia.db",
  },
});
