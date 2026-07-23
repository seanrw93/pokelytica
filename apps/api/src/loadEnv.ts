import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(dirname, "..", ".env");

if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}
