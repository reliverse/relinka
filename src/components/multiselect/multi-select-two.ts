import type { Static, TSchema } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { PromptOptions } from "~/types/general.js";

import { colorize } from "~/utils/colorize.js";
import { bar, fmt, msg } from "~/utils/messages.js";
import {
  countLines,
  deleteLastLine,
  deleteLastLines,
} from "~/utils/terminal.js";

export async function multiselectPrompt<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Static<T>> {
  const {
    title,
    choices,
    schema,
    defaultValue,
    titleColor = "cyanBright",
    
    titleTypography = "bold",
    titleVariant,
    hint,
    content,
    contentColor = "dim",
    contentTypography,
    contentVariant,
    borderColor = "viceGradient",
    variantOptions,
  } = options;

  if (!choices || choices.length === 0) {
    throw new Error("Choices are required for multiselect prompt.");
  }

  const rl = readline.createInterface({ input, output });

  const formattedBar = bar({ borderColor });

  let linesToDelete = 0;
  let errorMessage = "";

  try {
    while (true) {
      if (linesToDelete > 0) {
        deleteLastLines(linesToDelete);
      }

      const question = fmt({
        type: errorMessage !== "" ? "M_ERROR" : "M_GENERAL",
        title: `${title}${defaultValue ? ` [Default: ${Array.isArray(defaultValue) ? defaultValue.join(", ") : defaultValue}]` : ""}`,
        titleColor,
        titleTypography,
        titleVariant,
        content,
        contentColor,
        contentTypography,
        contentVariant,
        borderColor,
        hint,
        variantOptions,
        errorMessage,
        addNewLineBefore: false,
        addNewLineAfter: false,
      });

      // Generate choices text with formatted bar
      const choicesText = choices
        .map(
          (choice, index) =>
            `${formattedBar}  ${index + 1}) ${choice.title}${
              choice.description ? ` - ${choice.description}` : ""
            }`,
        )
        .join("\n");

      const fullPrompt = `${question}\n${choicesText}\n${formattedBar}  ${colorize(`Enter your choices (comma-separated numbers between 1-${choices.length})`, contentColor)}:\n${formattedBar}  `;

      const formattedPrompt = fmt({
        type: "M_NULL",
        title: fullPrompt,
      });

      const questionLines = countLines(formattedPrompt);
      linesToDelete = questionLines + 1; // +1 for the user's input line

      const answer = (await rl.question(formattedPrompt)).trim();

      // Use defaultValue if no input is provided
      if (!answer && defaultValue !== undefined) {
        deleteLastLine();
        msg({
          type: "M_MIDDLE",
          title: `  ${Array.isArray(defaultValue) ? defaultValue.join(", ") : defaultValue}`,
          titleColor: "none",
        });
        msg({ type: "M_NEWLINE" });
        return defaultValue as Static<T>;
      }

      // Parse and validate selections
      const selections = answer.split(",").map((s) => s.trim());
      const invalidSelections = selections.filter((s) => {
        const num = Number(s);
        return isNaN(num) || num < 1 || num > choices.length;
      });

      if (invalidSelections.length > 0) {
        errorMessage = `Invalid selections: ${invalidSelections.join(
          ", ",
        )}. Please enter numbers between 1 and ${choices.length}.`;
        continue;
      }

      const selectedValues = selections.map((s) => choices[Number(s) - 1]?.id);

      // Schema validation if provided
      let isValid = true;
      errorMessage = ""; // Reset errorMessage

      if (schema) {
        isValid = Value.Check(schema, selectedValues);
        if (!isValid) {
          const errors = [...Value.Errors(schema, selectedValues)];
          errorMessage =
            errors.length > 0
              ? (errors[0]?.message ?? "Invalid input.")
              : "Invalid input.";
        }
      }

      if (isValid) {
        msg({ type: "M_NEWLINE" });
        rl.close();
        return selectedValues as Static<T>;
      }
    }
  } finally {
    rl.close();
  }
}
