import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "web",
          root: "./apps/web",
          environment: "node",
          include: ["**/*.test.ts", "**/*.test.tsx"],
        },
      },
      {
        test: {
          name: "api",
          root: "./apps/api",
          environment: "node",
          include: ["**/*.test.ts"],
          setupFiles: [
            "../../packages/db/test/setup.ts",
            "./test/setupEnv.ts",
            "./test/mockGroq.ts",
          ],
        },
      },
      {
        test: {
          name: "db",
          root: "./packages/db",
          environment: "node",
          include: ["**/*.test.ts"],
          setupFiles: ["./test/setup.ts"],
        },
      },
    ],
  },
});
