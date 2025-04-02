import { re } from "@reliverse/relico";
import { loadConfig, type ResolvedConfig } from "c12";
import fs from "fs-extra";
import path from "pathe";

import type {
  RelinkaConfig,
  LogFileInfo,
  LogLevel,
} from "~/libs/relinka/relinka-types.js";

const DEV_VERBOSE = false;

/**
 * Default configuration object.
 * c12 will merge this with a config file.
 */
const DEFAULT_RELINKA_CONFIG: RelinkaConfig = {
  debug: false,
  dirs: {
    dailyLogs: false,
    logDir: ".reliverse/logs",
    maxLogFiles: 0,
    specialDirs: {
      distDirNames: ["dist", "dist-jsr", "dist-npm", "dist-libs"],
      useParentConfigInDist: true,
    },
  },
  disableColors: false,
  logFilePath: "relinka.log",
  saveLogsToFile: false,
  withTimestamp: false,
};

/**
 * At the moment of call, the current, fully merged config.
 */
let currentConfig: RelinkaConfig = { ...DEFAULT_RELINKA_CONFIG };
let isConfigInitialized = false;
let resolveRelinkaConfig: ((config: RelinkaConfig) => void) | undefined;

/**
 * Promise that resolves once c12 loads and merges the config.
 */
export const relinkaConfig = new Promise<RelinkaConfig>((resolve) => {
  resolveRelinkaConfig = resolve;
});

/**
 * Kick off c12 to load the config from:
 *  - Defaults (the object above)
 *  - A local relinka.config.* (if present)
 */
async function initializeConfig() {
  try {
    // c12 merges in ascending order:
    //  1) defaultConfig -> extends -> configFile -> rcFile -> package.json -> .env -> overrides
    const result: ResolvedConfig<RelinkaConfig> =
      await loadConfig<RelinkaConfig>({
        name: "relinka", // base name => tries relinka.config.*, .relinkarc, etc.
        cwd: process.cwd(), // working directory
        dotenv: false,
        packageJson: false,
        rcFile: false,
        globalRc: false,
        defaults: DEFAULT_RELINKA_CONFIG, // lowest priority
        // overrides: {},       // highest priority if we would need to forcibly override
      });

    // c12 merges everything into result.config
    currentConfig = result.config;
    isConfigInitialized = true;

    // Log config details if debug is true
    if (DEV_VERBOSE) {
      // Log which file was used:
      console.log(
        "[Relinka Config Debug] Config file used:",
        result.configFile,
      );
      console.log("[Relinka Config Debug] All merged layers:", result.layers);
      // Log final config
      console.log("[Relinka Config Debug] Final configuration:", currentConfig);
    }

    // Resolve relinkaConfig so `relinkaAsync` can proceed
    if (resolveRelinkaConfig) {
      resolveRelinkaConfig(currentConfig);
    }
  } catch (err) {
    console.error(
      `[Relinka Config Error] Failed to load config: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
    // We fallback to defaults if there's an error
    currentConfig = { ...DEFAULT_RELINKA_CONFIG };
    isConfigInitialized = true;
    if (resolveRelinkaConfig) {
      resolveRelinkaConfig(currentConfig);
    }
  }
}

// Kick off the async config load
initializeConfig().catch((err) => {
  console.error(
    `[Relinka Config Error] Unhandled error: ${
      err instanceof Error ? err.message : String(err)
    }`,
  );
  if (!isConfigInitialized) {
    currentConfig = { ...DEFAULT_RELINKA_CONFIG };
    isConfigInitialized = true;
    if (resolveRelinkaConfig) {
      resolveRelinkaConfig(currentConfig);
    }
  }
});

/* ------------------------------------------------------
   HELPER FUNCTIONS
-------------------------------------------------------- */

/** Returns whether the debug mode is enabled. */
function isDebugEnabled(config: Partial<RelinkaConfig>): boolean {
  return config.debug ?? DEFAULT_RELINKA_CONFIG.debug;
}

/** Returns whether we should colorize logs. */
function isColorEnabled(config: Partial<RelinkaConfig>): boolean {
  return !(config.disableColors ?? DEFAULT_RELINKA_CONFIG.disableColors);
}

/** Returns the "logDir" from the config. */
function getLogDir(config: Partial<RelinkaConfig>): string {
  return config.dirs?.logDir ?? DEFAULT_RELINKA_CONFIG.dirs.logDir;
}

/** Returns whether daily logs are enabled. */
function isDailyLogsEnabled(config: Partial<RelinkaConfig>): boolean {
  return config.dirs?.dailyLogs ?? DEFAULT_RELINKA_CONFIG.dirs.dailyLogs;
}

/** Returns whether logs should be written to file. */
function shouldSaveLogs(config: Partial<RelinkaConfig>): boolean {
  return config.saveLogsToFile ?? DEFAULT_RELINKA_CONFIG.saveLogsToFile;
}

/** Returns the maximum allowed log files before cleanup. */
function getMaxLogFiles(config: Partial<RelinkaConfig>): number {
  return config.dirs?.maxLogFiles ?? DEFAULT_RELINKA_CONFIG.dirs.maxLogFiles;
}

/** Returns the configured log filename or a default fallback. */
function getBaseLogName(config: Partial<RelinkaConfig>): string {
  return config.logFilePath ?? DEFAULT_RELINKA_CONFIG.logFilePath;
}

/* ------------------------------------------------------
   FILE + LOGGING UTILITIES
-------------------------------------------------------- */

/**
 * Returns a timestamp string if `withTimestamp` is enabled.
 */
function getTimestamp(config: RelinkaConfig): string {
  if (!config.withTimestamp) return "";
  const now = new Date();
  return (
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}` +
    `-${String(now.getDate()).padStart(2, "0")} ` +
    `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}` +
    `.${String(now.getMilliseconds()).padStart(3, "0")}`
  );
}

/**
 * Returns the absolute log file path based on config and date.
 */
function getLogFilePath(config: RelinkaConfig): string {
  const logDir = getLogDir(config);
  const daily = isDailyLogsEnabled(config);
  let finalLogName = getBaseLogName(config);

  if (daily) {
    const now = new Date();
    const datePrefix = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-`;
    finalLogName = datePrefix + finalLogName;
  }

  if (finalLogName && !finalLogName.endsWith(".log")) {
    finalLogName += ".log";
  }

  const effectiveLogName = finalLogName || "relinka.log";
  return path.resolve(process.cwd(), logDir, effectiveLogName);
}

/**
 * Formats a log message with optional details.
 */
function formatLogMessage(
  config: RelinkaConfig,
  level: string,
  msg: string,
  details?: unknown,
): string {
  const timestamp = getTimestamp(config);
  let detailsStr = "";

  if (details !== undefined) {
    if (details instanceof Error) {
      detailsStr = `\nStack Trace: ${details.stack || details.message}`;
    } else if (typeof details === "object" && details !== null) {
      try {
        detailsStr = ` ${JSON.stringify(details)}`;
      } catch {
        detailsStr = " [object Object]";
      }
    } else {
      detailsStr = ` ${String(details)}`;
    }
  }

  const paddedLevel = level.padEnd(7, " ");
  return timestamp
    ? `[${timestamp}] ${paddedLevel} ${msg}${detailsStr}`
    : `${paddedLevel} ${msg}${detailsStr}`;
}

/**
 * Logs a message to console, colorizing if enabled.
 */
function logToConsole(
  config: RelinkaConfig,
  level: "ERROR" | "WARN" | "SUCCESS" | "INFO" | "DEBUG",
  formattedMessage: string,
): void {
  // ANSI code that resets all colors
  const COLOR_RESET = "\x1b[0m";

  if (!isColorEnabled(config)) {
    // No color
    if (level === "ERROR") {
      console.error(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  } else {
    // Colorized output + manual reset at the end
    switch (level) {
      case "ERROR":
        console.error(re.redBright(formattedMessage) + COLOR_RESET);
        break;
      case "WARN":
        console.warn(re.yellowBright(formattedMessage) + COLOR_RESET);
        break;
      case "SUCCESS":
        console.log(re.greenBright(formattedMessage) + COLOR_RESET);
        break;
      case "INFO":
        console.log(re.cyanBright(formattedMessage) + COLOR_RESET);
        break;
      default:
        console.log(re.dim(formattedMessage) + COLOR_RESET);
    }
  }
}

/**
 * Returns an array of .log files in descending order of modification time.
 */
async function getLogFilesSortedByDate(
  config: RelinkaConfig,
): Promise<LogFileInfo[]> {
  const logDirectoryPath = path.resolve(process.cwd(), getLogDir(config));
  if (!(await fs.pathExists(logDirectoryPath))) {
    if (isDebugEnabled(config)) {
      console.log(
        `[Relinka FS Debug] Log directory not found: ${logDirectoryPath}`,
      );
    }
    return [];
  }

  try {
    const files = await fs.readdir(logDirectoryPath);

    const logFilesPromises = files
      .filter((f) => f.endsWith(".log"))
      .map(async (f): Promise<LogFileInfo | null> => {
        const filePath = path.join(logDirectoryPath, f);
        try {
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            return { path: filePath, mtime: stats.mtime.getTime() };
          }
          return null;
        } catch (err) {
          if (isDebugEnabled(config)) {
            console.error(
              `[Relinka FS Debug] Error reading stats for ${filePath}: ${
                err instanceof Error ? err.message : String(err)
              }`,
            );
          }
          return null;
        }
      });

    const logFiles = (await Promise.all(logFilesPromises)).filter(
      (f): f is LogFileInfo => Boolean(f),
    );
    return logFiles.sort((a, b) => b.mtime - a.mtime);
  } catch (readErr) {
    if (isDebugEnabled(config)) {
      console.error(
        `[Relinka FS Error] Failed reading log directory ${logDirectoryPath}: ${
          readErr instanceof Error ? readErr.message : String(readErr)
        }`,
      );
    }
    return [];
  }
}

/**
 * Deletes the specified file paths.
 */
async function deleteFiles(
  filePaths: string[],
  config: RelinkaConfig,
): Promise<void> {
  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        if (isDebugEnabled(config)) {
          console.error(
            `[Relinka FS Error] Failed to delete log file ${filePath}: ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }
      }
    }),
  );
}

/**
 * Cleans up old log files if `maxLogFiles` is exceeded.
 */
async function cleanupOldLogFiles(config: RelinkaConfig): Promise<void> {
  if (!shouldSaveLogs(config) || getMaxLogFiles(config) <= 0) return;

  try {
    const sortedLogFiles = await getLogFilesSortedByDate(config);
    const maxFiles = getMaxLogFiles(config);

    if (sortedLogFiles.length > maxFiles) {
      const filesToDelete = sortedLogFiles.slice(maxFiles).map((f) => f.path);
      if (filesToDelete.length > 0) {
        await deleteFiles(filesToDelete, config);
        if (isDebugEnabled(config)) {
          console.log(
            `[Relinka Cleanup] Deleted ${filesToDelete.length} old log file(s). Kept ${maxFiles}.`,
          );
        }
      }
    }
  } catch (err) {
    if (isDebugEnabled(config)) {
      console.error(
        `[Relinka Cleanup Error] Failed during log cleanup: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}

/**
 * Ensures the directory for the log file exists and appends a log line.
 */
async function appendToLogFile(
  config: RelinkaConfig,
  absoluteLogFilePath: string,
  logMessage: string,
): Promise<void> {
  try {
    await fs.ensureDir(path.dirname(absoluteLogFilePath));
    await fs.appendFile(absoluteLogFilePath, `${logMessage}\n`);
  } catch (err) {
    if (isDebugEnabled(config)) {
      console.error(
        `[Relinka File Error] Failed to write to log file ${absoluteLogFilePath}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}

/* ------------------------------------------------------
   PUBLIC LOGGING FUNCTIONS
-------------------------------------------------------- */

/**
 * Logs a message synchronously using the current config.
 * Skips debug-level logs unless `debug` is true in the config.
 */
export function relinka(
  type: LogLevel,
  message: string,
  ...args: unknown[]
): void {
  if (message === "") {
    console.log();
    return;
  }

  // Convert "verbose" to "DEBUG"
  const logLevelLabel = (type === "verbose" ? "DEBUG" : type.toUpperCase()) as
    | "ERROR"
    | "WARN"
    | "SUCCESS"
    | "INFO"
    | "DEBUG";

  // Skip debug if debug is not enabled
  if (logLevelLabel === "DEBUG" && !isDebugEnabled(currentConfig)) {
    return;
  }

  const details = args.length > 1 ? args : args[0];
  const formatted = formatLogMessage(
    currentConfig,
    logLevelLabel,
    message,
    details,
  );
  logToConsole(currentConfig, logLevelLabel, formatted);
}

/**
 * Logs a message asynchronously, waiting for the config to be fully loaded.
 * Also handles file writing and log cleanup if enabled.
 */
export async function relinkaAsync(
  type: LogLevel,
  message: string,
  ...args: unknown[]
): Promise<void> {
  await relinkaConfig;

  if (message === "") {
    console.log();
    return;
  }

  // Convert "verbose" to "DEBUG"
  const logLevelLabel = (type === "verbose" ? "DEBUG" : type.toUpperCase()) as
    | "ERROR"
    | "WARN"
    | "SUCCESS"
    | "INFO"
    | "DEBUG";

  if (logLevelLabel === "DEBUG" && !isDebugEnabled(currentConfig)) {
    return;
  }

  const details = args.length > 1 ? args : args[0];
  const formatted = formatLogMessage(
    currentConfig,
    logLevelLabel,
    message,
    details,
  );
  logToConsole(currentConfig, logLevelLabel, formatted);

  // If saving logs to file, do so
  if (shouldSaveLogs(currentConfig)) {
    const absoluteLogFilePath = getLogFilePath(currentConfig);
    try {
      await appendToLogFile(currentConfig, absoluteLogFilePath, formatted);
      await cleanupOldLogFiles(currentConfig);
    } catch (err) {
      if (isDebugEnabled(currentConfig)) {
        console.error(
          `[Relinka File Async Error] Error during file logging/cleanup: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
  }
}

/**
 * Type helper for user config files.
 */
export function defineConfig(
  config: Partial<RelinkaConfig>,
): Partial<RelinkaConfig> {
  return config;
}
