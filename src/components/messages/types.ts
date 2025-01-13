export type MsgType =
  | "M_NULL"
  | "M_INFO_NULL"
  | "M_START"
  | "M_MIDDLE"
  | "M_GENERAL"
  | "M_GENERAL_NULL"
  | "M_INFO"
  | "M_ERROR"
  | "M_ERROR_NULL"
  | "M_END"
  | "M_NEWLINE"
  | "M_BAR";

export type TypographyName =
  | "bold"
  | "strikethrough"
  | "underline"
  | "italic"
  | "none";

export type BorderColorName =
  | "reset"
  | "inverse"
  | "dim"
  | "black"
  | "red"
  | "redBright"
  | "green"
  | "greenBright"
  | "yellow"
  | "yellowBright"
  | "blue"
  | "blueBright"
  | "magenta"
  | "magentaBright"
  | "cyan"
  | "cyanBright"
  | "bgCyan"
  | "bgCyanBright"
  | "white"
  | "gray";

export type ColorName =
  | BorderColorName
  | "gradientGradient"
  | "rainbowGradient"
  | "cristalGradient"
  | "mindGradient"
  | "passionGradient"
  | "viceGradient"
  | "retroGradient"
  | "none";

export type MsgConfig = {
  symbol: string;
  prefix?: string;
  color?: (text: string) => string;
  newLineBefore?: boolean;
  newLineAfter?: boolean;
  suffix?: string;
};
