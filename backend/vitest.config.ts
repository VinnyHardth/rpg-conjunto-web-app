import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    exclude: ["build/**", "dist/**", "node_modules/**"],
    coverage: {
      reporter: ["text", "html"],
      reportsDirectory: "coverage"
    }
  }
});
