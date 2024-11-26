import chalk from "chalk";
import gradient, { cristal, mind, passion, retro, vice } from "gradient-string";
import { rainbow } from "gradient-string";
import colors from "picocolors";

import type { TypographyName } from "~/types/general.js";
import type { ColorName } from "~/types/general.js";

export const colorMap: Record<ColorName, (text: string) => string> = {
  none: colors.reset,
  inverse: colors.inverse,
  black: colors.black,
  blue: colors.blue,
  blueBright: colors.blueBright,
  cyan: colors.cyan,
  cyanBright: colors.cyanBright,
  bgCyan: colors.bgCyan,
  bgCyanBright: colors.bgCyanBright,
  dim: colors.dim,
  gray: colors.gray,
  green: colors.green,
  greenBright: colors.greenBright,
  bgGreen: colors.bgGreen,
  bgGreenBright: colors.bgGreenBright,
  magenta: colors.magenta,
  red: colors.red,
  redBright: colors.redBright,
  bgRed: colors.bgRed,
  bgRedBright: colors.bgRedBright,
  white: colors.white,
  yellow: colors.yellow,
  yellowBright: colors.yellowBright,
  cristalGradient: cristal,
  mindGradient: mind,
  passionGradient: passion,
  rainbowGradient: rainbow,
  retroGradient: retro,
  viceGradient: vice,
  gradientGradient: gradient([
    "red",
    "yellow",
    "green",
    "cyan",
    "blue",
    "magenta",
  ]),
};

export const typographyMap: Record<TypographyName, (text: string) => string> = {
  bold: chalk.bold,
  italic: chalk.italic,
  underline: chalk.underline,
  strikethrough: chalk.strikethrough,
};
