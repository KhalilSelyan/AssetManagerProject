import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

import path from "path";
import { fileURLToPath } from "url";

// Get the directory path of the current module
const __sdirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from the db package directory
config({ path: path.resolve(__sdirname, "../../../.env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}
const connectionString = process.env.DATABASE_URL;

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  strict: true,
  verbose: true,
});
