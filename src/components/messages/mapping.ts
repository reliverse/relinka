import gradient, { cristal, mind, passion, retro, vice } from "gradient-string";
import { rainbow } from "gradient-string";
import pc from "picocolors";

import type { ColorName, TypographyName } from "./types.js";

export const colorMap: Record<ColorName, (text: string) => string> = {
  // picocolors
  none: (text: string) => text,
  reset: pc.reset,
  bgCyan: pc.bgCyan,
  bgCyanBright: pc.bgCyanBright,
  black: pc.black,
  blue: pc.blue,
  blueBright: pc.blueBright,
  cyan: pc.cyan,
  cyanBright: pc.cyanBright,
  dim: pc.dim,
  gray: pc.gray,
  green: pc.green,
  greenBright: pc.greenBright,
  inverse: (text: string) => pc.bold(pc.inverse(text)),
  magenta: pc.magenta,
  magentaBright: pc.magentaBright,
  red: pc.red,
  redBright: pc.redBright,
  white: pc.white,
  yellow: pc.yellow,
  yellowBright: pc.yellowBright,

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
  bold: pc.bold,
  italic: pc.italic,
  strikethrough: pc.strikethrough,
  underline: pc.underline,
};
