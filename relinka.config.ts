import { defineConfig } from "~/libs/relinka/relinka-impl/impl-mod.js";

/**
 * Reliverse Relinka Configuration
 * Hover over a field to see more details
 * @see https://github.com/reliverse/relinka
 */
export default defineConfig({
  logFilePath: "relinka.log",
  saveLogsToFile: true,
  disableColors: false,
  withTimestamp: true,
  debug: true,
  dirs: {},
});
