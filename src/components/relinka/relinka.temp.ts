import { defu } from "defu";

import type { LogType, LogLevel } from "~/components/levels/levels.js";
import type {
  RelinkaReporter,
  InputLogObject,
  LogObject,
  RelinkaOptions,
} from "~/types/mod.js";

import { LogTypes } from "~/components/levels/levels.js";
import { isLogObj } from "~/utils/log.js";

/**
 * Relinka class for logging management with support for pause/resume, mocking and customizable reporting.
 * Provides flexible logging capabilities including level-based logging, custom reporters and integration options.
 *
 * @class Relinka
 */
export class Relinka {
  options: RelinkaOptions;
  _lastLog: {
    serialized?: string;
    object?: LogObject;
    count?: number;
    time?: Date;
    timeout?: ReturnType<typeof setTimeout>;
  };

  // Instance properties for paused state and queue
  _paused: boolean;
  _queue: any[];

  _mockFn?: RelinkaOptions["mockFn"];

  /**
   * Creates an instance of Relinka with specified options or defaults.
   *
   * @param {Partial<RelinkaOptions>} [options={}] - Configuration options for the Relinka instance.
   */
  constructor(options: Partial<RelinkaOptions> = {}) {
    // Options
    const types = options.types || LogTypes;
    this.options = defu(
      {
        ...options,
        defaults: { ...options.defaults },
        level: _normalizeLogLevel(options.level, types),
        reporters: [...(options.reporters || [])],
      } as RelinkaOptions,
      {
        types: LogTypes,
        throttle: 1000,
        throttleMin: 5,
        formatOptions: {
          date: true,
          colors: false,
          compact: true,
        },
      } as Partial<RelinkaOptions>,
    );

    // Create logger functions for current instance
    for (const type in types) {
      const defaults: InputLogObject = {
        type: type as LogType,
        ...this.options.defaults,
        ...types[type as LogType],
      };
      (this as any)[type as LogType] = this._wrapLogFn(defaults);
      (this as any)[type as LogType].raw = this._wrapLogFn(defaults, true);
    }

    // Use _mockFn if is set
    if (this.options.mockFn) {
      this.mockTypes();
    }

    // Track of last log
    this._lastLog = {};

    // Initialize instance properties
    this._paused = false;
    this._queue = [];
  }

  /**
   * Gets the current log level of the Relinka instance.
   *
   * @returns {number} The current log level.
   */
  get level() {
    return this.options.level;
  }

  /**
   * Sets the minimum log level that will be output by the instance.
   *
   * @param {number} level - The new log level to set.
   */
  set level(level) {
    this.options.level = _normalizeLogLevel(
      level,
      this.options.types,
      this.options.level,
    );
  }

  /**
   * Creates a new instance of Relinka, inheriting options from the current instance, with possible overrides.
   *
   * @param {Partial<RelinkaOptions>} options - Optional overrides for the new instance. See {@link RelinkaOptions}.
   * @returns {Relinka} A new Relinka instance.
   */
  create(options: Partial<RelinkaOptions>): Relinka {
    const instance = new Relinka({
      ...this.options,
      ...options,
    });

    if (this._mockFn) {
      instance.mockTypes(this._mockFn);
    }

    return instance;
  }

  /**
   * Creates a new Relinka instance with the specified default log object properties.
   *
   * @param {InputLogObject} defaults - Default properties to include in any log from the new instance. See {@link InputLogObject}.
   * @returns {Relinka} A new Relinka instance.
   */
  withDefaults(defaults: InputLogObject): Relinka {
    return this.create({
      ...this.options,
      defaults: {
        ...this.options.defaults,
        ...defaults,
      },
    });
  }

  /**
   * Creates a new Relinka instance with a specified tag, which will be included in every log.
   *
   * @param {string} tag - The tag to include in each log of the new instance.
   * @returns {Relinka} A new Relinka instance.
   */
  withTag(tag: string): Relinka {
    return this.withDefaults({
      tag: this.options.defaults.tag
        ? this.options.defaults.tag + ":" + tag
        : tag,
    });
  }

  /**
   * Adds a custom reporter to the Relinka instance.
   * Reporters will be called for each log message, depending on their implementation and log level.
   *
   * @param {RelinkaReporter} reporter - The reporter to add. See {@link RelinkaReporter}.
   * @returns {Relinka} The current Relinka instance.
   */
  addReporter(reporter: RelinkaReporter) {
    this.options.reporters.push(reporter);
    return this;
  }

  /**
   * Removes a custom reporter from the Relinka instance.
   * If no reporter is specified, all reporters will be removed.
   *
   * @param {RelinkaReporter} [reporter] - The reporter to remove. See {@link RelinkaReporter}.
   * @returns {Relinka} The current Relinka instance.
   */
  removeReporter(reporter?: RelinkaReporter) {
    if (reporter) {
      const i = this.options.reporters.indexOf(reporter);
      if (i >= 0) {
        this.options.reporters.splice(i, 1);
      }
    } else {
      this.options.reporters.splice(0);
    }
    return this;
  }

  /**
   * Replaces all reporters of the Relinka instance with the specified array of reporters.
   *
   * @param {RelinkaReporter[]} reporters - The new reporters to set. See {@link RelinkaReporter}.
   * @returns {Relinka} The current Relinka instance.
   */
  setReporters(reporters: RelinkaReporter[]) {
    this.options.reporters = Array.isArray(reporters) ? reporters : [reporters];
    return this;
  }

  wrapAll() {
    this.wrapConsole();
    this.wrapStd();
  }

  restoreAll() {
    this.restoreConsole();
    this.restoreStd();
  }

  /**
   * Overrides console methods with Relinka logging methods for consistent logging.
   */
  wrapConsole() {
    for (const type in this.options.types) {
      // Backup original value
      if (!(console as any)["__" + type]) {
        (console as any)["__" + type] = (console as any)[type];
      }
      // Override
      (console as any)[type] = (this as any)[type as LogType].raw;
    }
  }

  /**
   * Restores the original console methods, removing Relinka overrides.
   */
  restoreConsole() {
    for (const type in this.options.types) {
      // Restore if backup is available
      if ((console as any)["__" + type]) {
        (console as any)[type] = (console as any)["__" + type];
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (console as any)["__" + type];
      }
    }
  }

  /**
   * Overrides standard output and error streams to redirect them through Relinka.
   */
  wrapStd() {
    this._wrapStream(this.options.stdout, "log");
    this._wrapStream(this.options.stderr, "log");
  }

  _wrapStream(stream: NodeJS.WriteStream | undefined, type: LogType) {
    if (!stream) {
      return;
    }

    // Backup original value
    if (!(stream as any).__write) {
      (stream as any).__write = stream.write;
    }

    // Override
    (stream as any).write = (data: any) => {
      (this as any)[type].raw(String(data).trim());
    };
  }

  /**
   * Restores the original standard output and error streams, removing the Relinka redirection.
   */
  restoreStd() {
    this._restoreStream(this.options.stdout);
    this._restoreStream(this.options.stderr);
  }

  _restoreStream(stream?: NodeJS.WriteStream) {
    if (!stream) {
      return;
    }

    if ((stream as any).__write) {
      stream.write = (stream as any).__write;
      delete (stream as any).__write;
    }
  }

  /**
   * Clears the internal state of the Relinka instance.
   * This will reset any throttling, last log data, clear any queued logs,
   * and optionally clear the actual console.
   *
   * @param {boolean} clearConsole - Whether to clear the actual console. Defaults to false.
   */
  clear(clearConsole = false) {
    // Reset _lastLog
    this._lastLog = {};

    // Clear queue
    this._queue = [];

    // Reset paused state
    this._paused = false;

    // Remove all reporters
    this.removeReporter();

    // Optionally clear the actual console
    if (clearConsole && typeof console.clear === "function") {
      console.clear();
    }
  }

  /**
   * Pauses logging, queues incoming logs until resumed.
   */
  pauseLogs() {
    this._paused = true;
  }

  /**
   * Resumes logging, processing any queued logs.
   */
  resumeLogs() {
    this._paused = false;

    // Process queue
    const _queue = this._queue.splice(0);
    for (const item of _queue) {
      item[0]._logFn(item[1], item[2]);
    }
  }

  /**
   * Replaces logging methods with mocks if a mock function is provided.
   *
   * @param {RelinkaOptions["mockFn"]} [mockFn] - The function to use for mocking logging methods. See {@link RelinkaOptions["mockFn"]}.
   */
  mockTypes(mockFn?: RelinkaOptions["mockFn"]) {
    const _mockFn = mockFn || this.options.mockFn;

    this._mockFn = _mockFn;

    if (typeof _mockFn !== "function") {
      return;
    }

    for (const type in this.options.types) {
      (this as any)[type as LogType] =
        _mockFn(type as LogType, this.options.types[type as LogType]) ||
        (this as any)[type as LogType];
      (this as any)[type as LogType].raw = (this as any)[type as LogType];
    }
  }

  // _wrapLogFn uses instances: _paused, _queue, etc
  _wrapLogFn(defaults: InputLogObject, isRaw?: boolean) {
    return (...args: any[]) => {
      if (this._paused) {
        this._queue.push([this, defaults, args, isRaw]);
        return;
      }
      return this._logFn(defaults, args, isRaw);
    };
  }

  _logFn(defaults: InputLogObject, args: any[], isRaw?: boolean) {
    if (((defaults.level as number) || 0) > this.level) {
      return false;
    }

    // Construct a new log object
    const logObj: Partial<LogObject> = {
      date: new Date(),
      args: [],
      ...defaults,
      level: _normalizeLogLevel(defaults.level, this.options.types),
    };

    // Consume arguments
    if (!isRaw && args.length === 1 && isLogObj(args[0])) {
      Object.assign(logObj, args[0]);
    } else {
      logObj.args = [...args];
    }

    // Aliases
    if (logObj.message) {
      logObj.args.unshift(logObj.message);
      delete logObj.message;
    }
    if (logObj.additional) {
      if (!Array.isArray(logObj.additional)) {
        logObj.additional = logObj.additional.split("\n");
      }

      logObj.args.push("\n" + logObj.additional.join("\n"));
      delete logObj.additional;
    }

    // Normalize type to lowercase
    logObj.type = (
      typeof logObj.type === "string" ? logObj.type.toLowerCase() : "log"
    ) as LogType;
    logObj.tag = typeof logObj.tag === "string" ? logObj.tag : "";

    // Resolve log
    /**
     * @param newLog false if the throttle expired and
     *  we don't want to log a duplicate
     */
    const resolveLog = (newLog = false) => {
      const repeated = (this._lastLog.count || 0) - this.options.throttleMin;
      if (this._lastLog.object && repeated > 0) {
        const args = [...this._lastLog.object.args];
        if (repeated > 1) {
          args.push(`(repeated ${repeated} times)`);
        }
        this._log({ ...this._lastLog.object, args });
        this._lastLog.count = 1;
      }

      // Log
      if (newLog) {
        this._lastLog.object = logObj as LogObject;
        this._log(logObj as LogObject);
      }
    };

    // Throttle
    clearTimeout(this._lastLog.timeout);
    const diffTime =
      this._lastLog.time && logObj.date
        ? logObj.date.getTime() - this._lastLog.time.getTime()
        : 0;
    this._lastLog.time = logObj.date;
    if (diffTime < this.options.throttle) {
      try {
        const serializedLog = JSON.stringify([
          logObj.type,
          logObj.tag,
          logObj.args,
        ]);
        const isSameLog = this._lastLog.serialized === serializedLog;
        this._lastLog.serialized = serializedLog;
        if (isSameLog) {
          this._lastLog.count = (this._lastLog.count || 0) + 1;
          if (this._lastLog.count > this.options.throttleMin) {
            // Auto-resolve when throttle is timed out
            this._lastLog.timeout = setTimeout(
              resolveLog,
              this.options.throttle,
            );
            return; // SPAM!
          }
        }
      } catch {
        // Circular References
      }
    }

    resolveLog(true);
  }

  _log(logObj: LogObject) {
    for (const reporter of this.options.reporters) {
      reporter.log(logObj, {
        options: this.options,
      });
    }
  }
}

function _normalizeLogLevel(
  input: LogLevel | LogType | undefined,
  types: any = {},
  defaultLevel = 3,
) {
  if (input === undefined) {
    return defaultLevel;
  }
  if (typeof input === "number") {
    return input;
  }
  if (types[input] && types[input].level !== undefined) {
    return types[input].level;
  }
  return defaultLevel;
}
export type LogFn = {
  (message: InputLogObject, ...args: unknown[]): void;
  raw: (...args: unknown[]) => void;
};
export type RelinkaInstance = Relinka & Record<LogType, LogFn>;

// Legacy support
(Relinka.prototype as any).add = Relinka.prototype.addReporter;
(Relinka.prototype as any).remove = Relinka.prototype.removeReporter;
(Relinka.prototype as any).clear = Relinka.prototype.removeReporter;
(Relinka.prototype as any).withScope = Relinka.prototype.withTag;
(Relinka.prototype as any).mock = Relinka.prototype.mockTypes;
(Relinka.prototype as any).pause = Relinka.prototype.pauseLogs;
(Relinka.prototype as any).resume = Relinka.prototype.resumeLogs;

/**
 * Utility for creating a new Relinka instance with optional configuration.
 *
 * @param {Partial<RelinkaOptions>} [options={}] - Optional configuration options for the new Relinka instance. See {@link RelinkaOptions}.
 * @returns {Relinka} A new instance of Relinka.
 */
export function createRelinka(options: Partial<RelinkaOptions> = {}): Relinka {
  return new Relinka(options);
}
