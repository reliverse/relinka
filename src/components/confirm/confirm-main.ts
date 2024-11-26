import type { TSchema, Static } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { PromptOptions } from "~/types/general.js";

import { colorize } from "~/utils/colorize.js";
import { bar, fmt, msg } from "~/utils/messages.js";
import { countLines, deleteLastLines } from "~/utils/terminal.js";

export async function confirmPrompt<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Static<T>> {
  const {
    title,
    defaultValue,
    schema,
    titleColor = "cyanBright",
    
    titleTypography = "bold",
    titleVariant,
    content,
    contentColor,
    contentTypography,
    contentVariant,
    borderColor = "viceGradient",
    hintColor = "dim",
    variantOptions,
    action,
  } = options;

  const rl = readline.createInterface({ input, output });

  let linesToDelete = 0;
  let errorMessage = "";

  try {
    while (true) {
      if (linesToDelete > 0) {
        deleteLastLines(linesToDelete);
      }

      const question = fmt({
        type: errorMessage !== "" ? "M_ERROR" : "M_GENERAL",
        title,
        titleColor,
        titleTypography,
        titleVariant,
        content,
        contentColor,
        contentTypography,
        contentVariant,
        borderColor,
        variantOptions,
        errorMessage,
      });

      let defaultHint = "";
      if (defaultValue === true) {
        defaultHint = "[Y/n]";
      } else if (defaultValue === false) {
        defaultHint = "[y/N]";
      } else {
        defaultHint = "[y/n]";
      }

      const fullPrompt = `${question}${colorize(defaultHint, hintColor)}: `;

      const formattedPrompt = fmt({
        type: "M_NULL",
        title: fullPrompt,
      });

      const questionLines = countLines(formattedPrompt);
      linesToDelete = questionLines + 1; // +1 for the user's input line

      const answer = (await rl.question(formattedPrompt)).toLowerCase().trim();

      let value: boolean;

      const formattedBar = bar({ borderColor });

      if (!answer && defaultValue !== undefined) {
        // Inject the used answer into the console
        const injectedAnswer = defaultValue === true ? "y" : "n";
        process.stdout.write(`${formattedBar}  ${injectedAnswer}\n`);
        value = defaultValue as boolean;
      } else if (answer === "y" || answer === "yes") {
        value = true;
      } else if (answer === "n" || answer === "no") {
        value = false;
      } else {
        errorMessage = 'Please answer with "y" or "n".';
        continue;
      }

      // Schema validation if provided
      let isValid = true;
      errorMessage = ""; // Reset errorMessage

      if (schema) {
        isValid = Value.Check(schema, value);
        if (!isValid) {
          const errors = [...Value.Errors(schema, value)];
          errorMessage =
            errors.length > 0
              ? (errors[0]?.message ?? "Invalid input.")
              : "Invalid input.";
        }
      }

      if (isValid) {
        msg({ type: "M_NEWLINE" });
        rl.close();
        if (action && value) {
          await action();
        }
        return value as Static<T>;
      }
    }
  } finally {
    rl.close();
  }
}
