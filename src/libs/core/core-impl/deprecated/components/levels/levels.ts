import type { LogObject } from "~/libs/core/core-types.js";

/**
 * Defines the level of logs as specific numbers or special number types.
 *
 * @type {0 | 1 | 2 | 3 | 4 | 5 | (number & {})} LogLevelDeprecated - Represents the log level.
 * @default 0 - Represents the default log level.
 */
export type LogLevelDeprecated = 0 | 1 | 2 | 3 | 4 | 5 | (number & {});

/**
 * A mapping of `LogTypeDeprecated` to its corresponding numeric log level.
 *
 * @type {Record<LogTypeDeprecated, number>} LogLevelsDeprecated - key-value pairs of log types to their numeric levels. See {@link LogTypeDeprecated}.
 */
export const LogLevelsDeprecated: Record<LogTypeDeprecated, number> = {
  silent: Number.NEGATIVE_INFINITY,

  fatal: 0,
  error: 0,

  warn: 1,

  log: 2,
  info: 3,

  success: 3,
  fail: 3,
  ready: 3,
  start: 3,
  box: 3,

  debug: 4,

  trace: 5,

  verbose: Number.POSITIVE_INFINITY,
};

/**
 * Lists the types of log messages supported by the system.
 *
 * @type {"silent" | "fatal" | "error" | "warn" | "log" | "info" | "success" | "fail" | "ready" | "start" | "box" | "debug" | "trace" | "verbose"} LogTypeDeprecated - Represents the specific type of log message.
 */
export type LogTypeDeprecated =
  // 0
  | "silent"
  | "fatal"
  | "error"
  // 1
  | "warn"
  // 2
  | "log"
  // 3
  | "info"
  | "success"
  | "fail"
  | "ready"
  | "start"
  | "box"
  // Verbose
  | "debug"
  | "trace"
  | "verbose";

/**
 * Maps `LogTypeDeprecated` to a `Partial<LogObject>`, primarily defining the log level.
 *
 * @type {Record<LogTypeDeprecated, Partial<LogObject>>} LogTypesDeprecated - key-value pairs of log types to partial log objects, specifying log levels. See {@link LogTypeDeprecated} and {@link LogObject}.
 */
export const LogTypesDeprecated: Record<
  LogTypeDeprecated,
  Partial<LogObject>
> = {
  // Silent
  silent: {
    level: -1,
  },

  // Level 0
  fatal: {
    level: LogLevelsDeprecated.fatal,
  },
  error: {
    level: LogLevelsDeprecated.error,
  },

  // Level 1
  warn: {
    level: LogLevelsDeprecated.warn,
  },

  // Level 2
  log: {
    level: LogLevelsDeprecated.log,
  },

  // Level 3
  info: {
    level: LogLevelsDeprecated.info,
  },
  success: {
    level: LogLevelsDeprecated.success,
  },
  fail: {
    level: LogLevelsDeprecated.fail,
  },
  ready: {
    level: LogLevelsDeprecated.info,
  },
  start: {
    level: LogLevelsDeprecated.info,
  },
  box: {
    level: LogLevelsDeprecated.info,
  },

  // Level 4
  debug: {
    level: LogLevelsDeprecated.debug,
  },

  // Level 5
  trace: {
    level: LogLevelsDeprecated.trace,
  },

  // Verbose
  verbose: {
    level: LogLevelsDeprecated.verbose,
  },
};
