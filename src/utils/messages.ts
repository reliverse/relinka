import { greenBright, redBright ,dim} from "picocolors";

import type {
  ColorName,
  FmtMsgOptions,
  MsgConfig,
  MsgType,
} from "~/types/general.js";

import { colorMap, typographyMap } from "~/utils/mapping.js";
import { isUnicodeSupported } from "~/utils/platforms.js";
import { variantMap } from "~/utils/variants.js";

const unicode = isUnicodeSupported();
const u = (c: string, fallback: string) => (unicode ? c : fallback);
export const symbols = {
  pointer: u("👉", ">"),
  start: u("╭", "T"),
  middle: u("│", "|"),
  end: u("╰", "*"),
  line: u("─", "—"),
  corner_top_right: u("»", "T"),
  step_active: u("◆", "♦"),
  step_error: u("🗴", "x"),
  info: u("ℹ", "i"),
};

function applyStyles(
  text: string,
  colorName = "",
  typographyName = "",
  variantName = "",
  borderColor = "",
) {
  let styledText = text;

  if (!variantName) {
    if (colorName && colorMap[colorName]) {
      styledText = colorMap[colorName](styledText);
    } else if (colorName) {
      console.warn(
        `Warning: Invalid color "${colorName}" provided to applyStyles.`,
      );
    }

    if (typographyName && typographyMap[typographyName]) {
      styledText = typographyMap[typographyName](styledText);
    } else if (typographyName) {
      console.warn(
        `Warning: Invalid typography "${typographyName}" provided to applyStyles.`,
      );
    }
  }

  if (variantName && variantMap[variantName]) {
    styledText = variantMap[variantName](styledText, borderColor);
  } else if (variantName) {
    console.warn(
      `Warning: Invalid variant "${variantName}" provided to applyStyles.`,
    );
  }

  return styledText;
}

export const bar = ({
  borderColor = "viceGradient",
}: { borderColor?: ColorName }): string =>
  colorMap[borderColor](symbols.middle);

export function fmt(opts: FmtMsgOptions): string {
  if (opts.title?.includes("│  ") && !opts.dontRemoveBar) {
    opts.title = opts.title.replace("│  ", "");
  }

  if (!opts.borderColor) {
    opts.borderColor = "viceGradient";
  }

  const formattedBar = bar({ borderColor: opts.borderColor });

  const prefixStartLine = opts.borderColor
    ? colorMap[opts.borderColor](symbols.start + symbols.line)
    : symbols.start + symbols.line;

  const prefixEndLine = opts.borderColor
    ? colorMap[opts.borderColor](symbols.end + symbols.line)
    : symbols.end + symbols.line;

  const suffixStartLine = opts.borderColor
    ? colorMap[opts.borderColor](`${symbols.line.repeat(28)}⊱`)
    : `${symbols.line.repeat(28)}⊱`;

  const suffixEndLine = opts.borderColor
    ? colorMap[opts.borderColor](`${symbols.line.repeat(58)}⊱`)
    : `${symbols.line.repeat(58)}⊱`;

  const MSG_CONFIGS: Record<MsgType, MsgConfig> = {
    M_NULL: {
      symbol: "",
      prefix: "",
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_INFO_NULL: {
      symbol: "",
      prefix: formattedBar,
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_START: {
      symbol: "",
      prefix: prefixStartLine,
      suffix: ` ${suffixStartLine}\n${formattedBar}`,
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_MIDDLE: {
      symbol: formattedBar,
      prefix: "",
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_GENERAL: {
      symbol: "",
      prefix: greenBright(symbols.step_active),
      suffix: opts.placeholder
        ? dim(opts.placeholder) + "\n" + formattedBar + "  "
        : "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? true,
    },
    M_GENERAL_NULL: {
      symbol: "",
      prefix: "",
      suffix: opts.placeholder
        ? dim(opts.placeholder) + "\n" + formattedBar + "  "
        : "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? true,
    },
    M_INFO: {
      symbol: "",
      prefix: greenBright(symbols.info),
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? true,
    },
    M_ERROR: {
      symbol: "",
      prefix: redBright(symbols.step_error),
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? true,
    },
    M_ERROR_NULL: {
      symbol: "",
      prefix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? true,
    },
    M_END: {
      symbol: "",
      prefix: greenBright(symbols.info),
      suffix: opts.border
        ? `\n${formattedBar}\n${prefixEndLine}${suffixEndLine}\n`
        : "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_NEWLINE: {
      symbol: "",
      prefix: formattedBar,
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
  };

  const config = MSG_CONFIGS[opts.type];
  if (!config) {
    throw new Error(`Invalid message type: ${opts.type}`);
  }

  const {
    symbol = "",
    prefix = "",
    suffix = "",
    newLineBefore = false,
    newLineAfter = false,
  } = config;
  const formattedPrefix = prefix
    ? `${prefix}${opts.type === "M_START" ? " " : "  "}`
    : "";

  const border = applyStyles(symbols.middle, opts.borderColor);
  const borderError = applyStyles(symbols.middle, "red");
  const borderWithSpace = `${border}  `;

  let formattedTitle = "";
  if (opts.title) {
    formattedTitle = applyStyles(
      opts.title,
      opts.titleColor,
      opts.titleTypography,
      opts.titleVariant,
      opts.borderColor,
    );
    if (opts.hint) {
      formattedTitle += `\n${borderWithSpace}${colorMap.blueBright(opts.hint)}`;
    }
    if (opts.errorMessage) {
      const formattedError = applyStyles(
        opts.errorMessage,
        "red",
        "bold",
        "",
        opts.borderColor,
      );
      formattedTitle += `\n${borderError}  ${formattedError}`;
    }
  }

  let formattedContent = "";
  if (opts.content) {
    const contentLines = opts.content.split("\n");
    formattedContent = contentLines
      .map((line) => {
        const styledLine = applyStyles(
          line,
          opts.contentColor,
          opts.contentTypography,
          opts.contentVariant,
          opts.borderColor,
        );
        if (opts.type !== "M_START") {
          return `${borderWithSpace}${styledLine}`;
        } else {
          return styledLine;
        }
      })
      .join("\n");
  }

  const text = [formattedTitle, formattedContent].filter(Boolean).join(`\n`);

  return [
    symbol,
    newLineBefore ? `\n${formattedBar}  ` : "",
    formattedPrefix,
    text,
    newLineAfter ? `\n${formattedBar}  ` : "",
    suffix,
  ]
    .filter(Boolean)
    .join("");
}

export function msg(opts: FmtMsgOptions): void {
  console[opts.type === "M_ERROR" || opts.type === "M_ERROR_NULL" ? "error" : "log"](fmt(opts));
}
