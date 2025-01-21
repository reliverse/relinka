import { re } from "@reliverse/relico";
import gradient, { cristal, mind, passion, retro, vice } from "gradient-string";
import { rainbow } from "gradient-string";

import type { ColorName, TypographyName } from "./types.js";

export const colorMap: Record<ColorName, (text: string) => string> = {
  // @reliverse/relico
  none: (text: string) => text,
  reset: re.reset,
  bgCyan: re.bgCyan,
  bgCyanBright: re.bgCyanBright,
  black: re.black,
  blue: re.blue,
  blueBright: re.blueBright,
  cyan: re.cyan,
  cyanBright: re.cyanBright,
  dim: re.dim,
  gray: re.gray,
  green: re.green,
  greenBright: re.greenBright,
  inverse: (text: string) => re.bold(re.inverse(text)),
  magenta: re.magenta,
  magentaBright: re.magentaBright,
  red: re.red,
  redBright: re.redBright,
  white: re.white,
  yellow: re.yellow,
  yellowBright: re.yellowBright,

  // gradient-string
  cristalGradient: cristal,
  gradientGradient: gradient([
    "red",
    "yellow",
    "green",
    "cyan",
    "blue",
    "magenta",
  ]),
  mindGradient: mind,
  passionGradient: passion,
  rainbowGradient: rainbow,
  retroGradient: retro,
  viceGradient: vice,
};

export const typographyMap: Record<TypographyName, (text: string) => string> = {
  none: (text: string) => text,
  bold: re.bold,
  italic: re.italic,
  strikethrough: re.strikethrough,
  underline: re.underline,
};
