import { emojify } from "node-emoji";

import type { OptionalPromptOptions } from "~/main.js";

export const basicConfig = {
  titleColor: "cyanBright",
  titleTypography: "bold",
  borderColor: "viceGradient",
} satisfies OptionalPromptOptions;

export const extendedConfig = {
  ...basicConfig,
  contentTypography: "italic",
  contentColor: "dim",
} satisfies OptionalPromptOptions;

export const experimentalConfig = {
  titleColor: "cyanBright",
  titleTypography: "bold",
  endTitle: emojify(
    ":books: Learn the docs here: https://docs.reliverse.org/relinka",
  ),
  endTitleColor: "retroGradient",
} satisfies OptionalPromptOptions;
