import isUnicodeSupported from "is-unicode-supported";
import _stringWidth from "string-width";

import type { FormatOptions, LogObject } from "~/types/general.js";
import type { BoxOpts } from "~/utils/box.js";
import type { LogLevel, LogType } from "~/utils/constants.js";

import { box } from "~/utils/box.js";
import { colors } from "~/utils/color.js";
import { parseStack } from "~/utils/error.js";
import { stripAnsi } from "~/utils/utils.js";

import { BasicReporter } from "./basic.js";

export const TYPE_COLOR_MAP: Partial<Record<LogType, string>> = {
  info: "cyan",
  fail: "red",
  success: "green",
  ready: "green",
  start: "magenta",
};

export const LEVEL_COLOR_MAP: Partial<Record<LogLevel, string>> = {
  0: "red",
  1: "yellow",
};

const unicode = isUnicodeSupported();
const s = (c: string, fallback: string) => (unicode ? c : fallback);
const TYPE_ICONS: Partial<Record<LogType, string>> = {
  error: s("✖", "×"),
  fatal: s("✖", "×"),
  ready: s("✔", "√"),
  warn: s("⚠", "‼"),
  info: s("ℹ", "i"),
  success: s("✔", "√"),
  debug: s("⚙", "D"),
  trace: s("→", "→"),
  fail: s("✖", "×"),
  start: s("◐", "o"),
  log: "",
};

function stringWidth(str: string) {
  if (!Intl.Segmenter) {
    return stripAnsi(str).length;
  }
  return _stringWidth(str);
}

export class FancyReporter extends BasicReporter {
  // @ts-expect-error TODO: fix ts
  formatStack(stack: string) {
    return (
      "\n" +
      parseStack(stack)
        .map(
          (line) =>
            "  " +
            line
              .replace(/^at +/, (m) => colors.gray(m))
              .replace(/\((.+)\)/, (_, m) => `(${colors.cyan(m)})`),
        )
        .join("\n")
    );
  }

  formatType(logObj: LogObject, isBadge: boolean, opts: FormatOptions) {
    const typeColor =
      (TYPE_COLOR_MAP as any)[logObj.type] ||
      (LEVEL_COLOR_MAP as any)[logObj.level] ||
      "gray";

    if (isBadge) {
      return getBgColor(typeColor)(
        colors.black(` ${logObj.type.toUpperCase()} `),
      );
    }

    const _type =
      typeof (TYPE_ICONS as any)[logObj.type] === "string"
        ? (TYPE_ICONS as any)[logObj.type]
        : (logObj as any).icon || logObj.type;

    return _type ? getColor(typeColor)(_type) : "";
  }

  // @ts-expect-error TODO: fix ts
  formatLogObj(logObj: LogObject, opts: FormatOptions) {
    const [message, ...additional] = this.formatArgs(logObj.args, opts).split(
      "\n",
    );

    if (logObj.type === "box") {
      return box(
        characterFormat(
          message + (additional.length > 0 ? "\n" + additional.join("\n") : ""),
        ),
        {
          title: logObj.title
            ? characterFormat(logObj.title as string)
            : undefined,
          style: logObj.style as BoxOpts["style"],
        },
      );
    }

    const date = this.formatDate(logObj.date, opts);
    const coloredDate = date && colors.gray(date);

    const isBadge = (logObj.badge as boolean) ?? logObj.level < 2;
    const type = this.formatType(logObj, isBadge, opts);

    const tag = logObj.tag ? colors.gray(logObj.tag) : "";

    let line;
    const left = this.filterAndJoin([type, characterFormat(message)]);
    const right = this.filterAndJoin(opts.columns ? [tag, coloredDate] : [tag]);
    const space =
      (opts.columns || 0) - stringWidth(left) - stringWidth(right) - 2;

    line =
      space > 0 && (opts.columns || 0) >= 80
        ? left + " ".repeat(space) + right
        : (right ? `${colors.gray(`[${right}]`)} ` : "") + left;

    line += characterFormat(
      additional.length > 0 ? "\n" + additional.join("\n") : "",
    );

    if (logObj.type === "trace") {
      const _err = new Error("Trace: " + logObj.message);
      line += this.formatStack(_err.stack || "");
    }

    return isBadge ? "\n" + line + "\n" : line;
  }
}

function characterFormat(str: string) {
  return (
    str
      // highlight backticks
      .replace(/`([^`]+)`/gm, (_, m) => colors.cyan(m))
      // underline underscores
      .replace(/\s+_([^_]+)_\s+/gm, (_, m) => ` ${colors.underline(m)} `)
  );
}

function getColor(color = "white") {
  return (colors as any)[color] || colors.white;
}

function getBgColor(color = "bgWhite") {
  return (
    (colors as any)[`bg${color[0].toUpperCase()}${color.slice(1)}`] ||
    colors.bgWhite
  );
}
