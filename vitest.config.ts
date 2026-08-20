import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    // The suite spins up ~40 jsdom environments. On machines where that
    // oversubscribes the cores, forks thrash and userEvent's async pointer
    // sequences get starved — producing spurious 5s timeouts and dropped/
    // repeated clicks that have nothing to do with the code under test
    // (each file passes deterministically in isolation). Cap the fork pool
    // and give timers real headroom so results are reproducible.
    pool: "forks",
    poolOptions: { forks: { maxForks: 4, minForks: 1 } },
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
