import { defineConfig } from "vitest/config";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(rootDir, ".")
    }
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"]
  }
});
