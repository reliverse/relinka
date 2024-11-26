import type { Static, TSchema } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";

import type { ColorName, PromptOptions } from "~/types/general.js";

import { bar, fmt } from "~/utils/messages.js";
import {
  countLines,
  deleteLastLine,
  deleteLastLines,
} from "~/utils/terminal.js";

export async function passwordPrompt<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Static<T>> {
  const {
    title,
    hint,
    validate,
    schema,
    defaultValue,
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

  let linesToDelete = 0;
  let errorMessage = "";

  while (true) {
    const question = fmt({
      type: errorMessage !== "" ? "M_ERROR" : "M_GENERAL",
      title: `${title}${defaultValue ? ` [Default: ****]` : ""}`,
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

    // Display the prompt
    if (linesToDelete > 0) {
      deleteLastLines(linesToDelete); // Clear only on re-prompt
    }
    process.stdout.write(question);

    // Read password input
    const password = await readPassword(borderColor);

    linesToDelete = questionLines + 1; // +1 for the input line

    const formattedBar = bar({ borderColor });

    // Use defaultValue if no input is provided
    if (!password.trim() && defaultValue !== undefined) {
      deleteLastLines(2);
      process.stdout.write(`${formattedBar}  ****`);
      console.log(`\n${formattedBar}`);
      return defaultValue as Static<T>;
    }

    let isValid = true;
    errorMessage = ""; // Reset errorMessage
    if (schema) {
      isValid = Value.Check(schema, password);
      if (!isValid) {
        const errors = [...Value.Errors(schema, password)];
        if (errors.length > 0) {
          errorMessage = errors[0]?.message ?? "Invalid input.";
        } else {
          errorMessage = "Invalid input.";
        }
      }
    }
    if (validate && isValid) {
      const validation = await validate(password);
      if (validation !== true) {
        isValid = false;
        errorMessage =
          typeof validation === "string" ? validation : "Invalid input.";
      }
    }

    if (isValid) {
      process.stdout.write("\n"); // Leave the input intact for valid entries
      return password as Static<T>;
    } else {
      // Lines will be cleared only during the next iteration
    }
  }
}

// Helper function to read password input without echoing
function readPassword(borderColor: ColorName): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    let password = "";

    const formattedBar = bar({ borderColor });

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const onData = function (char: string) {
      char = char.toString();

      if (char === "\n" || char === "\r" || char === "\u0004") {
        // Enter or Ctrl-D
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write(`\n${formattedBar}`);
        resolve(password.trim()); // Ensure trimming whitespace
      } else if (char === "\u0003") {
        // Ctrl-C
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        reject(new Error("User aborted."));
      } else if (
        char === "\u007F" || // Backspace
        char === "\b" ||
        char === "\x7f" ||
        char === "\x08"
      ) {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write("\b \b");
        }
      } else {
        password += char;
        process.stdout.write("*");
      }
    };

    stdin.on("data", onData);
  });
}
