import type { ResolvedConfig, LoadConfigOptions } from "c12";

import { re } from "@reliverse/relico";
import { loadConfig } from "c12";
import fs from "fs-extra";
import { createJiti } from "jiti";
import path from "pathe";

import type {
  LogFileInfo,
  LogLevel,
  RelinkaConfig,
} from "~/libs/relinka/relinka-types.js";

// ========================================
// Defaults and Constants
// ========================================

const DEFAULT_RELINKA_CONFIG: RelinkaConfig = {
  debug: false,
  dirs: {
    dailyLogs: false,
    logDir: ".reliverse",
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

const SUPPORTED_EXTENSIONS = [".ts", ".js", ".mjs", ".cjs", ".json"];

// ========================================
// Helper Functions for Default Fallback
// ========================================

/**
 * Returns whether the debug mode is enabled.
 */
function isDebugEnabled(config: Partial<RelinkaConfig>): boolean {
  return config?.debug ?? DEFAULT_RELINKA_CONFIG.debug;
}

/**
 * Returns whether we should colorize logs.
 */
function isColorEnabled(config: Partial<RelinkaConfig>): boolean {
  return !(config?.disableColors ?? DEFAULT_RELINKA_CONFIG.disableColors);
}

/**
 * Returns the "logDir" (logs directory) from the config.
 */
function getLogDir(config: Partial<RelinkaConfig>): string {
  return config?.dirs?.logDir ?? DEFAULT_RELINKA_CONFIG.dirs.logDir;
}

/**
 * Returns whether daily logs are enabled.
 */
function isDailyLogsEnabled(config: Partial<RelinkaConfig>): boolean {
  return config?.dirs?.dailyLogs ?? DEFAULT_RELINKA_CONFIG.dirs.dailyLogs;
}

/**
 * Returns the value of "saveLogsToFile" in the config.
 */
function shouldSaveLogs(config: Partial<RelinkaConfig>): boolean {
  return config?.saveLogsToFile ?? DEFAULT_RELINKA_CONFIG.saveLogsToFile;
}

/**
 * Returns the maximum allowed log files before cleanup.
 */
function getMaxLogFiles(config: Partial<RelinkaConfig>): number {
  return config?.dirs?.maxLogFiles ?? DEFAULT_RELINKA_CONFIG.dirs.maxLogFiles;
}

/**
 * Returns the configured log file base path or a default fallback.
 */
function getBaseLogName(config: Partial<RelinkaConfig>): string {
  return config?.logFilePath ?? DEFAULT_RELINKA_CONFIG.logFilePath;
}

// ========================================
// Environment Variable Parsing Utilities
// ========================================

const getEnvBoolean = (envVarName: string): boolean | undefined => {
  const value = process.env[envVarName];
  if (value === undefined || value === "") return undefined;
  const lowerValue = value.toLowerCase().trim();
  return !["0", "false"].includes(lowerValue);
};

const getEnvString = (envVarName: string): string | undefined => {
  return process.env[envVarName] || undefined;
};

const getEnvNumber = (envVarName: string): number | undefined => {
  const value = process.env[envVarName];
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

/**
 * Gathers environment variable overrides (e.g., RELINKA_DEBUG, RELINKA_LOG_FILE, etc.)
 * and returns them as a partial config object.
 */
const getEnvOverrides = (): Partial<RelinkaConfig> => {
  const overrides: Partial<RelinkaConfig> = {};
  const dirsOverride: Partial<RelinkaConfig["dirs"]> = {};
  const specialDirsOverride: Partial<RelinkaConfig["dirs"]["specialDirs"]> = {};

  const debug = getEnvBoolean("RELINKA_DEBUG");
  if (debug !== undefined) overrides.debug = debug;

  const withTimestamp = getEnvBoolean("RELINKA_TIMESTAMP");
  if (withTimestamp !== undefined) overrides.withTimestamp = withTimestamp;

  const disableColors = getEnvBoolean("RELINKA_DISABLE_COLORS");
  if (disableColors !== undefined) overrides.disableColors = disableColors;

  const saveLogsToFile = getEnvBoolean("RELINKA_SAVE_LOGS");
  if (saveLogsToFile !== undefined) overrides.saveLogsToFile = saveLogsToFile;

  const logFilePath = getEnvString("RELINKA_LOG_FILE");
  if (logFilePath !== undefined) overrides.logFilePath = logFilePath;

  const logDir = getEnvString("RELINKA_LOG_DIR");
  if (logDir !== undefined) dirsOverride.logDir = logDir;

  const dailyLogs = getEnvBoolean("RELINKA_DAILY_LOGS");
  if (dailyLogs !== undefined) dirsOverride.dailyLogs = dailyLogs;

  const maxLogFiles = getEnvNumber("RELINKA_MAX_LOG_FILES");
  if (maxLogFiles !== undefined) dirsOverride.maxLogFiles = maxLogFiles;

  const useParentConfig = getEnvBoolean("RELINKA_USE_PARENT_CONFIG");
  if (useParentConfig !== undefined) {
    specialDirsOverride.useParentConfigInDist = useParentConfig;
  }

  if (Object.keys(specialDirsOverride).length > 0) {
    dirsOverride.specialDirs =
      specialDirsOverride as RelinkaConfig["dirs"]["specialDirs"];
  }

  if (Object.keys(dirsOverride).length > 0) {
    overrides.dirs = dirsOverride as RelinkaConfig["dirs"];
  }

  return overrides;
};

// ========================================
// Configuration State and Initialization
// ========================================

let currentConfig: RelinkaConfig = { ...DEFAULT_RELINKA_CONFIG };
let isConfigInitialized = false;
let resolveConfigPromise: ((config: RelinkaConfig) => void) | undefined;

/**
 * Promise that resolves when the Relinka config has been loaded and merged
 * from defaults, environment variables, and optionally config files.
 */
export const configPromise = new Promise<RelinkaConfig>((resolve) => {
  resolveConfigPromise = resolve;
});

/**
 * Helper to find the first existing config file with supported extensions.
 */
const findConfigFile = (basePath: string): string | undefined => {
  for (const ext of SUPPORTED_EXTENSIONS) {
    const filePath = basePath + ext;
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return undefined;
};

/**
 * Initializes the logger configuration using c12, environment variables,
 * and any discovered config file. Updates `currentConfig`.
 */
const initializeConfig = async (): Promise<RelinkaConfig> => {
  try {
    const envOverrides = getEnvOverrides();
    const projectRoot = process.cwd();
    const reliverseDir = path.resolve(projectRoot, ".reliverse");
    const configName = "relinka";

    const resolveConfig = async (
      id: string,
      options: LoadConfigOptions<RelinkaConfig>,
    ): Promise<ResolvedConfig<RelinkaConfig> | null | undefined> => {
      if (id !== configName) {
        return null;
      }

      const effectiveCwd = options.cwd || projectRoot;
      const _jitiRequire = createJiti(effectiveCwd, options.jitiOptions);

      const loadAndExtract = async (
        filePath: string,
      ): Promise<RelinkaConfig | null> => {
        try {
          const loadedModule = await _jitiRequire.import(filePath);
          const configData =
            (loadedModule as Record<string, unknown>).default || loadedModule;
          return configData as RelinkaConfig;
        } catch (error) {
          console.error(
            `[Relinka Config Error] Failed to load or parse config from ${filePath}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          return null;
        }
      };

      // First, check .reliverse/relinka.*
      const reliverseBasePath = path.resolve(reliverseDir, configName);
      const reliverseConfigFile = findConfigFile(reliverseBasePath);
      if (reliverseConfigFile) {
        const config = await loadAndExtract(reliverseConfigFile);
        if (config !== null) {
          return { config, source: reliverseConfigFile };
        }
      }

      // Then, check root for relinka.*
      const rootBasePath = path.resolve(effectiveCwd, configName);
      const rootConfigFile = findConfigFile(rootBasePath);
      if (rootConfigFile) {
        const config = await loadAndExtract(rootConfigFile);
        if (config !== null) {
          return { config, source: rootConfigFile };
        }
      }

      return null;
    };

    const loadedConfigResult: ResolvedConfig<RelinkaConfig> =
      await loadConfig<RelinkaConfig>({
        name: configName,
        cwd: projectRoot,
        resolve: resolveConfig,
        packageJson: "relinka",
        dotenv: true,
        defaults: DEFAULT_RELINKA_CONFIG,
        overrides: envOverrides as RelinkaConfig,
      });

    currentConfig = loadedConfigResult.config ?? { ...DEFAULT_RELINKA_CONFIG };
    isConfigInitialized = true;

    const customResolvedLayer = loadedConfigResult.layers?.find((layer) =>
      layer.source?.includes(configName),
    );

    if (customResolvedLayer?.source) {
      console.log(
        `[Relinka Config] Loaded main configuration from: ${path.relative(
          projectRoot,
          customResolvedLayer.source,
        )}`,
      );
    } else {
      const pkgJsonLayer = loadedConfigResult.layers?.find((layer) =>
        layer.source?.endsWith("package.json"),
      );
      if (pkgJsonLayer?.config) {
        console.log("[Relinka Config] Loaded configuration from package.json.");
      } else {
        console.log(
          "[Relinka Config] No config file or package.json entry found. Using defaults and environment variables.",
        );
      }
    }

    // Debug logging
    if (isDebugEnabled(currentConfig)) {
      console.log(
        "[Relinka Config Debug] Final configuration object:",
        JSON.stringify(currentConfig, null, 2),
      );
      console.log(
        "[Relinka Config Debug] Resolved layers:",
        loadedConfigResult.layers?.map((l) => ({
          config: l.config ? "[Object]" : null,
          source: l.source ? path.relative(projectRoot, l.source) : undefined,
          meta: l.meta,
        })),
      );
    }

    if (resolveConfigPromise) {
      resolveConfigPromise(currentConfig);
    }
    return currentConfig;
  } catch (error) {
    console.error(
      `[Relinka Config Error] Failed during configuration loading process: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    currentConfig = { ...DEFAULT_RELINKA_CONFIG };
    isConfigInitialized = true;
    if (resolveConfigPromise) {
      resolveConfigPromise(currentConfig);
    }
    return currentConfig;
  }
};

// Start config initialization
initializeConfig().catch((err) => {
  console.error(
    `[Relinka Config Error] Unhandled error during initial configuration load: ${
      err instanceof Error ? err.message : String(err)
    }`,
  );
  if (!isConfigInitialized) {
    currentConfig = { ...DEFAULT_RELINKA_CONFIG };
    isConfigInitialized = true;
    if (resolveConfigPromise) {
      resolveConfigPromise(currentConfig);
    }
  }
});

// ========================================
// Logging Helper Functions
// ========================================

/**
 * Returns a timestamp string if `withTimestamp` is enabled.
 */
const getTimestamp = (config: RelinkaConfig): string => {
  if (!config?.withTimestamp) return "";
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(now.getDate()).padStart(2, "0")} ${String(
    now.getHours(),
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(
    2,
    "0",
  )}:${String(now.getSeconds()).padStart(2, "0")}.${String(
    now.getMilliseconds(),
  ).padStart(3, "0")}`;
};

/**
 * Returns the absolute log file path based on config and date.
 */
const getLogFilePath = (config: RelinkaConfig): string => {
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

  // Fallback if base name was somehow empty
  const effectiveLogName = finalLogName || "relinka.log";
  return path.resolve(process.cwd(), logDir, effectiveLogName);
};

/**
 * Formats the log message with optional details.
 */
const formatLogMessage = (
  config: RelinkaConfig,
  level: string,
  msg: string,
  details?: unknown,
): string => {
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
};

/**
 * Logs a message to console, colorizing if enabled.
 */
const logToConsole = (
  config: RelinkaConfig,
  level: "ERROR" | "WARN" | "SUCCESS" | "INFO" | "DEBUG",
  formattedMessage: string,
): void => {
  if (!isColorEnabled(config)) {
    // No color
    switch (level) {
      case "ERROR":
        console.error(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  } else {
    // Colorized
    switch (level) {
      case "ERROR":
        console.error(re.redBright(formattedMessage));
        break;
      case "WARN":
        console.warn(re.yellowBright(formattedMessage));
        break;
      case "SUCCESS":
        console.log(re.greenBright(formattedMessage));
        break;
      case "INFO":
        console.log(re.cyanBright(formattedMessage));
        break;
      default:
        console.log(re.dim(formattedMessage));
    }
  }
};

// ========================================
// File System Helper Functions
// ========================================
/**
 * Returns an array of .log files in descending order of modification time.
 */
const getLogFilesSortedByDate = async (
  config: RelinkaConfig,
): Promise<LogFileInfo[]> => {
  const logDirectoryPath = path.resolve(process.cwd(), getLogDir(config));
  const debugEnabled = isDebugEnabled(config);

  try {
    if (!(await fs.pathExists(logDirectoryPath))) {
      if (debugEnabled) {
        console.log(
          `[Relinka FS Debug] Log directory does not exist: ${logDirectoryPath}`,
        );
      }
      return [];
    }
    const files = await fs.readdir(logDirectoryPath);

    const logFilesPromises = files
      .filter((file) => file.endsWith(".log"))
      .map(async (file): Promise<LogFileInfo | null> => {
        const filePath = path.join(logDirectoryPath, file);
        try {
          const stats = await fs.stat(filePath);
          return stats.isFile()
            ? { path: filePath, mtime: stats.mtime.getTime() }
            : null;
        } catch (statError) {
          if (debugEnabled) {
            console.error(
              `[Relinka FS Debug] Error stating file ${filePath}: ${
                statError instanceof Error
                  ? statError.message
                  : String(statError)
              }`,
            );
          }
          return null;
        }
      });

    const logFiles = (await Promise.all(logFilesPromises)).filter(
      (fileInfo): fileInfo is LogFileInfo => Boolean(fileInfo),
    );
    return logFiles.sort((a, b) => b.mtime - a.mtime);
  } catch (readDirError) {
    if (debugEnabled) {
      console.error(
        `[Relinka FS Error] Error reading log directory ${logDirectoryPath}: ${
          readDirError instanceof Error
            ? readDirError.message
            : String(readDirError)
        }`,
      );
    }
    return [];
  }
};

/**
 * Deletes the array of specified file paths.
 */
const deleteFiles = async (
  filePaths: string[],
  config: RelinkaConfig,
): Promise<void> => {
  const debugEnabled = isDebugEnabled(config);

  const deletePromises = filePaths.map(async (filePath) => {
    try {
      await fs.unlink(filePath);
    } catch (unlinkErr) {
      if (debugEnabled) {
        console.error(
          `[Relinka FS Error] Failed to delete log file ${filePath}: ${
            unlinkErr instanceof Error ? unlinkErr.message : String(unlinkErr)
          }`,
        );
      }
    }
  });

  await Promise.all(deletePromises);
};

/**
 * Cleans up old log files if `maxLogFiles` is exceeded.
 */
const cleanupOldLogFiles = async (config: RelinkaConfig): Promise<void> => {
  const maxFiles = getMaxLogFiles(config);
  const debugEnabled = isDebugEnabled(config);

  // We only clean up if the user wants logs in files AND has a positive max files
  if (!shouldSaveLogs(config) || maxFiles <= 0) return;

  try {
    const sortedLogFiles = await getLogFilesSortedByDate(config);

    if (sortedLogFiles.length > maxFiles) {
      const filesToDelete = sortedLogFiles.slice(maxFiles).map((f) => f.path);
      if (filesToDelete.length > 0) {
        await deleteFiles(filesToDelete, config);
        if (debugEnabled) {
          console.log(
            `[Relinka Cleanup] Deleted ${filesToDelete.length} old log file(s). Kept ${maxFiles}.`,
          );
        }
      }
    }
  } catch (err) {
    if (debugEnabled) {
      console.error(
        `[Relinka Cleanup Error] Failed during log cleanup: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
};

/**
 * Ensures the directory for the log file exists and appends a log line.
 */
const appendToLogFile = async (
  config: RelinkaConfig,
  absoluteLogFilePath: string,
  logMessage: string,
): Promise<void> => {
  const debugEnabled = isDebugEnabled(config);
  try {
    await fs.ensureDir(path.dirname(absoluteLogFilePath));
    await fs.appendFile(absoluteLogFilePath, `${logMessage}\n`);
  } catch (err) {
    if (debugEnabled) {
      console.error(
        `[Relinka File Error] Failed to write to log file ${absoluteLogFilePath}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
};

// ========================================
// Synchronous Logging Function
// ========================================

/**
 * Logs a message synchronously using the current config.
 * Skips debug-level logs unless `debug` is set to true in the config.
 */
export const relinka = (
  type: LogLevel,
  message: string,
  ...args: unknown[]
): void => {
  const configToUse = currentConfig;
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
  if (logLevelLabel === "DEBUG" && !isDebugEnabled(configToUse)) {
    return;
  }

  const details =
    args.length > 0 ? (args.length === 1 ? args[0] : args) : undefined;

  const formattedMessage = formatLogMessage(
    configToUse,
    logLevelLabel,
    message,
    details,
  );

  logToConsole(configToUse, logLevelLabel, formattedMessage);
};

// ========================================
// Asynchronous Logging Function
// ========================================

/**
 * Logs a message asynchronously, waiting for the config to be fully loaded.
 * Also handles file writing and log cleanup if enabled in the config.
 */
export const relinkaAsync = async (
  type: LogLevel,
  message: string,
  ...args: unknown[]
): Promise<void> => {
  const loadedConfig = await configPromise;
  if (message === "") {
    console.log();
    return;
  }

  const logLevelLabel = (type === "verbose" ? "DEBUG" : type.toUpperCase()) as
    | "ERROR"
    | "WARN"
    | "SUCCESS"
    | "INFO"
    | "DEBUG";

  if (logLevelLabel === "DEBUG" && !isDebugEnabled(loadedConfig)) {
    return;
  }

  const details =
    args.length > 0 ? (args.length === 1 ? args[0] : args) : undefined;

  const formattedMessage = formatLogMessage(
    loadedConfig,
    logLevelLabel,
    message,
    details,
  );

  logToConsole(loadedConfig, logLevelLabel, formattedMessage);

  // If saving to file is enabled, append log message and clean up
  if (shouldSaveLogs(loadedConfig)) {
    const absoluteLogFilePath = getLogFilePath(loadedConfig);
    try {
      await appendToLogFile(
        loadedConfig,
        absoluteLogFilePath,
        formattedMessage,
      );
      await cleanupOldLogFiles(loadedConfig);
    } catch (err) {
      if (isDebugEnabled(loadedConfig)) {
        console.error(
          `[Relinka File Async Error] Error during file logging/cleanup process: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
  }
};

// ========================================
// defineConfig Helper
// ========================================

/**
 * Type helper for defining configuration in `relinka.config.ts` (or similar).
 * Provides autocompletion and type checking for the configuration object.
 */
export const defineConfig = (
  config: Partial<RelinkaConfig>,
): Partial<RelinkaConfig> => {
  return config;
};
