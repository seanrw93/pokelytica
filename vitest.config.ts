import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirror tsconfig's "@/*" path alias.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
    // Battle-engine + calc work is CPU-bound and stateless; default pool is fine,
    // but simulator warm-up makes some tests slower than vitest's 5s default.
    testTimeout: 30_000,
  },
});
