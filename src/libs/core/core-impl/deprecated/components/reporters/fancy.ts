import { isUnicodeSupported } from "@reliverse/runtime";
import stringWidth from "string-width";

import type {
  LogLevelDeprecated,
  LogTypeDeprecated,
} from "~/libs/core/core-impl/deprecated/components/levels/levels.js";
import type { FormatOptions, LogObject } from "~/libs/core/core-types.js";

import { BasicReporter } from "~/libs/core/core-impl/deprecated/components/reporters/basic.js";
import {
  box,
  type BoxOpts,
} from "~/libs/core/core-impl/deprecated/utils/box.js";
import { colors } from "~/libs/core/core-impl/deprecated/utils/deprecatedColors.js";
import { parseStack } from "~/libs/core/core-impl/deprecated/utils/error.js";
import { stripAnsi } from "~/libs/core/core-impl/deprecated/utils/string.js";

export const TYPE_COLOR_MAP: Partial<Record<LogTypeDeprecated, string>> = {
  info: "cyan",
  fail: "red",
  success: "green",
  ready: "green",
  start: "magenta",
};

export const LEVEL_COLOR_MAP: Partial<Record<LogLevelDeprecated, string>> = {
  0: "red",
  1: "yellow",
};

const unicode = isUnicodeSupported();
const s = (c: string, fallback: string) => (unicode ? c : fallback);
const TYPE_ICONS: Partial<Record<LogTypeDeprecated, string>> = {
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

function getStringWidth(str: string) {
  if (!Intl.Segmenter) {
    return stripAnsi(str).length;
  }
  return stringWidth(str);
}

export class FancyReporter extends BasicReporter {
  override formatStack(stack: string) {
    return `\n${parseStack(stack)
      .map(
        (line) =>
          `  ${line
            .replace(/^at +/, (m) => colors.gray(m))
            .replace(/\((.+)\)/, (_, m) => `(${colors.cyan(m)})`)}`,
      )
      .join("\n")}`;
  }

  formatType(logObj: LogObject, isBadge: boolean) {
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

  override formatLogObj(logObj: LogObject, opts: FormatOptions) {
    const [message, ...additional] = this.formatArgs(logObj.args, opts).split(
      "\n",
    );

    if (logObj.type === "box") {
      return box(
        characterFormat(
          message + (additional.length > 0 ? `\n${additional.join("\n")}` : ""),
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
    const type = this.formatType(logObj, isBadge);

    const tag = logObj.tag ? colors.gray(logObj.tag) : "";

    let line: string;
    const left = this.filterAndJoin([type, characterFormat(message)]);
    const right = this.filterAndJoin(opts.columns ? [tag, coloredDate] : [tag]);
    const space =
      (opts.columns || 0) - getStringWidth(left) - getStringWidth(right) - 2;

    line =
      space > 0 && (opts.columns || 0) >= 80
        ? left + " ".repeat(space) + right
        : (right ? `${colors.gray(`[${right}]`)} ` : "") + left;

    line += characterFormat(
      additional.length > 0 ? `\n${additional.join("\n")}` : "",
    );

    if (logObj.type === "trace") {
      const _err = new Error(`Trace: ${logObj.message}`);
      line += this.formatStack(_err.stack || "");
    }

    return isBadge ? `\n${line}\n` : line;
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
