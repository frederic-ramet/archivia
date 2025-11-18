import "@testing-library/jest-dom";
import path from "path";

// Configure environment variables for tests
process.env.DATABASE_URL = `file:${path.resolve(__dirname, "../../../packages/database/data/archivia.db")}`;
process.env.AUTH_SECRET = "test-secret-key-32-characters-minimum-length";
process.env.NODE_ENV = "test";
