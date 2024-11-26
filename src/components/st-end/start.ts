import type { PromptOptions } from "~/types/general.js";

import { msg } from "~/utils/messages.js";

export async function startPrompt({
  title,
  titleColor = "cyanBright",
  
  titleTypography = "bold",
  titleVariant,
  borderColor = "viceGradient",
  clearConsole = true,
}: PromptOptions): Promise<void> {
  if (clearConsole) {
    console.clear();
    console.log();
  } else {
    console.log();
  }

  msg({
    type: "M_START",
    title: ` ${title} `,
    titleColor,
    titleTypography,
    titleVariant,
    borderColor,
  });

  if (!process.stdout.isTTY) {
    console.error(
      "│  Your terminal does not support cursor manipulations.\n│  It's recommended to use a terminal which supports TTY.",
    );
    msg({
      type: "M_NEWLINE",
    });
  }
}
