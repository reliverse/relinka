import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["examples/**/*.test.ts"],
    exclude: ["dist", "node_modules", "output"],
    alias: {
      "~/": new URL("./src/", import.meta.url).pathname,
      "@/*": new URL("./examples/*", import.meta.url).pathname,
      "#/*": new URL("./addons/*", import.meta.url).pathname,
    },
    watch: false,
  },
});
