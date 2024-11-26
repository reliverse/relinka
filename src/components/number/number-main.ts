import type { TSchema, Static } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { PromptOptions } from "~/types/general.js";

import { fmt, msg } from "~/utils/messages.js";
import {
  countLines,
  deleteLastLine,
  deleteLastLines,
} from "~/utils/terminal.js";

export async function numberPrompt<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Static<T>> {
  const {
    title,
    hint,
    validate,
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
    variantOptions,
  } = options;

  const rl = readline.createInterface({ input, output });

  let linesToDelete = 0;
  let errorMessage = "";

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
      hint,
      variantOptions,
      errorMessage,
    });

    const questionLines = countLines(question);
    const prompt = await rl.question(question);

    linesToDelete = questionLines + 1;

    const answer = prompt.trim() || defaultValue;

    if (prompt.trim() === "" && defaultValue !== undefined) {
      deleteLastLine();
      const defaultMsg = fmt({
        type: "M_MIDDLE",
        title: `  ${defaultValue}`,
        borderColor,
      });
      console.log(defaultMsg);
      linesToDelete += countLines(defaultMsg);
    }

    const num = Number(answer);
    if (isNaN(num)) {
      errorMessage = "Please enter a valid number.";
      continue;
    }

    let isValid = true;
    errorMessage = ""; // Reset errorMessage

    if (schema) {
      isValid = Value.Check(schema, num);
      if (!isValid) {
        const errors = [...Value.Errors(schema, num)];
        if (errors.length > 0) {
          errorMessage = errors[0]?.message ?? "Invalid input.";
        } else {
          errorMessage = "Invalid input.";
        }
      }
    }
    if (validate && isValid) {
      const validation = await validate(num);
      if (validation !== true) {
        isValid = false;
        errorMessage =
          typeof validation === "string" ? validation : "Invalid input.";
      }
    }

    if (isValid) {
      msg({ type: "M_NEWLINE" });
      rl.close();
      return num as Static<T>;
    } else {
      // Will re-prompt in the next iteration
    }
  }
}
