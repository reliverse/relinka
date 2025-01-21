import type { Static } from "@sinclair/typebox";

import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { env, isWindows } from "std-env";

import { getCurrentTerminalName } from "./platforms.js";

/* ------------------------------------------------------------------
 * 1) TypeBox schemas for user-configurable colors
 * ------------------------------------------------------------------ */

// Each color definition is [openCode, closeCode, optionalReplace].
const ColorDefinitionSchema = Type.Tuple([
  Type.String(),
  Type.String(),
  Type.Optional(Type.String()),
]);

// The user can define an object of "colorName -> color definition array".
const ColorMapSchema = Type.Record(Type.String(), ColorDefinitionSchema);

/** The entire relico config */
const RelicoConfigSchema = Type.Object(
  {
    // The level of color support (0=none, 1=basic, 2=256, 3=truecolor)
    colorLevel: Type.Optional(
      Type.Union([
        Type.Literal(0),
        Type.Literal(1),
        Type.Literal(2),
        Type.Literal(3),
      ]),
    ),

    // An optional set of overrides or new color definitions
    customColors: Type.Optional(ColorMapSchema),
  },
  { additionalProperties: false },
);

export type RelicoConfig = Static<typeof RelicoConfigSchema>;

const defaultConfig: RelicoConfig = {
  colorLevel: undefined,
  customColors: undefined,
};

/* ------------------------------------------------------------------
 * 2) Environment-based color detection
 * ------------------------------------------------------------------ */

const { argv = [] } = typeof process === "undefined" ? {} : process;
const isDisabled = "NO_COLOR" in env || argv.includes("--no-color");
const isForced = "FORCE_COLOR" in env || argv.includes("--color");
const isCI =
  "CI" in env &&
  ("GITHUB_ACTIONS" in env || "GITLAB_CI" in env || "CIRCLECI" in env);

const isCompatibleTerminal =
  typeof process !== "undefined" &&
  process.stdout &&
  process.stdout.isTTY &&
  env["TERM"] !== "dumb";

// Checking for "truecolor" support
const colorterm = (env["COLORTERM"] || "").toLowerCase();
const supportsTrueColor = colorterm === "truecolor" || colorterm === "24bit";

/** Detect the color level from environment */
function detectColorLevel(): 0 | 1 | 2 | 3 {
  if (isDisabled) return 0;
  if (isForced) return 3; // Force full color
  if (supportsTrueColor) return 3;
  if (isWindows) return 2; // Windows 10+ usually supports 256
  if (isCI) return 2;
  if (isCompatibleTerminal) {
    return 2;
  }
  return 0; // fallback
}

/* ------------------------------------------------------------------
 * 3) Base color definitions (and Windows Terminal overrides)
 * ------------------------------------------------------------------ */

type BaseColorMap = {
  reset: [string, string];
  bold: [string, string, string];
  dim: [string, string, string];
  italic: [string, string];
  underline: [string, string];
  inverse: [string, string];
  hidden: [string, string];
  strikethrough: [string, string];
  black: [string, string];
  red: [string, string];
  green: [string, string];
  yellow: [string, string];
  blue: [string, string];
  magenta: [string, string];
  cyan: [string, string];
  white: [string, string];
  gray: [string, string];

  // Background colors
  bgBlack: [string, string];
  bgRed: [string, string];
  bgGreen: [string, string];
  bgYellow: [string, string];
  bgBlue: [string, string];
  bgMagenta: [string, string];
  bgCyan: [string, string];
  bgWhite: [string, string];

  // Bright colors
  blackBright: [string, string];
  redBright: [string, string];
  greenBright: [string, string];
  yellowBright: [string, string];
  blueBright: [string, string];
  magentaBright: [string, string];
  cyanBright: [string, string];
  whiteBright: [string, string];

  // Bright background colors
  bgBlackBright: [string, string];
  bgRedBright: [string, string];
  bgGreenBright: [string, string];
  bgYellowBright: [string, string];
  bgBlueBright: [string, string];
  bgMagentaBright: [string, string];
  bgCyanBright: [string, string];
  bgWhiteBright: [string, string];
};

const baseColors: BaseColorMap = {
  // Reset
  reset: ["\x1b[0m", "\x1b[0m"],

  // Styles
  bold: ["\x1b[1m", "\x1b[22m", "\x1b[22m\x1b[1m"],
  dim: ["\x1b[2m", "\x1b[22m", "\x1b[22m\x1b[2m"],
  italic: ["\x1b[3m", "\x1b[23m"],
  underline: ["\x1b[4m", "\x1b[24m"],
  inverse: ["\x1b[7m", "\x1b[27m"],
  hidden: ["\x1b[8m", "\x1b[28m"],
  strikethrough: ["\x1b[9m", "\x1b[29m"],

  // Basic
  black: ["\x1b[30m", "\x1b[39m"],
  red: ["\x1b[31m", "\x1b[39m"],
  green: ["\x1b[32m", "\x1b[39m"],
  yellow: ["\x1b[33m", "\x1b[39m"],
  blue: ["\x1b[34m", "\x1b[39m"],
  magenta: ["\x1b[35m", "\x1b[39m"],
  cyan: ["\x1b[36m", "\x1b[39m"],
  white: ["\x1b[37m", "\x1b[39m"],
  gray: ["\x1b[90m", "\x1b[39m"],

  // Background
  bgBlack: ["\x1b[40m", "\x1b[49m"],
  bgRed: ["\x1b[41m", "\x1b[49m"],
  bgGreen: ["\x1b[42m", "\x1b[49m"],
  bgYellow: ["\x1b[43m", "\x1b[49m"],
  bgBlue: ["\x1b[44m", "\x1b[49m"],
  bgMagenta: ["\x1b[45m", "\x1b[49m"],
  bgCyan: ["\x1b[46m", "\x1b[49m"],
  bgWhite: ["\x1b[47m", "\x1b[49m"],

  // Bright
  blackBright: ["\x1b[90m", "\x1b[39m"],
  redBright: ["\x1b[91m", "\x1b[39m"],
  greenBright: ["\x1b[92m", "\x1b[39m"],
  yellowBright: ["\x1b[93m", "\x1b[39m"],
  blueBright: ["\x1b[94m", "\x1b[39m"],
  magentaBright: ["\x1b[95m", "\x1b[39m"],
  cyanBright: ["\x1b[96m", "\x1b[39m"],
  whiteBright: ["\x1b[97m", "\x1b[39m"],

  // Bright background
  bgBlackBright: ["\x1b[100m", "\x1b[49m"],
  bgRedBright: ["\x1b[101m", "\x1b[49m"],
  bgGreenBright: ["\x1b[102m", "\x1b[49m"],
  bgYellowBright: ["\x1b[103m", "\x1b[49m"],
  bgBlueBright: ["\x1b[104m", "\x1b[49m"],
  bgMagentaBright: ["\x1b[105m", "\x1b[49m"],
  bgCyanBright: ["\x1b[106m", "\x1b[49m"],
  bgWhiteBright: ["\x1b[107m", "\x1b[49m"],
};

const windowsTerminalColors: BaseColorMap = {
  ...baseColors,
  red: ["\x1b[38;2;255;85;85m", "\x1b[39m"],
  green: ["\x1b[38;2;80;250;123m", "\x1b[39m"],
  yellow: ["\x1b[38;2;241;250;140m", "\x1b[39m"],
  blue: ["\x1b[38;2;98;114;164m", "\x1b[39m"],
  magenta: ["\x1b[38;2;255;121;198m", "\x1b[39m"],
  cyan: ["\x1b[38;2;139;233;253m", "\x1b[39m"],
};

/* ------------------------------------------------------------------
 * 4) Creating color formatting functions
 * ------------------------------------------------------------------ */

function replaceClose(
  str: string,
  close: string,
  replace: string,
  index: number,
) {
  let result = "",
    cursor = 0;
  do {
    result += str.substring(cursor, index) + replace;
    cursor = index + close.length;
    index = str.indexOf(close, cursor);
  } while (~index);
  return result + str.substring(cursor);
}

/** Standard function to create a color formatter from open/close codes */
function createFormatter(open: string, close: string, replace = open) {
  return (input: string | number) => {
    const string = String(input);
    const idx = string.indexOf(close, open.length);
    return ~idx
      ? open + replaceClose(string, close, replace, idx) + close
      : open + string + close;
  };
}

/* ------------------------------------------------------------------
 * 5) Module-level state
 * ------------------------------------------------------------------ */

let _config: RelicoConfig = {
  ...defaultConfig,
  colorLevel: detectColorLevel(), // initial detect
};
let _colorMap: Record<string, [string, string, string?]> = {};
let _colorFunctions: Record<string, (text: string | number) => string> = {};

/* Build the internal color map based on _config */
function buildColorMap(cfg: RelicoConfig) {
  const terminalName = getCurrentTerminalName();
  const isWinTerm = terminalName === "Windows Terminal";

  // If colorLevel=0 => everything blank
  if (cfg.colorLevel === 0) {
    // produce an empty/identity color map
    const map: Record<string, [string, string, string?]> = {};
    Object.keys(baseColors).forEach((k) => {
      map[k] = ["", "", ""];
    });
    return map;
  }

  // If Windows Terminal + colorLevel=3 => use windows overrides
  const builtIn =
    isWinTerm && cfg.colorLevel === 3
      ? { ...windowsTerminalColors }
      : { ...baseColors };

  // Merge any user customColors
  if (cfg.customColors) {
    for (const [k, v] of Object.entries(cfg.customColors)) {
      builtIn[k] = v;
    }
  }
  return builtIn;
}

/* Initialize the _colorFunctions dictionary */
function initColorFunctions() {
  _colorFunctions = {};

  // If colorLevel=0 => each color is identity
  if (_config.colorLevel === 0) {
    for (const k of Object.keys(baseColors)) {
      _colorFunctions[k] = (text) => String(text);
    }
    return;
  }

  // Otherwise, create color formatters
  for (const [key, [open, close, replace]] of Object.entries(_colorMap)) {
    _colorFunctions[key] = createFormatter(open, close, replace);
  }
}

/* Rebuild everything based on _config */
function rebuild() {
  _colorMap = buildColorMap(_config);
  initColorFunctions();
}

// Initialize at startup
rebuild();

/* ------------------------------------------------------------------
 * 6) Public exported functions
 * ------------------------------------------------------------------ */

/**
 * Allows user to update the relico config at runtime.
 */
export function configure(userInput: unknown) {
  // Merge with the existing config
  const newObj =
    typeof userInput === "object" && userInput !== null
      ? { ..._config, ...userInput }
      : { ..._config };
  try {
    const parsed = Value.Cast(RelicoConfigSchema, newObj);
    _config = parsed;
  } catch (err) {
    console.warn("Invalid relico config:", err);
    return;
  }
  // Rebuild color map and functions
  rebuild();
}

/** Return a read-only copy of current config */
export function getConfig(): RelicoConfig {
  return { ..._config };
}

/** Non-color "function" if color is disabled or unknown */
function identityColor(text: string | number) {
  return String(text);
}

/** Retrieve a specific color function by name (or fallback to reset) */
export function getColor(name: string) {
  return _colorFunctions[name] || _colorFunctions["reset"] || identityColor;
}

/** Colorize text with a named color function */
export function colorize(name: string, text: string | number): string {
  const fn = getColor(name);
  return fn(text);
}

/** Force-set the color level (0=none,1=basic,2=256,3=truecolor) */
export function setColorLevel(level: 0 | 1 | 2 | 3) {
  configure({ colorLevel: level });
}

/**
 * If truecolor is available (and level=3),
 * return a custom rgb(...) color function. Otherwise identity.
 */
export function rgb(r: number, g: number, b: number) {
  if (_config.colorLevel === 3) {
    const open = `\x1b[38;2;${r};${g};${b}m`;
    const close = "\x1b[39m";
    return createFormatter(open, close);
  }
  return identityColor;
}

/* ------------------------------------------------------------------
 * 7) "re" object that enumerates all color name functions
 * ------------------------------------------------------------------ */

/** Type for the re object with explicit color properties */
type ReObject = {
  [K in keyof BaseColorMap]: (text: string | number) => string;
};

/** Just a small proxy object returning the dynamic color functions */
export const re = new Proxy(
  {},
  {
    get(_target, prop: string) {
      return getColor(prop);
    },
  },
) as ReObject;

/* ------------------------------------------------------------------
 * 8) Export color-support metadata
 * ------------------------------------------------------------------ */
export const colorSupport = {
  isColorSupported: getConfig().colorLevel !== 0,
  isForced,
  isDisabled,
  terminalName: getCurrentTerminalName(),
};
