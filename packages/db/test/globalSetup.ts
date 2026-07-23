import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertTestDatabaseUrl } from "./assertTestDatabase";
import { loadTestEnv } from "./loadTestEnv";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Runs once before the db project's test files: pushes the current Prisma
// schema onto the test database, resetting it so tests never depend on
// leftover state from a previous run. Safe to run unattended (CI) because
// assertTestDatabaseUrl fails loudly instead of prompting if DATABASE_URL
// doesn't point at the dedicated test container.
export default async () => {
  loadTestEnv();
  assertTestDatabaseUrl(process.env.DATABASE_URL);

  execSync("npx prisma db push --force-reset --accept-data-loss --skip-generate", {
    cwd: path.join(dirname, ".."),
    stdio: "inherit",
  });
};
