import { defineConfig } from "~/libs/relinka/relinka-impl/impl-mod.js";

/**
 * RELINKA CONFIGURATION FILE
 * - Hover over a field to see the information
 * - Use intellisense to see available options
 * @see https://github.com/reliverse/relico
 */
export default defineConfig({
  // Enable debug to see verbose logs
  debug: true,

  // Show timestamp in each log message
  withTimestamp: false,

  // Control whether logs are saved to a file
  saveLogsToFile: true,

  // Disable colors in the console
  disableColors: false,

  // Log file path
  logFilePath: "relinka.log",

  // Directory settings
  dirs: {
    dailyLogs: true,
    logDir: ".reliverse/logs", // store logs in a custom folder
    maxLogFiles: 5, // keep only the 5 most recent log files
    specialDirs: {
      distDirNames: [],
      useParentConfigInDist: true,
    },
  },
});
