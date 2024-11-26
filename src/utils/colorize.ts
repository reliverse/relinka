import gradient, {
  cristal,
  mind,
  passion,
  rainbow,
  vice,
} from "gradient-string";
import {
  red,
  inverse,
  dim,
  black,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  cyanBright,
  bgCyan,
  bgCyanBright,
  white,
  gray,
  underline,
  bold,
  strikethrough,
  italic,
} from "picocolors";

import type { ColorName, TypographyName } from "~/types/general.js";

export function colorize(
  text: string,
  colorName?: ColorName,
  typography?: TypographyName,
): string {
  let result = text;

  switch (colorName) {
    case "inverse":
      result = inverse(` ${result} `);
      break;
    case "dim":
      result = dim(result);
      break;
    case "black":
      result = black(result);
      break;
    case "red":
      result = red(result);
      break;
    case "green":
      result = green(result);
      break;
    case "yellow":
      result = yellow(result);
      break;
    case "blue":
      result = blue(result);
      break;
    case "magenta":
      result = magenta(result);
      break;
    case "cyan":
      result = cyan(result);
      break;
    case "cyanBright":
      result = cyanBright(result);
      break;
    case "bgCyan":
      result = bgCyan(` ${result} `);
      break;
    case "bgCyanBright":
      result = bgCyanBright(` ${result} `);
      break;
    case "white":
      result = white(result);
      break;
    case "gray":
      result = gray(result);
      break;
    case "gradientGradient":
      result = gradient(["red", "yellow", "green", "cyan", "blue", "magenta"])(
        result,
      );
      break;
    case "rainbowGradient":
      result = rainbow(result);
      break;
    case "cristalGradient":
      result = cristal(result);
      break;
    case "mindGradient":
      result = mind(result);
      break;
    case "passionGradient":
      result = passion(result);
      break;
    case "viceGradient":
      result = vice(result);
      break;
    case "none":
      break;
    default:
      break;
  }

  const gradientColors = [
    "gradientGradient",
    "cristalGradient",
    "mindGradient",
    "passionGradient",
    "rainbowGradient",
    "viceGradient",
  ];

  if (gradientColors.includes(colorName ?? "") && typography) {
    throw new Error(
      "[colorize] Cannot apply typography to gradient color.\n│  Use regular colorize()'s color or remove typography.",
    );
  }

  if (!gradientColors.includes(colorName ?? "") && typography) {
    switch (typography) {
      case "bold":
        result = bold(result);
        break;
      case "strikethrough":
        result = strikethrough(result);
        break;
      case "underline":
        result = underline(result);
        break;
      case "italic":
        result = italic(result);
        break;
      default:
        break;
    }
  }

  return result;
}
