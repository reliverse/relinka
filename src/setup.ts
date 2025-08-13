import type { DefaultColorKeys } from "@reliverse/relico";

/* -------------------------------------------------- *
 *                     CONSTANTS                      *
 * -------------------------------------------------- */

export const ENABLE_DEV_DEBUG = false;

/* single flag that survives multiple imports  */
export const EXIT_GUARD = Symbol.for("relinka.exitHandlersRegistered");

/* -------------------------------------------------- *
 *                 TYPE DECLARATIONS                  *
 * -------------------------------------------------- */

/** Configuration for directory-related settings. */
export type RelinkaDirsConfig = {
  maxLogFiles?: number;
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
  | "internal"
  | "null"
  | "step"
  | "box"
  | "message";

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
   * - `maxLogFiles`: The maximum number of log files to keep before cleanup.
   */
  dirs?: RelinkaDirsConfig;

  /**
   * Disables color output in the console.
   */
  disableColors?: boolean;

  /**
   * Configuration for log file output.
   */
  logFile?: {
    /**
     * Path to the log file.
     */
    outputPath?: string;
    /**
     * How to handle date in the filename.
     * - `disable`: No date prefix/suffix
     * - `append-before`: Add date before the filename (e.g., "2024-01-15-log.txt")
     * - `append-after`: Add date after the filename (e.g., "log-2024-01-15.txt")
     */
    nameWithDate?: "disable" | "append-before" | "append-after";
    /**
     * If true, clears the log file when relinkaConfig is executed with supportFreshLogFile: true.
     * This is useful for starting with a clean log file on each run.
     */
    freshLogFile?: boolean;
  };

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
export const DEFAULT_RELINKA_CONFIG: RelinkaConfig = {
  verbose: false,
  dirs: {
    maxLogFiles: 0,
  },
  disableColors: false,
  logFile: {
    outputPath: "logs.log",
    nameWithDate: "disable",
    freshLogFile: true,
  },
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
    internal: {
      symbol: "⚙",
      fallbackSymbol: "[INTERNAL]",
      color: "magentaBright",
      spacing: 3,
    },
    log: { symbol: "│", fallbackSymbol: "|", color: "dim", spacing: 3 },
    step: {
      symbol: "→",
      fallbackSymbol: "[STEP]",
      color: "blueBright",
      spacing: 3,
    },
    box: {
      symbol: "■",
      fallbackSymbol: "[BOX]",
      color: "whiteBright",
      spacing: 1,
    },
    message: {
      symbol: "🞠",
      fallbackSymbol: "[MSG]",
      color: "cyan",
      spacing: 3,
    },
    null: { symbol: "", fallbackSymbol: "", color: "dim", spacing: 0 },
  },
};

/**
 * Enhanced relinka function type that supports both traditional and method syntax
 */
export type RelinkaFunction = {
  // Traditional function signature
  (
    type: LogLevel | "clear",
    message: string,
    ...args: unknown[]
  ): undefined | never;

  // Method properties for each log level
  error(message: string, ...args: unknown[]): void;
  fatal(message: string, ...args: unknown[]): never;
  info(message: string, ...args: unknown[]): void;
  success(message: string, ...args: unknown[]): void;
  verbose(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  log(message: string, ...args: unknown[]): void;
  internal(message: string, ...args: unknown[]): void;
  null(message: string, ...args: unknown[]): void;
  step(message: string, ...args: unknown[]): void;
  box(message: string, ...args: unknown[]): void;
  message(message: string, ...args: unknown[]): void;
  clear(): void;
};

/** Options for relinkaConfig */
export type RelinkaConfigOptions = {
  supportFreshLogFile?: boolean;
};
