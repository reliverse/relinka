import type {
  LogObject,
  RelinkaReporterDeprecated,
  FormatOptions,
  RelinkaOptionsDeprecated,
} from "deprecated/types.js";

import { parseStack } from "deprecated/utils/error.js";
import { writeStream } from "deprecated/utils/stream.js";
import { formatWithOptions } from "node:util";

const bracket = (x: string) => (x ? `[${x}]` : "");

export class BasicReporter implements RelinkaReporterDeprecated {
  formatStack(stack: string) {
    return `  ${parseStack(stack).join("\n  ")}`;
  }

  formatArgs(args: any[], opts: FormatOptions) {
    const formattedArgs = args.map((arg) => {
      if (arg && typeof arg.stack === "string") {
        return `${arg.message}\n${this.formatStack(arg.stack)}`;
      }
      return arg;
    });

    return formatWithOptions(opts, ...formattedArgs);
  }

  formatDate(date: Date, opts: FormatOptions) {
    return opts.date ? date.toLocaleTimeString() : "";
  }

  filterAndJoin(arr: any[]) {
    return arr.filter(Boolean).join(" ");
  }

  formatLogObj(logObj: LogObject, opts: FormatOptions) {
    const message = this.formatArgs(logObj.args, opts);

    if (logObj.type === "box") {
      return `\n${[
        bracket(logObj.tag),
        logObj.title && logObj.title,
        ...message.split("\n"),
      ]
        .filter(Boolean)
        .map((l) => ` > ${l}`)
        .join("\n")}\n`;
    }

    return this.filterAndJoin([
      bracket(logObj.type),
      bracket(logObj.tag),
      message,
    ]);
  }

  log(logObj: LogObject, ctx: { options: RelinkaOptionsDeprecated }) {
    const line = this.formatLogObj(logObj, {
      columns: (ctx.options.stdout as any).columns || 0,
      ...ctx.options.formatOptions,
    });

    return writeStream(
      `${line}\n`,
      logObj.level < 2
        ? ctx.options.stderr || process.stderr
        : ctx.options.stdout || process.stdout,
    );
  }
}
