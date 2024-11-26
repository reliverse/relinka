import type { Key } from "node:readline";

import { Value } from "@sinclair/typebox/value";
import { stdout } from "node:process";
import color from "picocolors";

import type { PromptOptions } from "~/types/general.js";

import { useKeyPress } from "~/components/core/useKeyPress.js";
import { colorize } from "~/utils/colorize.js";
import { resetCursorAndClear, moveCursorAndClear } from "~/utils/readline.js";

export async function selectPrompt(options: PromptOptions): Promise<string> {
  const {
    title,
    choices,
    defaultValue,
    schema,
    titleColor = "cyanBright",
    
    titleTypography = "bold",
  } = options;

  if (schema) {
    throw new Error(
      "Schema providing is currently not supported for selectPrompt().\n│  But don't worry, we're already handling some validations for you.",
    );
  }

  if (!choices || choices.length === 0) {
    throw new Error("Choices are required for select prompt.");
  }

  const coloredTitle = colorize(title, titleColor, titleTypography);

  let selectedIndex =
    defaultValue !== undefined
      ? choices.findIndex(
          (choice, index) =>
            choice.id === defaultValue || index + 1 === Number(defaultValue),
        )
      : 0;
  if (selectedIndex === -1) {
    selectedIndex = 0;
  }

  function renderChoices() {
    if (!choices) {
      throw new Error("Choices are required for select prompt.");
    }
    resetCursorAndClear(stdout, 0, 0);
    console.log(color.cyanBright(color.bold(coloredTitle)));
    choices.forEach((choice, index) => {
      const isSelected = index === selectedIndex;
      const prefix = isSelected ? color.greenBright(">") : " ";
      const choiceText = isSelected
        ? color.bgGreen(color.black(choice.title))
        : choice.title;
      console.log(`${prefix} ${choiceText}`);
    });
  }

  renderChoices();

  return new Promise((resolve, reject) => {
    const finalizeSelection = () => {
      cleanupKeyPress();
      moveCursorAndClear(stdout, 0, choices.length + 2);

      const selectedChoice = choices[selectedIndex];
      const selectedValue = selectedChoice?.id;

      let isValid = true;
      let errorMessage = "Invalid input.";

      if (schema) {
        try {
          isValid = Value.Check(schema, selectedValue);
        } catch (error) {
          isValid = false;
          errorMessage = "Validation error.";
          console.error(error);
        }
        if (!isValid) {
          const errors = [...Value.Errors(schema, selectedValue)];
          if (errors.length > 0) {
            errorMessage = errors[0]?.message ?? "Invalid input.";
          }
        }
      }

      if (isValid) {
        if (selectedChoice?.action) {
          selectedChoice
            .action()
            .then(() => resolve(selectedValue ?? ""))
            .catch(reject);
        } else {
          resolve(selectedValue ?? "");
        }
      } else {
        console.log(errorMessage);
        renderChoices();
      }
    };

    const handleKeyPress = (str: string, key: Key) => {
      if (key.name === "up") {
        selectedIndex = (selectedIndex - 1 + choices.length) % choices.length;
        renderChoices();
      } else if (key.name === "down") {
        selectedIndex = (selectedIndex + 1) % choices.length;
        renderChoices();
      } else if (key.name === "return") {
        finalizeSelection();
      } else if (key.ctrl && key.name === "c") {
        cleanupKeyPress();
        process.exit();
      } else if (
        !isNaN(Number(str)) &&
        Number(str) >= 1 &&
        Number(str) <= choices.length
      ) {
        selectedIndex = Number(str) - 1;
        finalizeSelection();
      }
    };

    const cleanupKeyPress = useKeyPress(handleKeyPress);
  });
}
