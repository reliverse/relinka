import { re } from "@reliverse/relico";
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
  | "info"
  | "success";

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
 * Wraps the input text according to the terminal width and
 * then applies color, typography, and variant styles line by line.
 */
function wrapThenStyle(
  input: string,
  wrap: boolean,
  typographyName: TypographyName | undefined,
  colorName: ColorName | undefined,
  variantName: VariantName | undefined,
  borderColor: ColorName | undefined,
): string {
  if (!input) return "";

  // 1) Possibly wrap text
  const width = getTerminalWidth();
  const wrappedText = wrap
    ? wrapAnsi(input, width, { hard: false, trim: true })
    : input;

  // 2) Apply styling line by line
  return wrappedText
    .split("\n")
    .map((line) =>
      applyStyles(line, colorName, typographyName, variantName, borderColor),
    )
    .join("\n");
}

/**
 * Applies color, typography, and variant styles to a single line of text.
 */
function applyStyles(
  text: string,
  colorName?: ColorName,
  typographyName?: TypographyName,
  variantName?: VariantName,
  borderColor?: ColorName,
) {
  let styledText = text;

  // If variant is valid, that overrides color + typography
  if (variantName && isValidVariant(variantName)) {
    styledText = variantMap[variantName](
      [styledText],
      undefined,
      borderColor,
    ).toString();
    return styledText;
  }

  // Otherwise apply color & typography (if available)
  if (colorName && colorMap[colorName]) {
    styledText = colorMap[colorName](styledText);
  }
  if (typographyName && typographyMap[typographyName]) {
    styledText = typographyMap[typographyName](styledText);
  }
  return styledText;
}

/**
 * Returns a colored vertical bar symbol. Prevents gradient colors for bars.
 */
export const bar = ({
  borderColor = "dim",
}: { borderColor?: ColorName } = {}): string => {
  if (borderColor.endsWith("Gradient")) {
    console.error(
      "Gradient colors are not supported for bars. Please use a solid color instead.",
    );
    return colorMap.dim(symbols.middle);
  }
  return colorMap[borderColor](symbols.middle);
};

/** Counts how many lines a string spans. */
function countLines(text: string): number {
  return text.split("\n").length;
}

/**
 * Retrieves the symbol (custom or from the symbols set) and applies the appropriate color.
 */
function getColoredSymbol(
  customSymbol: string | undefined,
  symbolName: SymbolName | undefined,
  symbolColor: ColorName | undefined,
): string | undefined {
  if (customSymbol) {
    return symbolColor && colorMap[symbolColor]
      ? colorMap[symbolColor](customSymbol)
      : customSymbol;
  }
  if (symbolName && symbols[symbolName]) {
    return symbolColor && colorMap[symbolColor]
      ? colorMap[symbolColor](symbols[symbolName])
      : symbols[symbolName];
  }
  return undefined;
}

/**
 * Formats the title (with hints, placeholder, errorMessage).
 * Returns a combined string suitable for printing.
 */
function formatTitle(
  opts: FmtMsgOptions,
  borderTwoSpaces: string,
  borderError: string,
): string {
  let formattedTitle = "";

  if (!opts.title) return formattedTitle;

  const wrappedOrStyledTitle = wrapThenStyle(
    opts.title,
    opts.wrapTitle ?? true,
    opts.titleTypography ?? "bold",
    opts.titleColor ?? "cyan",
    opts.titleVariant,
    opts.borderColor,
  );
  formattedTitle += wrappedOrStyledTitle;

  // Optional hint
  if (opts.hint) {
    const hintColor = opts.hintPlaceholderColor ?? "blue";
    const wrappedHint = wrapThenStyle(
      opts.hint,
      opts.wrapTitle ?? true, // same wrap logic as title by default
      opts.hintTypography ?? "italic",
      hintColor,
      undefined,
      opts.borderColor,
    );
    formattedTitle += `\n${borderTwoSpaces}${wrappedHint}`;
  }

  // Optional placeholder
  if (opts.placeholder && opts.type === "M_GENERAL") {
    const placeHolderColor = opts.hintPlaceholderColor ?? "blue";
    formattedTitle += `\n${borderTwoSpaces}${colorMap[placeHolderColor](opts.placeholder)}`;
  }

  // Optional error message
  if (opts.errorMessage) {
    const formattedError = applyStyles(
      opts.errorMessage,
      "red",
      "bold",
      undefined,
      opts.borderColor,
    );
    formattedTitle += `\n${borderError}  ${formattedError}`;
  }

  return formattedTitle;
}

/**
 * Formats the content. Returns a string that can be printed.
 */
function formatContent(opts: FmtMsgOptions): string {
  if (!opts.content) return "";
  return wrapThenStyle(
    opts.content,
    opts.wrapContent ?? true,
    opts.contentTypography ?? "italic",
    opts.contentColor ?? "dim",
    opts.contentVariant,
    opts.borderColor,
  );
}

/**
 * Main formatter function: builds the final text output based on FmtMsgOptions.
 */
export function fmt(opts: FmtMsgOptions): { text: string; lineCount: number } {
  // Ensure a default border color
  if (!opts.borderColor) {
    opts.borderColor = "dim";
  }

  const borderColored = applyStyles(symbols.middle, opts.borderColor);
  const borderError = applyStyles(symbols.middle, "red");
  // Indent each line by a vertical bar plus two spaces
  const borderTwoSpaces = `${borderColored}  `;

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

  // Decide which symbol (if any) to render
  const computedSymbol =
    getColoredSymbol(opts.customSymbol, opts.symbol, opts.symbolColor) ??
    re.green(symbols.step_active);

  // Pre-define config for each MsgType
  const MESSAGE_CONFIG_MAP: Record<MsgType, MsgConfig> = {
    M_NULL: {
      symbol: "",
      prefix: borderTwoSpaces,
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
      prefix: borderTwoSpaces,
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_START: {
      symbol: "",
      prefix: "",
      suffix: `\n${borderTwoSpaces}`,
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_MIDDLE: {
      symbol: "",
      prefix: borderTwoSpaces,
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_GENERAL: {
      symbol: computedSymbol,
      prefix: borderTwoSpaces,
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_GENERAL_NULL: {
      symbol: "",
      prefix: borderTwoSpaces,
      suffix: opts.placeholder
        ? colorMap[opts.hintPlaceholderColor ?? "blue"](opts.placeholder)
        : "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_INFO: {
      symbol: computedSymbol || re.green(symbols.info),
      prefix: borderTwoSpaces,
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? true,
    },
    M_ERROR: {
      symbol: computedSymbol || re.redBright(symbols.step_error),
      prefix: borderTwoSpaces,
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
    M_ERROR_NULL: {
      symbol: "",
      prefix: borderTwoSpaces,
      suffix: "",
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
      prefix: borderTwoSpaces,
      suffix: "",
      newLineBefore: opts.addNewLineBefore ?? false,
      newLineAfter: opts.addNewLineAfter ?? false,
    },
  };

  const config = MESSAGE_CONFIG_MAP[opts.type];
  if (!config) {
    throw new Error(`Invalid message type: ${opts.type}`);
  }

  const { symbol, suffix, newLineBefore, newLineAfter } = config;

  // Format title & content using helper functions
  const finalTitle = formatTitle(opts, borderTwoSpaces, borderError);
  const finalContent = formatContent(opts);

  // Build combined text (title + content)
  let text = "";
  if (opts.type === "M_BAR") {
    text = bar({ borderColor: opts.borderColor });
  } else {
    // Only join with \n if both exist
    text = [finalTitle, finalContent].filter(Boolean).join("\n");
  }

  // Build up the final lines
  const fullText = [
    newLineBefore ? `\n${borderTwoSpaces}` : "",
    text,
    newLineAfter ? `\n${borderTwoSpaces}` : "",
    suffix,
  ]
    .filter(Boolean)
    .join("");

  const lines = fullText.split("\n").map((line, index) => {
    // For M_START, handle first line differently
    if (opts.type === "M_START") {
      if (index === 0) {
        return `${prefixStartLine} ${line} ${suffixStartLine}`;
      }
      if (index === 1) {
        return borderTwoSpaces;
      }
    }
    // For M_END with border
    if (opts.type === "M_END" && opts.border && index === 0) {
      // Use middle bar if no title
      if (!opts.title) return "";
      return `${bar({ borderColor: opts.borderColor })}  ${line}`;
    }
    // Skip if line already includes the bar symbol or is empty
    if (!line.trim() || line.includes(symbols.middle)) {
      return line;
    }
    // If this is the first line, prepend symbol if we have one
    if (index === 0 && symbol) {
      return `${symbol}  ${line}`;
    }
    return `${config.prefix}${line}`;
  });

  // If M_END + border => add bottom line
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
  process.stdout.write(text + "\n");
  // +1 for the extra newline we wrote out
  printedLineStack.push(lineCount + 1);
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
 * If indent is 1, it prints "│ <text>", etc.
 */
export function printLineBar(text: string, indent = 2): void {
  if (text === "") {
    console.log(re.dim("│"));
    return;
  }
  console.log(`${re.dim("│")}${" ".repeat(indent)}${text}`);
}
