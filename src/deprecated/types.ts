/* ======= DEPRECATED ======= */

/**
 * Defines the level of logs as specific numbers or special number types.
 *
 * @type {0 | 1 | 2 | 3 | 4 | 5 | (number & {})} LogLevelDeprecated - Represents the log level.
 * @default 0 - Represents the default log level.
 */
export type LogLevelDeprecated = 0 | 1 | 2 | 3 | 4 | 5 | (number & {});

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

export type RelinkaOptionsDeprecated = {
  /**
   * An array of RelinkaReporterDeprecated instances used to handle and output log messages.
   */
  reporters: RelinkaReporterDeprecated[];

  /**
   * A record mapping LogTypeDeprecated to InputLogObject, defining the log configuration for each log type.
   * See {@link LogTypeDeprecated} and {@link InputLogObject}.
   */
  types: Record<LogTypeDeprecated, InputLogObject>;

  /**
   * The minimum log level to output. See {@link LogLevelDeprecated}.
   */
  level: LogLevelDeprecated;

  /**
   * Default properties applied to all log messages unless overridden. See {@link InputLogObject}.
   */
  defaults: InputLogObject;

  /**
   * The maximum number of times a log message can be repeated within a given timeframe.
   */
  throttle: number;

  /**
   * The minimum time in milliseconds that must elapse before a throttled log message can be logged again.
   */
  throttleMin: number;

  /**
   * The Node.js writable stream for standard output. See {@link NodeJS.WriteStream}.
   * @optional
   */
  stdout?: NodeJS.WriteStream;

  /**
   * The Node.js writeable stream for standard error output. See {@link NodeJS.WriteStream}.
   * @optional
   */
  stderr?: NodeJS.WriteStream;

  /**
   * A function that allows you to mock log messages for testing purposes.
   * @optional
   */
  mockFn?: (
    type: LogTypeDeprecated,
    defaults: InputLogObject,
  ) => (...args: any) => void;

  /**
   * Configuration options for formatting log messages. See {@link FormatOptions}.
   */
  formatOptions: FormatOptions;
};

/**
 * @see https://nodejs.org/api/util.html#util_util_inspect_object_showhidden_depth_colors
 */
export type FormatOptions = {
  /**
   * The maximum number of columns to output, affects formatting.
   * @optional
   */
  columns?: number;

  /**
   * Whether to include timestamp information in log messages.
   * @optional
   */
  date?: boolean;

  /**
   * Whether to use colors in the output.
   * @optional
   */
  colors?: boolean;

  /**
   * Specifies whether or not the output should be compact. Accepts a boolean or numeric level of compactness.
   * @optional
   */
  compact?: boolean | number;

  /**
   * Allows additional custom formatting options.
   */
  [key: string]: unknown;
};

export type InputLogObject = {
  /**
   * The logging level of the message. See {@link LogLevelDeprecated}.
   * @optional
   */
  level?: LogLevelDeprecated;

  /**
   * A string tag to categorize or identify the log message.
   * @optional
   */
  tag?: string;

  /**
   * The type of log message, which affects how it's processed and displayed. See {@link LogTypeDeprecated}.
   * @optional
   */
  type?: LogTypeDeprecated;

  /**
   * The main log message text.
   * @optional
   */
  message?: string;

  /**
   * Additional text or texts to be logged with the message.
   * @optional
   */
  additional?: string | string[];

  /**
   * Additional arguments to be logged with the message.
   * @optional
   */
  args?: any[];

  /**
   * The date and time when the log message was created.
   * @optional
   */
  date?: Date;
};

export type LogObject = {
  /**
   * The logging level of the message, overridden if required. See {@link LogLevelDeprecated}.
   */
  level: LogLevelDeprecated;

  /**
   * The type of log message, overridden if required. See {@link LogTypeDeprecated}.
   */
  type: LogTypeDeprecated;

  /**
   * A string tag to categorize or identify the log message, overridden if necessary.
   */
  tag: string;

  /**
   * Additional arguments to be logged with the message, overridden if necessary.
   */
  args: any[];

  /**
   * The date and time the log message was created, overridden if necessary.
   */
  date: Date;

  /**
   * Allows additional custom properties to be set on the log object.
   */
  [key: string]: unknown;
} & InputLogObject;

export type RelinkaReporterDeprecated = {
  /**
   * Defines how a log message is processed and displayed by this reporter.
   * @param logObj The LogObject containing the log information to process. See {@link LogObject}.
   * @param ctx An object containing context information such as options. See {@link RelinkaOptionsDeprecated}.
   */
  log: (
    logObj: LogObject,
    ctx: {
      options: RelinkaOptionsDeprecated;
    },
  ) => void;
};
