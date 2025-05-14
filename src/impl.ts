/* eslint-disable no-debugger */
import type { DefaultColorKeys } from "@reliverse/relico";

import { re } from "@reliverse/relico";
import { loadConfig, type ResolvedConfig } from "c12";
import fs from "fs-extra";
import os from "node:os";
import path from "pathe";

/* -------------------------------------------------- *
 *                     CONSTANTS                      *
 * -------------------------------------------------- */

const ENABLE_DEV_DEBUG = false;

/* single flag that survives multiple imports  */
const EXIT_GUARD = Symbol.for("relinka.exitHandlersRegistered");

/* -------------------------------------------------- *
 *                 TYPE DECLARATIONS                  *
 * -------------------------------------------------- */

/** Configuration for special directory handling. */
export type RelinkaSpecialDirsConfig = {
  distDirNames?: string[];
  useParentConfigInDist?: boolean;
};

/** Configuration for directory-related settings. */
export type RelinkaDirsConfig = {
  dailyLogs?: boolean;
  logDir?: string;
  maxLogFiles?: number;
  specialDirs?: RelinkaSpecialDirsConfig;
};

/** Configuration for a single log level. */
export type LogLevelConfig = {
  /**
   * Symbol to display for this log level.
   * @see https://symbl.cc
   */
  symbol: string;

  /**
   * Fallback symbol to use if Unicode is not supported.
   */
  fallbackSymbol: string;

  /**
   * Color to use for this log level.
   */
  color: DefaultColorKeys;

  /**
   * Number of spaces after the symbol/fallback
   */
  spacing?: number;
};

/** Configuration for all log levels. */
export type LogLevelsConfig = Partial<Record<LogLevel, LogLevelConfig>>;

/** Log level types used by the logger. */
export type LogLevel =
  | "error"
  | "fatal"
  | "info"
  | "success"
  | "verbose"
  | "warn"
  | "log"
  | "null";

/**
 * Configuration options for the Relinka logger.
 * All properties are optional to allow for partial configuration.
 * Defaults will be applied during initialization.
 */
export type RelinkaConfig = {
  /**
   * Enables verbose (aka debug) mode for detailed logging.
   *
   * `true` here works only for end-users of CLIs/libs when theirs developers
   * has been awaited for user's config via `@reliverse/relinka`'s `await relinkaConfig;`
   */
  verbose?: boolean;

  /**
   * Configuration for directory-related settings.
   * - `dailyLogs`: If true, logs will be stored in a daily subdirectory.
   * - `logDir`: The base directory for logs.
   * - `maxLogFiles`: The maximum number of log files to keep before cleanup.
   * - `specialDirs`: Configuration for special directory handling.
   *   - `distDirNames`: An array of directory names to check for special handling.
   *   - `useParentConfigInDist`: If true, use the parent config in dist directories.
   */
  dirs?: RelinkaDirsConfig;

  /**
   * Disables color output in the console.
   */
  disableColors?: boolean;

  /**
   * Path to the log file.
   */
  logFilePath?: string;

  /**
   * If true, logs will be saved to a file.
   */
  saveLogsToFile?: boolean;

  /**
   * Configuration for timestamp in log messages.
   */
  timestamp?: {
    /**
     * If true, timestamps will be added to log messages.
     */
    enabled: boolean;
    /**
     * The format for timestamps. Default is YYYY-MM-DD HH:mm:ss.SSS
     */
    format?: string;
  };

  /**
   * Allows to customize the log levels.
   */
  levels?: LogLevelsConfig;

  /**
   * Controls how often the log cleanup runs (in milliseconds)
   * Default: 10000 (10 seconds)
   */
  cleanupInterval?: number;

  /**
   * Maximum size of the log write buffer before flushing to disk (in bytes)
   * Default: 4096 (4KB)
   */
  bufferSize?: number;

  /**
   * Maximum time to hold logs in buffer before flushing to disk (in milliseconds)
   * Default: 5000 (5 seconds)
   */
  maxBufferAge?: number;
};

/** Represents information about a log file for cleanup purposes. */
export type LogFileInfo = {
  path: string;
  mtime: number;
};

/* -------------------------------------------------- *
 *            DEFAULT CONFIG & UNICODE CHECK          *
 * -------------------------------------------------- */

/**
 * Default configuration object.
 * `reconf` will merge this with a config file.
 */
const DEFAULT_RELINKA_CONFIG: RelinkaConfig = {
  verbose: false,
  dirs: {
    dailyLogs: false,
    logDir: "logs",
    maxLogFiles: 0,
    specialDirs: {
      distDirNames: ["dist", "dist-jsr", "dist-npm", "dist-libs"],
      useParentConfigInDist: true,
    },
  },
  disableColors: false,
  logFilePath: "relinka.log",
  saveLogsToFile: false,
  timestamp: {
    enabled: false,
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  },
  cleanupInterval: 10000, // 10 seconds
  bufferSize: 4096, // 4KB
  maxBufferAge: 5000, // 5 seconds

  // A default set of levels, with fallback symbols for non-Unicode terminals:
  levels: {
    success: {
      symbol: "✓",
      fallbackSymbol: "[OK]",
      color: "greenBright",
      spacing: 3,
    },
    info: {
      symbol: "◈",
      fallbackSymbol: "[i]",
      color: "cyanBright",
      spacing: 3,
    },
    error: {
      symbol: "✖",
      fallbackSymbol: "[ERR]",
      color: "redBright",
      spacing: 3,
    },
    warn: {
      symbol: "⚠",
      fallbackSymbol: "[WARN]",
      color: "yellowBright",
      spacing: 3,
    },
    fatal: {
      symbol: "‼",
      fallbackSymbol: "[FATAL]",
      color: "redBright",
      spacing: 3,
    },
    verbose: {
      symbol: "✱",
      fallbackSymbol: "[VERBOSE]",
      color: "gray",
      spacing: 3,
    },
    log: { symbol: "│", fallbackSymbol: "|", color: "dim", spacing: 3 },
    null: { symbol: "", fallbackSymbol: "", color: "dim", spacing: 0 },
  },
};

function isUnicodeSupported(): boolean {
  // modern terminals and environments that definitely support Unicode
  if (
    process.env.TERM_PROGRAM === "vscode" ||
    process.env.WT_SESSION ||
    process.env.TERM_PROGRAM === "iTerm.app" ||
    process.env.TERM_PROGRAM === "hyper" ||
    process.env.TERMINAL_EMULATOR === "JetBrains-JediTerm" ||
    process.env.ConEmuTask === "{cmd::Cmder}" ||
    process.env.TERM === "xterm-256color"
  ) {
    return true;
  }

  // Windows-specific checks
  if (process.platform === "win32") {
    // Check for Windows 10+ which should support Unicode
    const osRelease = os.release();
    const match = /(\d+)\.(\d+)/.exec(osRelease);

    if (match && Number.parseInt(match[1], 10) >= 10) {
      return true;
    }

    // Check for mintty which supports Unicode
    if (process.env.TERM_PROGRAM === "mintty") {
      return true;
    }

    return false;
  }

  // Most other platforms support Unicode
  return true;
}

/* -------------------------------------------------- *
 *                CONFIGURATION LOADING               *
 * -------------------------------------------------- */

// Config state management
let currentConfig: RelinkaConfig = { ...DEFAULT_RELINKA_CONFIG };
let isConfigInitialized = false;
let resolveRelinkaConfig: ((config: RelinkaConfig) => void) | undefined;

/** Promise resolved once the user's config (if any) is merged. */
export const relinkaConfig = new Promise<RelinkaConfig>((res) => {
  resolveRelinkaConfig = res;
});

/* --------------  log-buffer state ----------------- */

type LogBuffer = {
  filePath: string;
  entries: string[];
  size: number;
  lastFlush: number;
};
const logBuffers = new Map<string, LogBuffer>();
const activeTimers: NodeJS.Timeout[] = [];
let bufferFlushTimer: NodeJS.Timeout | null = null;
let lastCleanupTime = 0;
let cleanupScheduled = false;

/* -------------------------------------------------- *
 *                  CONFIG INITIALISER                *
 * -------------------------------------------------- */

/**
 * Load and initialize configuration
 */
async function initializeConfig(): Promise<void> {
  try {
    const result: ResolvedConfig<RelinkaConfig> =
      await loadConfig<RelinkaConfig>({
        name: "relinka",
        cwd: process.cwd(),
        dotenv: false,
        packageJson: false,
        rcFile: false,
        globalRc: false,
        defaults: DEFAULT_RELINKA_CONFIG,
      });

    currentConfig = result.config;
    isConfigInitialized = true;
    resolveRelinkaConfig?.(currentConfig);
    resolveRelinkaConfig = undefined;

    if (ENABLE_DEV_DEBUG) {
      console.log("[Dev Debug] Config file used:", result.configFile);
      console.log("[Dev Debug] All merged layers:", result.layers);
      console.log("[Dev Debug] Final configuration:", currentConfig);
    }
  } catch (err) {
    console.error(
      `[Relinka Config Error] Failed to load config: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
    currentConfig = { ...DEFAULT_RELINKA_CONFIG };
    isConfigInitialized = true;
    resolveRelinkaConfig?.(currentConfig);
    resolveRelinkaConfig = undefined;
  } finally {
    // Set up timer for age-based buffer flushing with default config
    setupBufferFlushTimer();
  }
}

/* -------------------------------------------------- *
 *           BUFFER FLUSH TIMER (setup / reset)       *
 * -------------------------------------------------- */

/**
 * Sets up a timer to periodically flush log buffers based on their age
 */
function setupBufferFlushTimer(): void {
  if (bufferFlushTimer) {
    clearInterval(bufferFlushTimer);
    activeTimers.splice(activeTimers.indexOf(bufferFlushTimer), 1);
  }

  const maxAge = getMaxBufferAge(currentConfig);
  bufferFlushTimer = setInterval(flushDueBuffers, Math.min(maxAge / 2, 2500));
  bufferFlushTimer.unref();
  activeTimers.push(bufferFlushTimer);

  function flushDueBuffers() {
    const now = Date.now();
    for (const [fp, buf] of logBuffers) {
      if (buf.entries.length && now - buf.lastFlush >= maxAge) {
        flushLogBuffer(currentConfig, fp).catch(console.error);
      }
    }
  }
}

// Start initialization process
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
      resolveRelinkaConfig = undefined;
    }

    // Set up timer for age-based buffer flushing with default config
    setupBufferFlushTimer();
  }
});

/* ------------------------------------------------------
   CONFIG HELPER FUNCTIONS
-------------------------------------------------------- */

/** Returns whether verbose (aka debug) mode is enabled. */
function isVerboseEnabled(config: Partial<RelinkaConfig>): boolean {
  return config.verbose ?? DEFAULT_RELINKA_CONFIG.verbose;
}

/** Returns whether to colorize logs. */
function isColorEnabled(config: Partial<RelinkaConfig>): boolean {
  return !(config.disableColors ?? DEFAULT_RELINKA_CONFIG.disableColors);
}

/** Returns the "logDir" from config. */
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

/** Returns the configured buffer size for log writes */
function getBufferSize(config: Partial<RelinkaConfig>): number {
  return config.bufferSize ?? DEFAULT_RELINKA_CONFIG.bufferSize;
}

/** Returns the configured maximum age for buffered logs before forced flush */
function getMaxBufferAge(config: Partial<RelinkaConfig>): number {
  return config.maxBufferAge ?? DEFAULT_RELINKA_CONFIG.maxBufferAge;
}

/** Returns the configured cleanup interval in milliseconds */
function getCleanupInterval(config: Partial<RelinkaConfig>): number {
  return config.cleanupInterval ?? DEFAULT_RELINKA_CONFIG.cleanupInterval;
}

/** Quick dev environment check. */
function isDevEnv(): boolean {
  return process.env.NODE_ENV === "development";
}

/* ------------------------------------------------------
   FORMATTING UTILITIES
-------------------------------------------------------- */

/**
 * Returns a formatted date string in YYYY-MM-DD format
 */
function getDateString(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * Returns a timestamp string if `timestamp.enabled` is true.
 */
function getTimestamp(config: RelinkaConfig): string {
  if (!config.timestamp?.enabled) return "";

  const now = new Date();
  const format = config.timestamp?.format || "YYYY-MM-DD HH:mm:ss.SSS";

  return format
    .replace("YYYY", String(now.getFullYear()))
    .replace("MM", String(now.getMonth() + 1).padStart(2, "0"))
    .replace("DD", String(now.getDate()).padStart(2, "0"))
    .replace("HH", String(now.getHours()).padStart(2, "0"))
    .replace("mm", String(now.getMinutes()).padStart(2, "0"))
    .replace("ss", String(now.getSeconds()).padStart(2, "0"))
    .replace("SSS", String(now.getMilliseconds()).padStart(3, "0"));
}

/**
 * Returns the absolute log file path based on config and date.
 */
function getLogFilePath(config: RelinkaConfig): string {
  const logDir = getLogDir(config);
  const daily = isDailyLogsEnabled(config);
  let finalLogName = getBaseLogName(config);

  if (daily) {
    const datePrefix = `${getDateString()}-`;
    finalLogName = datePrefix + finalLogName;
  }

  if (finalLogName && !finalLogName.endsWith(".log")) {
    finalLogName += ".log";
  }

  const effectiveLogName = finalLogName || "relinka.log";
  return path.resolve(process.cwd(), logDir, effectiveLogName);
}

/**
 * Returns an object with the symbol and color for a given level.
 * If isUnicodeSupported() == false, use fallbackSymbol if available.
 */
function getLevelStyle(config: RelinkaConfig, level: string) {
  const allLevels = config.levels || DEFAULT_RELINKA_CONFIG.levels || {};
  const levelConfig = allLevels[level as LogLevel];

  if (!levelConfig) {
    return {
      symbol: `[${level.toUpperCase()}]`,
      color: "dim" as DefaultColorKeys,
      spacing: 3,
    };
  }

  // Special case for null level - no symbol or spacing
  if (level === "null") {
    return {
      symbol: "",
      color: levelConfig.color,
      spacing: 0,
    };
  }

  const { symbol, fallbackSymbol, color, spacing } = levelConfig;
  const effectiveSymbol = isUnicodeSupported()
    ? symbol
    : fallbackSymbol || `[${level.toUpperCase()}]`;

  return {
    symbol: effectiveSymbol,
    color,
    spacing: spacing ?? 3,
  };
}

/**
 * Formats details for logging in a more consistent way
 */
function formatDetails(details: unknown): string {
  if (details === undefined) return "";

  if (details instanceof Error) {
    return `\nStack Trace: ${details.stack || details.message}`;
  }

  if (typeof details === "object" && details !== null) {
    try {
      return ` ${JSON.stringify(details, null, 2)}`;
    } catch {
      return " [object Object]";
    }
  }

  return ` ${String(details)}`;
}

/**
 * Formats a log message with optional details, including the level symbol.
 */
function formatLogMessage(
  config: RelinkaConfig,
  level: string,
  msg: string,
  details?: unknown,
): string {
  const timestamp = getTimestamp(config);
  const detailsStr = formatDetails(details);
  const { symbol, spacing } = getLevelStyle(config, level);
  const symbolWithSpaces = symbol ? `${symbol}${" ".repeat(spacing)}` : "";
  const prefix = timestamp ? `[${timestamp}] ` : "";

  return `${prefix}${symbolWithSpaces}${msg}${detailsStr}`;
}

/* ------------------------------------------------------
   CONSOLE LOGGING UTILITIES
-------------------------------------------------------- */

/**
 * A small mapping from log level to the matching console method.
 */
const consoleMethodMap: Record<string, (msg?: any) => void> = {
  error: console.error,
  fatal: console.error,
  warn: console.warn,
  info: console.info,
  success: console.log,
  verbose: console.log,
  log: console.log,
  null: console.log,
};

/**
 * Logs a message to console, colorizing if enabled, based on level style.
 */
function logToConsole(
  config: RelinkaConfig,
  level: string,
  formattedMessage: string,
): void {
  if (!isColorEnabled(config)) {
    const method = consoleMethodMap[level] || console.log;
    method(formattedMessage);
    return;
  }

  const { color } = getLevelStyle(config, level);
  const colorFn = (re as any)[color] || re.dim;
  const method = consoleMethodMap[level] || console.log;

  method(`${colorFn(formattedMessage)}\x1b[0m`);
}

/* ------------------------------------------------------
   FILE LOGGING UTILITIES
-------------------------------------------------------- */

/**
 * Returns an array of .log files in descending order of modification time.
 * Uses a more efficient approach with Promise.all for stats collection.
 */
async function getLogFilesSortedByDate(
  config: RelinkaConfig,
): Promise<LogFileInfo[]> {
  const logDirectoryPath = path.resolve(process.cwd(), getLogDir(config));

  try {
    if (!(await fs.pathExists(logDirectoryPath))) {
      if (ENABLE_DEV_DEBUG) {
        console.log(`[Dev Debug] Log directory not found: ${logDirectoryPath}`);
      }
      return [];
    }

    const files = await fs.readdir(logDirectoryPath);
    const logFiles = files.filter((f) => f.endsWith(".log"));

    // Fast path for no log files
    if (logFiles.length === 0) return [];

    // Get stats for all files in parallel
    const fileInfoPromises = logFiles.map(
      async (fileName): Promise<LogFileInfo | null> => {
        const filePath = path.join(logDirectoryPath, fileName);
        try {
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            return { path: filePath, mtime: stats.mtime.getTime() };
          }
          return null;
        } catch (err) {
          if (isVerboseEnabled(config)) {
            console.error(
              `[Relinka FS Debug] Error reading stats for ${filePath}: ${
                err instanceof Error ? err.message : String(err)
              }`,
            );
          }
          return null;
        }
      },
    );

    const logFileInfos = (await Promise.all(fileInfoPromises)).filter(Boolean);

    // Sort by modification time, newest first
    return logFileInfos.sort((a, b) => b.mtime - a.mtime);
  } catch (readErr) {
    if (isVerboseEnabled(config)) {
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
 * Deletes the specified file paths with improved error handling.
 */
async function deleteFiles(
  filePaths: string[],
  config: RelinkaConfig,
): Promise<void> {
  if (filePaths.length === 0) return;

  const results = await Promise.allSettled(
    filePaths.map((filePath) => fs.unlink(filePath)),
  );

  const errors = results
    .map((result, index) =>
      result.status === "rejected"
        ? { path: filePaths[index], error: result.reason }
        : null,
    )
    .filter(Boolean);

  if (errors.length > 0 && isVerboseEnabled(config)) {
    console.error(
      `[Relinka FS Error] Failed to delete ${errors.length} log files:`,
      errors
        .map(
          (e) =>
            `${e?.path}: ${e?.error instanceof Error ? e.error.message : String(e?.error)}`,
        )
        .join(", "),
    );
  }
}

// Signal handler references for clean shutdown
let sigintHandler: (() => void) | undefined;
let sigtermHandler: (() => void) | undefined;

/**
 * Shuts down the logger, flushing all buffers and clearing timers.
 * As Relinka user - call this at the end of your program to prevent hanging.
 */
export async function relinkaShutdown(): Promise<void> {
  // Clear any pending cleanup timers
  activeTimers.forEach((timer) => clearTimeout(timer));
  activeTimers.length = 0;

  // Make sure cleanupScheduled is reset
  cleanupScheduled = false;

  // Remove signal handlers so Node can exit
  if (sigintHandler) process.off("SIGINT", sigintHandler);
  if (sigtermHandler) process.off("SIGTERM", sigtermHandler);

  // Flush all log buffers to disk
  await flushAllLogBuffers();
}

/**
 * Cleans up old log files if `maxLogFiles` is exceeded.
 * Uses debouncing to avoid excessive cleanup operations.
 */
async function cleanupOldLogFiles(config: RelinkaConfig): Promise<void> {
  const maxFiles = getMaxLogFiles(config);
  const cleanupInterval = getCleanupInterval(config);

  if (!shouldSaveLogs(config) || maxFiles <= 0) return;

  const now = Date.now();

  // Only run cleanup if enough time has passed since the last one
  if (now - lastCleanupTime < cleanupInterval) {
    if (!cleanupScheduled) {
      cleanupScheduled = true;
      const delay = cleanupInterval - (now - lastCleanupTime);

      // Schedule cleanup for later and track the timer
      const timer = setTimeout(() => {
        cleanupScheduled = false;
        lastCleanupTime = Date.now();
        // Remove this timer from the active timers list
        const index = activeTimers.indexOf(timer);
        if (index !== -1) activeTimers.splice(index, 1);

        cleanupOldLogFiles(config).catch((err) => {
          if (isVerboseEnabled(config)) {
            console.error(
              `[Relinka Delayed Cleanup Error] ${
                err instanceof Error ? err.message : String(err)
              }`,
            );
          }
        });
      }, delay);
      timer.unref();

      // Add to active timers list
      activeTimers.push(timer);
    }
    return;
  }

  lastCleanupTime = now;

  try {
    const sortedLogFiles = await getLogFilesSortedByDate(config);

    if (sortedLogFiles.length > maxFiles) {
      const filesToDelete = sortedLogFiles.slice(maxFiles).map((f) => f.path);

      if (filesToDelete.length > 0) {
        await deleteFiles(filesToDelete, config);

        if (isVerboseEnabled(config)) {
          console.log(
            `[Relinka Cleanup] Deleted ${filesToDelete.length} old log file(s). Kept ${maxFiles}.`,
          );
        }
      }
    }
  } catch (err) {
    if (isVerboseEnabled(config)) {
      console.error(
        `[Relinka Cleanup Error] Failed during log cleanup: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}

/**
 * Core function that actually appends a log line to the file.
 */
async function appendToLogFileImmediate(
  config: RelinkaConfig,
  absoluteLogFilePath: string,
  logMessage: string,
): Promise<void> {
  try {
    await fs.ensureDir(path.dirname(absoluteLogFilePath));
    await fs.appendFile(absoluteLogFilePath, `${logMessage}\n`);
  } catch (err) {
    if (isVerboseEnabled(config)) {
      console.error(
        `[Relinka File Error] Failed to write to log file ${absoluteLogFilePath}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}

/**
 * A global promise chain to ensure log file writes happen sequentially.
 */
let logWriteChain = Promise.resolve();

/**
 * Adds a log message to the buffer for a specific file path. Flushes if the buffer size exceeds the configured limit.
 */
function addToLogBuffer(
  config: RelinkaConfig,
  filePath: string,
  message: string,
): Promise<void> {
  const bufferSize = getBufferSize(config);
  let buffer = logBuffers.get(filePath);

  if (!buffer) {
    buffer = {
      filePath,
      entries: [],
      size: 0,
      lastFlush: Date.now(),
    };
    logBuffers.set(filePath, buffer);
  }

  buffer.entries.push(message);
  buffer.size += message.length + 1; // +1 for newline

  // Flush if buffer size exceeds limit
  if (buffer.size >= bufferSize) {
    return flushLogBuffer(config, filePath);
  }

  return Promise.resolve();
}

/**
 * Flushes the log buffer for a specific file path, writing all buffered messages to disk.
 */
function flushLogBuffer(
  config: RelinkaConfig,
  filePath: string,
): Promise<void> {
  const buffer = logBuffers.get(filePath);
  if (!buffer || buffer.entries.length === 0) {
    return Promise.resolve();
  }

  const content = `${buffer.entries.join("\n")}\n`;
  buffer.entries = [];
  buffer.size = 0;
  buffer.lastFlush = Date.now();

  logWriteChain = logWriteChain
    .then(() => {
      return appendToLogFileImmediate(config, filePath, content);
    })
    .catch((err) => {
      if (isVerboseEnabled(config)) {
        console.error(
          `[Relinka Buffer Flush Error] Failed to flush buffer for ${filePath}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    });

  return logWriteChain;
}

/**
 * Queues a log file append, using a buffer system for efficiency.
 */
function queueLogWrite(
  config: RelinkaConfig,
  absoluteLogFilePath: string,
  logMessage: string,
): Promise<void> {
  return addToLogBuffer(config, absoluteLogFilePath, logMessage);
}

/**
 * Flushes all log buffers to disk. Used before process exit or on demand.
 */
export async function flushAllLogBuffers(): Promise<void> {
  const filePaths = Array.from(logBuffers.keys());
  await Promise.all(
    filePaths.map((path) => flushLogBuffer(currentConfig, path)),
  );
}

/* ------------------------------------------------------
   FATAL LOGGING
-------------------------------------------------------- */

/**
 * Logs a "FATAL" error, triggers a debugger in dev, and throws an error.
 */
function internalFatalLogAndThrow(message: string, ...args: unknown[]): never {
  const formatted = formatLogMessage(currentConfig, "fatal", message, args);
  logToConsole(currentConfig, "fatal", formatted);

  if (shouldSaveLogs(currentConfig)) {
    try {
      const absoluteLogFilePath = getLogFilePath(currentConfig);
      // For fatal errors, bypass the buffer and write directly
      fs.ensureDirSync(path.dirname(absoluteLogFilePath));
      fs.appendFileSync(absoluteLogFilePath, `${formatted}\n`);
    } catch (err) {
      console.error(
        `[Relinka Fatal File Error] Failed to write fatal error: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  if (isDevEnv()) {
    // biome-ignore lint/suspicious/noDebugger: intentional for debugging fatal errors
    debugger;
  }

  throw new Error(`Fatal error: ${message}`);
}

/* ------------------------------------------------------
   GOOD-TO-HAVE HELPER FUNCTIONS
-------------------------------------------------------- */

/**
 * If something truly impossible happened, log + throw.
 */
export function shouldNeverHappen(message: string, ...args: unknown[]): never {
  return internalFatalLogAndThrow(message, ...args);
}

/**
 * Truncates a string to a specified length, adding "…" if truncated.
 */
export function truncateString(msg: string, maxLength = 100): string {
  if (!msg || msg.length <= maxLength) return msg;
  return `${msg.slice(0, maxLength - 1)}…`;
}

/**
 * Exhaustiveness check. If we land here, we missed a union case.
 */
export function casesHandled(unexpectedCase: never): never {
  // biome-ignore lint/suspicious/noDebugger: intentional when there's an unhandled case
  debugger;
  throw new Error(
    `A case was not handled for value: ${truncateString(String(unexpectedCase ?? "unknown"))}`,
  );
}

/* -------------------------------------------------- *
 *              PROCESS-EXIT HANDLER GUARD            *
 * -------------------------------------------------- */

/**
 * Ensures we attach exit handlers only once per process,
 * no matter how many times the module is imported.
 */
function registerExitHandlers(): void {
  if ((globalThis as any)[EXIT_GUARD]) return; // already done
  (globalThis as any)[EXIT_GUARD] = true;

  // beforeExit is safe – it doesn't block exit
  process.once("beforeExit", () => {
    void flushAllLogBuffers();
  });

  // Named handler functions for SIGINT/SIGTERM
  sigintHandler = () => {
    void flushAllLogBuffers().finally(() => process.exit(0));
  };
  sigtermHandler = () => {
    void flushAllLogBuffers().finally(() => process.exit(0));
  };
  process.once("SIGINT", sigintHandler);
  process.once("SIGTERM", sigtermHandler);
}

registerExitHandlers(); // <-- called exactly once

/* ------------------------------------------------------
   PUBLIC API: LOGGING FUNCTIONS
-------------------------------------------------------- */

/**
 * Logs a message synchronously using the current config.
 * If type === "fatal", logs a fatal error and throws (never returns).
 */
export function relinka(
  type: LogLevel | "clear",
  message: string,
  ...args: unknown[]
): undefined | never {
  if (type === "clear") {
    console.clear();
    return;
  }

  if (message === "") {
    console.log();
    return;
  }

  const levelName = type.toLowerCase();

  if (levelName === "fatal") {
    return internalFatalLogAndThrow(message, ...args);
  }

  // Skip verbose messages if verbose mode is not enabled
  if (levelName === "verbose" && !isVerboseEnabled(currentConfig)) {
    return;
  }

  const details = args.length > 1 ? args : args[0];
  const formatted = formatLogMessage(
    currentConfig,
    levelName,
    message,
    details,
  );

  logToConsole(currentConfig, levelName, formatted);

  if (shouldSaveLogs(currentConfig) && levelName !== "fatal") {
    const absoluteLogFilePath = getLogFilePath(currentConfig);
    queueLogWrite(currentConfig, absoluteLogFilePath, formatted).catch(
      (err) => {
        if (isVerboseEnabled(currentConfig)) {
          console.error(
            `[Relinka File Error] Failed to write log line: ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }
      },
    );

    // Schedule cleanup
    if (getMaxLogFiles(currentConfig) > 0) {
      cleanupOldLogFiles(currentConfig).catch((err) => {
        if (isVerboseEnabled(currentConfig)) {
          console.error(
            `[Relinka Cleanup Error] ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }
      });
    }
  }
}

/**
 * Logs a message asynchronously, waiting for the config to be fully loaded.
 * If type === "fatal", logs a fatal error and throws (never returns).
 */
export async function relinkaAsync(
  type: LogLevel,
  message: string,
  ...args: unknown[]
): Promise<void> {
  if (message === "") {
    console.log();
    return;
  }

  // Wait for configuration to be loaded
  await relinkaConfig;

  const levelName = type.toLowerCase();

  if (levelName === "fatal") {
    shouldNeverHappen(message, ...args);
  }

  // Skip verbose messages if verbose mode is not enabled
  if (levelName === "verbose" && !isVerboseEnabled(currentConfig)) {
    return;
  }

  const details = args.length > 1 ? args : args[0];
  const formatted = formatLogMessage(
    currentConfig,
    levelName,
    message,
    details,
  );

  logToConsole(currentConfig, levelName, formatted);

  if (shouldSaveLogs(currentConfig)) {
    const absoluteLogFilePath = getLogFilePath(currentConfig);
    try {
      await queueLogWrite(currentConfig, absoluteLogFilePath, formatted);

      // Cleanup old files
      if (getMaxLogFiles(currentConfig) > 0) {
        await cleanupOldLogFiles(currentConfig);
      }
    } catch (err) {
      if (isVerboseEnabled(currentConfig)) {
        console.error(
          `[Relinka File Async Error] Error during file logging/cleanup: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
  }
}

/* -------------------------------------------------- *
 *           DEFINE CONFIG & EXIT HANDLERS            *
 * -------------------------------------------------- */

/**
 * Type helper for user config files.
 */
export function defineConfig(
  config: Partial<RelinkaConfig>,
): Partial<RelinkaConfig> {
  return config;
}
