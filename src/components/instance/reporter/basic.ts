import { formatWithOptions } from "node:util";

import type {
  LogObject,
  RelinkaReporter,
  FormatOptions,
  RelinkaOptions,
} from "~/types/general.js";

import { parseStack } from "~/utils/error.js";
import { writeStream } from "~/utils/stream.js";

const bracket = (x: string) => (x ? `[${x}]` : "");

export class BasicReporter implements RelinkaReporter {
  formatStack(stack: string, opts: FormatOptions) {
    return "  " + parseStack(stack).join("\n  ");
  }

  formatArgs(args: any[], opts: FormatOptions) {
    const _args = args.map((arg) => {
      if (arg && typeof arg.stack === "string") {
        return arg.message + "\n" + this.formatStack(arg.stack, opts);
      }
      return arg;
    });

    return formatWithOptions(opts, ..._args);
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
      return (
        "\n" +
        [
          bracket(logObj.tag),
          logObj.title && logObj.title,
          ...message.split("\n"),
        ]
          .filter(Boolean)
          .map((l) => " > " + l)
          .join("\n") +
        "\n"
      );
    }

    return this.filterAndJoin([
      bracket(logObj.type),
      bracket(logObj.tag),
      message,
    ]);
  }

  log(logObj: LogObject, ctx: { options: RelinkaOptions }) {
    const line = this.formatLogObj(logObj, {
      columns: (ctx.options.stdout as any).columns || 0,
      ...ctx.options.formatOptions,
    });

    return writeStream(
      line + "\n",
      logObj.level < 2
        ? ctx.options.stderr || process.stderr
        : ctx.options.stdout || process.stdout,
    );
  }
}
