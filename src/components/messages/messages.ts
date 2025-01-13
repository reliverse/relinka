import pc from "picocolors";
import wrapAnsi from "wrap-ansi";

import type { MsgConfig, TypographyName } from "./types.js";
import type { ColorName, MsgType } from "./types.js";

import { colorMap, typographyMap } from "./mapping.js";
import { isUnicodeSupported } from "./platforms.js";
import {
  deleteLastLines,
  getExactTerminalWidth,
  getTerminalWidth,
} from "./terminal.js";
import { isValidVariant, variantMap, type VariantName } from "./variants.js";

/**
 * Known symbol names that will have IntelliSense support
 */
export type SymbolName =
  | "pointer"
  | "start"
  | "middle"
  | "end"
  | "line"
  | "corner_top_right"
  | "step_active"
  | "step_error"
  | "info";

export type FmtMsgOptions = {
  type: MsgType;
  title?: string;
  titleAfterAnim?: string;
  content?: string | undefined;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: VariantName;
  hint?: string;
  hintPlaceholderColor?: ColorName;
  hintTypography?: TypographyName;
  border?: boolean;
  borderColor?: ColorName;
  dontRemoveBar?: boolean;
  variantOptions?: {
    box?: {
      limit?: number;
    };
  };
  errorMessage?: string;
  addNewLineBefore?: boolean;
  addNewLineAfter?: boolean;
  placeholder?: string;
  horizontalLine?: boolean;
  horizontalLineLength?: number;
  terminalWidth?: number;
  instructions?: string;
  wrapTitle?: boolean;
  wrapContent?: boolean;
  symbol?: SymbolName;
  customSymbol?: string;
  symbolColor?: ColorName;
};

const unicode = isUnicodeSupported();
const u = (c: string, fallback: string) => (unicode ? c : fallback);

export const symbols = {
  pointer: u("👉", ">"),
  start: u("╭", "*"),
  middle: u("│", "|"),
  end: u("╰", "*"),
  line: u("─", "—"),
  corner_top_right: u("╭", "*"),
  step_active: u("◆", "♦"),
  step_error: u("🗴", "x"),
  info: u("ℹ", "i"),
  success: u("✅", "✓"),
} as const;

/**
 * Wraps text first, then applies styling to each line to maintain consistent formatting
 */
function wrapAndStyleText(
  input: string,
  typographyName: TypographyName | undefined,
  colorName: ColorName | undefined,
  variantName: VariantName | undefined,
  borderColor: ColorName | undefined,
): string {
  // 1) Wrap first.
  const adjustedWidth = getTerminalWidth();
  const wrappedText = wrapAnsi(input, adjustedWidth, {
    hard: false,
    trim: true,
  });

  // 2) Then apply styles line by line.
  return wrappedText
    .split("\n")
    .map((line) => {
      const isOption =
        line.startsWith("  ") ||
        line.startsWith("[ ]") ||
        line.startsWith("[x]");

      return applyStyles(
        line,
        colorName && !isOption ? colorName : undefined,
        typographyName && !isOption ? typographyName : undefined,
        variantName && variantName !== "none"
          ? (variantName as keyof typeof variantMap)
          : undefined,
        borderColor,
      );
    })
    .join("\n");
}

/**
 * Applies color, typography, and variant styles to a given text.
 */
function applyStyles(
  text: string,
  colorName?: ColorName,
  typographyName?: TypographyName,
  variantName?: string,
  borderColor?: ColorName,
) {
  let styledText = text;

  if (!isValidVariant(variantName)) {
    if (colorName && colorMap[colorName]) {
      styledText = colorMap[colorName](styledText);
    }
    if (typographyName && typographyMap[typographyName]) {
      styledText = typographyMap[typographyName](styledText);
    }
  } else if (variantName) {
    styledText = variantMap[variantName](
      [styledText],
      undefined,
      borderColor,
    ).toString();
  }

  return styledText;
}

/**
 * Returns a colored vertical bar symbol.
 */
export const bar = ({
  borderColor = "dim",
}: { borderColor?: ColorName }): string => {
  // Prevent gradient colors for bars
  if (borderColor.endsWith("Gradient")) {
    console.error(
      "Gradient colors are not supported for bars. Please use a solid color instead.",
    );
    return colorMap.dim(symbols.middle);
  }
  return colorMap[borderColor](symbols.middle);
};

/**
 * Counts how many lines a string spans.
 */
function countLines(text: string): number {
  return text.split("\n").length;
}

/**
 * Formats a message line according to the given FmtMsgOptions.
 * Returns both the formatted text and the number of lines it would occupy.
 */
export function fmt(opts: FmtMsgOptions): { text: string; lineCount: number } {
  if (!opts.borderColor) {
    opts.borderColor = "dim";
  }

  const border = applyStyles(symbols.middle, opts.borderColor);
  const borderError = applyStyles(symbols.middle, "red");
  // Every line should start with bar and two spaces
  const borderWithSpace = `${border}  `;

  const prefixStartLine = opts.borderColor
    ? colorMap[opts.borderColor](symbols.start + symbols.line)
    : symbols.start + symbols.line;

  const prefixEndLine = opts.borderColor
    ? colorMap[opts.borderColor](symbols.end + symbols.line)
    : symbols.end + symbols.line;

  const lineLength =
    opts.horizontalLineLength === 0
      ? getExactTerminalWidth() - 3
      : (opts.horizontalLineLength ?? getExactTerminalWidth() - 3);

  const suffixStartLine = opts.borderColor
    ? colorMap[opts.borderColor](`${symbols.line.repeat(lineLength)}⊱`)
    : `${symbols.line.repeat(lineLength)}⊱`;

  const suffixEndLine = opts.borderColor
    ? colorMap[opts.borderColor](`${symbols.line.repeat(lineLength)}⊱`)
    : `${symbols.line.repeat(lineLength)}⊱`;

  const MSG_CONFIGS: Record<MsgType, MsgConfig> = {
    M_NULL: {
      symbol: "",
      prefix: borderWithSpace,
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_BAR: {
      symbol: "",
      prefix: "",
      suffix: "",
      newLineBefore: false,
      newLineAfter: false,
    },
    M_INFO_NULL: {
      symbol: "",
      prefix: borderWithSpace,
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_START: {
      symbol: "",
      prefix: "",
      suffix: `\n${borderWithSpace}`,
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_MIDDLE: {
      symbol: "",
      prefix: borderWithSpace,
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_GENERAL: {
      symbol: opts.customSymbol
        ? opts.symbolColor
          ? colorMap[opts.symbolColor](opts.customSymbol)
          : opts.customSymbol
        : opts.symbol
          ? opts.symbolColor
            ? colorMap[opts.symbolColor](symbols[opts.symbol])
            : symbols[opts.symbol]
          : pc.green(symbols.step_active),
      prefix: borderWithSpace,
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_GENERAL_NULL: {
      symbol: "",
      prefix: borderWithSpace,
      suffix: opts.placeholder
        ? colorMap[opts.hintPlaceholderColor ?? "blue"](opts.placeholder)
        : "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_INFO: {
      symbol: opts.customSymbol
        ? opts.symbolColor
          ? colorMap[opts.symbolColor](opts.customSymbol)
          : opts.customSymbol
        : opts.symbol
          ? opts.symbolColor
            ? colorMap[opts.symbolColor](symbols[opts.symbol])
            : symbols[opts.symbol]
          : pc.green(symbols.info),
      prefix: borderWithSpace,
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? true,
    },
    M_ERROR: {
      symbol: opts.customSymbol
        ? opts.symbolColor
          ? colorMap[opts.symbolColor](opts.customSymbol)
          : opts.customSymbol
        : opts.symbol
          ? opts.symbolColor
            ? colorMap[opts.symbolColor](symbols[opts.symbol])
            : symbols[opts.symbol]
          : pc.redBright(symbols.step_error),
      prefix: borderWithSpace,
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_ERROR_NULL: {
      symbol: "",
      prefix: borderWithSpace,
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_END: {
      symbol: "",
      prefix: "",
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_NEWLINE: {
      symbol: "",
      prefix: borderWithSpace,
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
    suffix = "",
    newLineBefore = false,
    newLineAfter = false,
  } = config;

  function validateColorName(
    colorName: string,
  ): asserts colorName is ColorName {
    if (!colorMap[colorName as ColorName]) {
      throw new Error(`Invalid color name: ${colorName}`);
    }
  }

  // Process title
  let formattedTitle = "";
  if (opts.title) {
    const rawTitle = opts.title;
    // If we want to wrap the title
    if (opts.wrapTitle ?? true) {
      formattedTitle = wrapAndStyleText(
        rawTitle,
        opts.titleTypography ?? "bold",
        opts.titleColor ?? "cyan",
        opts.titleVariant,
        opts.borderColor,
      );
    } else {
      // No wrap => just apply once to entire title
      formattedTitle = applyStyles(
        rawTitle,
        opts.titleColor ?? "cyan",
        opts.titleTypography ?? "bold",
        opts.titleVariant,
        opts.borderColor,
      );
    }

    if (opts.hint) {
      const hintPlaceholderColor = opts.hintPlaceholderColor ?? "blue";
      if (opts.hintPlaceholderColor) {
        validateColorName(opts.hintPlaceholderColor);
      }
      // Apply the same wrapping and styling logic to hints
      const formattedHint = wrapAndStyleText(
        opts.hint,
        opts.hintTypography ?? "italic",
        hintPlaceholderColor,
        undefined,
        opts.borderColor,
      );
      formattedTitle += `\n${borderWithSpace}${formattedHint}`;
    }

    // Add placeholder on a new line if it exists
    if (opts.placeholder && opts.type === "M_GENERAL") {
      formattedTitle += `\n${borderWithSpace}${colorMap[opts.hintPlaceholderColor ?? "mindGradient"](opts.placeholder)}`;
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

  // Process content
  let formattedContent = "";
  if (opts.content) {
    const rawContent = opts.content;
    if (opts.wrapContent ?? true) {
      formattedContent = wrapAndStyleText(
        rawContent,
        opts.contentTypography ?? "italic",
        opts.contentColor ?? "dim",
        opts.contentVariant,
        opts.borderColor,
      );
    } else {
      formattedContent = applyStyles(
        rawContent,
        opts.contentColor ?? "dim",
        opts.contentTypography ?? "italic",
        opts.contentVariant,
        opts.borderColor,
      );
    }
  }

  // Combine title and content
  let text = "";
  if (opts.type === "M_BAR") {
    text = bar({ borderColor: opts.borderColor });
  } else {
    text = [formattedTitle, formattedContent].filter(Boolean).join(`\n`);
  }

  const fullText = [
    newLineBefore ? `\n${borderWithSpace}` : "",
    text,
    newLineAfter ? `\n${borderWithSpace}` : "",
    suffix,
  ]
    .filter(Boolean)
    .join("");

  // Add bar to the start of each line except those that already have it
  const lines = fullText.split("\n").map((line, index) => {
    // For M_START, use the start line format and add bar on next line
    if (opts.type === "M_START") {
      if (index === 0) {
        return `${prefixStartLine} ${line} ${suffixStartLine}`;
      }
      if (index === 1) {
        return borderWithSpace;
      }
    }
    // For M_END with border, format the title line
    if (opts.type === "M_END" && opts.border && index === 0) {
      // Use middle bar if title is empty, otherwise use info icon
      return !opts.title ? line : `${pc.green(symbols.info)}  ${line}`;
    }
    // Skip if line already has a bar or is empty
    if (!line.trim() || line.includes(symbols.middle)) {
      return line;
    }
    // Add symbol to first line only
    if (index === 0 && symbol) {
      return `${symbol}  ${line}`;
    }
    return `${borderWithSpace}${line}`;
  });

  if (opts.type === "M_END" && opts.border) {
    lines.push(`${prefixEndLine}${suffixEndLine}\n`);
  }

  const finalText = lines.join("\n");
  const lineCount = countLines(finalText);
  return { text: finalText, lineCount };
}

// A stack to keep track of printed messages line counts
const printedLineStack: number[] = [];

/**
 * Logs a formatted message to the console and records how many lines it occupies.
 */
export function msg(opts: FmtMsgOptions): void {
  const { text, lineCount } = fmt(opts);
  process.stdout.write(text + `\n`);
  printedLineStack.push(lineCount + 1); // +1 for the extra newline at the end
}

/**
 * Undo the last printed message by deleting its lines from the terminal.
 * @param count How many messages to undo. Defaults to 1.
 */
export function msgUndo(count = 1): void {
  for (let i = 0; i < count; i++) {
    const linesToDelete = printedLineStack.pop();
    if (typeof linesToDelete === "number" && linesToDelete > 0) {
      deleteLastLines(linesToDelete);
    }
  }
}

/**
 * Undo all printed messages so far.
 */
export function msgUndoAll(): void {
  while (printedLineStack.length > 0) {
    const linesToDelete = printedLineStack.pop();
    if (typeof linesToDelete === "number" && linesToDelete > 0) {
      deleteLastLines(linesToDelete);
    }
  }
}

/**
 * Prints:  "│  <text>"  (two spaces after the bar).
 * If text is empty, it just prints "│".
 * If indent is 1, it prints "│ <text>" (one space).
 * If indent is 2, it prints "│  <text>" (two spaces), etc.
 */
export function printLineBar(text: string, indent = 2) {
  if (text === "") {
    // Just print a single bar
    console.log(pc.dim("│"));
  } else {
    console.log(`${pc.dim("│")}${" ".repeat(indent)}${text}`);
  }
}
