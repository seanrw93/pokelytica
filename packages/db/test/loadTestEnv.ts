import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Locally, .env.test (gitignored) points at the dockerized test Postgres.
// In CI, no .env.test exists — the workflow sets DATABASE_URL directly instead.
export const loadTestEnv = () => {
  const envTestPath = path.join(dirname, "..", ".env.test");

  if (existsSync(envTestPath)) {
    process.loadEnvFile(envTestPath);
  }
};
