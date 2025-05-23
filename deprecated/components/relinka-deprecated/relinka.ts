import type {
  LogLevelDeprecated,
  LogTypeDeprecated,
} from "deprecated/types.js";
import type {
  InputLogObject,
  LogObject,
  RelinkaOptionsDeprecated,
  RelinkaReporterDeprecated,
} from "deprecated/types.js";

import { defu } from "defu";
import { LogTypesDeprecated } from "deprecated/components/modes/shared.js";
import { isLogObj } from "deprecated/utils/log.js";

/**
 * Relinka class for logging management with support for pause/resume, mocking and customizable reporting.
 * Provides flexible logging capabilities including level-based logging, custom reporters and integration options.
 *
 * @class Relinka
 */
export class RelinkaInterface {
  options: RelinkaOptionsDeprecated;
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

  _mockFn?: RelinkaOptionsDeprecated["mockFn"];

  /**
   * Creates an instance of Relinka with specified options or defaults.
   *
   * @param {Partial<RelinkaOptionsDeprecated>} [options={}] - Configuration options for the Relinka instance.
   */
  constructor(options: Partial<RelinkaOptionsDeprecated> = {}) {
    // Options
    const types = options.types || LogTypesDeprecated;
    this.options = defu(
      {
        ...options,
        defaults: { ...options.defaults },
        level: _normalizeLogLevelDeprecated(options.level, types),
        reporters: [...(options.reporters || [])],
      } as RelinkaOptionsDeprecated,
      {
        types: LogTypesDeprecated,
        throttle: 1000,
        throttleMin: 5,
        formatOptions: {
          date: true,
          colors: false,
          compact: true,
        },
      } as Partial<RelinkaOptionsDeprecated>,
    );

    // Create logger functions for current instance
    for (const type in types) {
      const defaults: InputLogObject = {
        type: type as LogTypeDeprecated,
        ...this.options.defaults,
        ...types[type as LogTypeDeprecated],
      };
      // @ts-expect-error TODO: fix ts
      (this as unknown as RelinkaInstanceDeprecated)[
        type as LogTypeDeprecated
      ] = this._wrapLogFn(defaults);
      (this as unknown as RelinkaInstanceDeprecated)[type].raw =
        this._wrapLogFn(defaults, true);
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
    this.options.level = _normalizeLogLevelDeprecated(
      level,
      this.options.types,
      this.options.level,
    );
  }

  /**
   * Creates a new instance of Relinka, inheriting options from the current instance, with possible overrides.
   *
   * @param {Partial<RelinkaOptionsDeprecated>} options - Optional overrides for the new instance. See {@link RelinkaOptionsDeprecated}.
   * @returns {RelinkaInstanceDeprecated} A new Relinka instance. See {@link RelinkaInstanceDeprecated}.
   */
  create(
    options: Partial<RelinkaOptionsDeprecated>,
  ): RelinkaInstanceDeprecated {
    const instance = new RelinkaInterface({
      ...this.options,
      ...options,
    }) as RelinkaInstanceDeprecated;

    if (this._mockFn) {
      instance.mockTypes(this._mockFn);
    }

    return instance;
  }

  /**
   * Creates a new Relinka instance with the specified default log object properties.
   *
   * @param {InputLogObject} defaults - Default properties to include in any log from the new instance. See {@link InputLogObject}.
   * @returns {RelinkaInstanceDeprecated} A new Relinka instance. See {@link RelinkaInstanceDeprecated}.
   */
  withDefaults(defaults: InputLogObject): RelinkaInstanceDeprecated {
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
   * @returns {RelinkaInstanceDeprecated} A new Relinka instance. See {@link RelinkaInstanceDeprecated}.
   */
  withTag(tag: string): RelinkaInstanceDeprecated {
    return this.withDefaults({
      tag: this.options.defaults.tag
        ? `${this.options.defaults.tag}:${tag}`
        : tag,
    });
  }

  /**
   * Adds a custom reporter to the Relinka instance.
   * Reporters will be called for each log message, depending on their implementation and log level.
   *
   * @param {RelinkaReporterDeprecated} reporter - The reporter to add. See {@link RelinkaReporterDeprecated}.
   * @returns {Relinka} The current Relinka instance.
   */
  addReporter(reporter: RelinkaReporterDeprecated) {
    this.options.reporters.push(reporter);
    return this;
  }

  /**
   * Removes a custom reporter from the Relinka instance.
   * If no reporter is specified, all reporters will be removed.
   *
   * @param {RelinkaReporterDeprecated} reporter - The reporter to remove. See {@link RelinkaReporterDeprecated}.
   * @returns {Relinka} The current Relinka instance.
   */
  removeReporter(reporter: RelinkaReporterDeprecated) {
    if (reporter) {
      const i = this.options.reporters.indexOf(reporter);
      if (i >= 0) {
        return this.options.reporters.splice(i, 1);
      }
    } else {
      this.options.reporters.splice(0);
    }
    return this;
  }

  /**
   * Replaces all reporters of the Relinka instance with the specified array of reporters.
   *
   * @param {RelinkaReporterDeprecated[]} reporters - The new reporters to set. See {@link RelinkaReporterDeprecated}.
   * @returns {Relinka} The current Relinka instance.
   */
  setReporters(reporters: RelinkaReporterDeprecated[]) {
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
      if (!(console as any)[`__${type}`]) {
        (console as any)[`__${type}`] = (console as any)[type];
      }
      // Override
      (console as any)[type] = (this as unknown as RelinkaInstanceDeprecated)[
        type as LogTypeDeprecated
      ].raw;
    }
  }

  /**
   * Restores the original console methods, removing Relinka overrides.
   */
  restoreConsole() {
    for (const type in this.options.types) {
      // Restore if backup is available
      if ((console as any)[`__${type}`]) {
        (console as any)[type] = (console as any)[`__${type}`];

        delete (console as any)[`__${type}`];
      }
    }
  }

  /**
   * Overrides standard output and error streams to redirect them through RelinkaInterface.
   */
  wrapStd() {
    this._wrapStream(this.options.stdout, "log");
    this._wrapStream(this.options.stderr, "log");
  }

  _wrapStream(stream: NodeJS.WriteStream | undefined, type: LogTypeDeprecated) {
    if (!stream) {
      return;
    }

    // Backup original value
    if (!(stream as any).__write) {
      (stream as any).__write = stream.write;
    }

    // Override
    (stream as any).write = (data: any) => {
      (this as unknown as RelinkaInstanceDeprecated)[type].raw(
        String(data).trim(),
      );
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
      (stream as any).__write = undefined;
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

    // TODO: Remove all reporters
    // this.removeReporter();

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
   * @param {RelinkaOptionsDeprecated["mockFn"]} mockFn - The function to use for mocking logging methods. See {@link RelinkaOptionsDeprecated["mockFn"]}.
   */
  mockTypes(mockFn?: RelinkaOptionsDeprecated["mockFn"]) {
    const _mockFn = mockFn || this.options.mockFn;

    this._mockFn = _mockFn;

    if (typeof _mockFn !== "function") {
      return;
    }

    for (const type in this.options.types) {
      // @ts-expect-error TODO: fix ts
      (this as unknown as RelinkaInstanceDeprecated)[
        type as LogTypeDeprecated
      ] =
        _mockFn(
          type as LogTypeDeprecated,
          this.options.types[type as LogTypeDeprecated],
        ) ||
        (this as unknown as RelinkaInstanceDeprecated)[
          type as LogTypeDeprecated
        ];
      (this as unknown as RelinkaInstanceDeprecated)[
        type as LogTypeDeprecated
      ].raw = (this as unknown as RelinkaInstanceDeprecated)[
        type as LogTypeDeprecated
      ];
    }
  }

  // _wrapLogFn uses instances: _paused, _queue, etc
  _wrapLogFn(defaults: InputLogObject, isRaw?: boolean) {
    return (...args: any[]) => {
      if (this._paused) {
        this._queue.push([this, defaults, args, isRaw]);
        return false;
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
      level: _normalizeLogLevelDeprecated(defaults.level, this.options.types),
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
      logObj.message = undefined;
    }
    if (logObj.additional) {
      if (!Array.isArray(logObj.additional)) {
        logObj.additional = logObj.additional.split("\n");
      }

      logObj.args.push(`\n${logObj.additional.join("\n")}`);
      logObj.additional = undefined;
    }

    // Normalize type to lowercase
    logObj.type = (
      typeof logObj.type === "string" ? logObj.type.toLowerCase() : "log"
    ) as LogTypeDeprecated;
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
        // @ts-expect-error TODO: fix ts
        this._lastLog.object = logObj;
        // @ts-expect-error TODO: fix ts
        this._log(logObj);
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
            return false; // SPAM!
          }
        }
      } catch {
        // Circular References
        return true;
      }
    }

    resolveLog(true);
    return true;
  }

  _log(logObj: LogObject) {
    for (const reporter of this.options.reporters) {
      reporter.log(logObj, {
        options: this.options,
      });
    }
  }
}

function _normalizeLogLevelDeprecated(
  input: LogLevelDeprecated | LogTypeDeprecated | undefined,
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
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  (message: InputLogObject | any, ...args: any[]): void;
  raw: (...args: any[]) => void;
};
export type RelinkaInstanceDeprecated = RelinkaInterface &
  Record<LogTypeDeprecated, LogFn>;

// Legacy support
// @ts-expect-error TODO: fix ts
RelinkaInterface.prototype.add = RelinkaInterface.prototype.addReporter;
// @ts-expect-error TODO: fix ts
RelinkaInterface.prototype.remove = RelinkaInterface.prototype.removeReporter;
// @ts-expect-error TODO: fix ts
RelinkaInterface.prototype.clear = RelinkaInterface.prototype.removeReporter;
// @ts-expect-error TODO: fix ts
RelinkaInterface.prototype.withScope = RelinkaInterface.prototype.withTag;
// @ts-expect-error TODO: fix ts
RelinkaInterface.prototype.mock = RelinkaInterface.prototype.mockTypes;
// @ts-expect-error TODO: fix ts
RelinkaInterface.prototype.pause = RelinkaInterface.prototype.pauseLogs;
// @ts-expect-error TODO: fix ts
RelinkaInterface.prototype.resume = RelinkaInterface.prototype.resumeLogs;

/**
 * Utility for creating a new Relinka instance with optional configuration.
 *
 * @param {Partial<RelinkaOptionsDeprecated>} [options={}] - Optional configuration options for the new Relinka instance. See {@link RelinkaOptionsDeprecated}.
 * @returns {RelinkaInstanceDeprecated} A new instance of RelinkaInterface. See {@link RelinkaInstanceDeprecated}.
 */
export function createRelinkaDeprecated(
  options: Partial<RelinkaOptionsDeprecated> = {},
): RelinkaInstanceDeprecated {
  return new RelinkaInterface(options) as RelinkaInstanceDeprecated;
}
