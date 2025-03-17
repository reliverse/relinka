import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    watch: false,
    alias: {
      "~/": new URL("./src/", import.meta.url).pathname,
      "@/*": new URL("./examples/*", import.meta.url).pathname,
      "#/*": new URL("./addons/*", import.meta.url).pathname,
    },
  },
});
