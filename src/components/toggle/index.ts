import { cyanBright, dim, greenBright, redBright, reset } from "picocolors";
import { stdin as input, stdout as output } from "process";
import readline from "readline";

import type { ColorName, Variant, TypographyName } from "~/types/general.js";

import { bar, fmt, msg, symbols } from "~/utils/messages.js";
import { deleteLastLine } from "~/utils/terminal.js";

export async function togglePrompt<T extends string>(params: {
  title: string;
  options: [T, T];
  initial?: T;
  borderColor?: ColorName;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: Variant;
  border?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
}): Promise<T> {
  const {
    title,
    options,
    initial,
    borderColor = "viceGradient",
    titleColor = "cyanBright",
    titleTypography = "bold",
    titleVariant,
    border = true,
    endTitle = "👋",
    endTitleColor = "passionGradient",
  } = params;

  let selectedIndex = initial
    ? options.findIndex((option) => option === initial)
    : 0;
  if (selectedIndex === -1) {
    selectedIndex = 0;
  }

  const rl = readline.createInterface({ input, output });
  readline.emitKeypressEvents(input, rl);
  if (typeof input.setRawMode === "function") {
    input.setRawMode(true);
  }

  const formattedBar = bar({ borderColor });

  let linesRendered = 0;
  const instructions = `Use <←/→> or <h/l> to navigate, <Enter> to select, <Ctrl+C> to exit`;
  let errorMessage = ""; // Initialize error message

  function renderOption() {
    // Move cursor up to the start of the options if not the first render
    if (linesRendered > 0) {
      process.stdout.write(`\x1B[${linesRendered}A`);
    }

    let outputStr = `${greenBright(symbols.step_active)}  ${fmt({
      type: "M_NULL",
      title: title,
      titleColor,
      titleTypography,
      titleVariant,
    })}\n`;

    // Display error message if present; otherwise, show instructions
    if (errorMessage) {
      outputStr += `${redBright(symbols.step_error)}  ${errorMessage}\n`;
    } else {
      outputStr += `${formattedBar}  ${dim(instructions)}\n`;
    }

    const [leftOption, rightOption] = options;
    const displayOptions = options.map((option, index) => {
      if (index === selectedIndex) {
        return cyanBright(option);
      }
      return option;
    });

    const displayString = displayOptions.join(" / ");

    outputStr += `${formattedBar}  ${displayString}\n`;

    process.stdout.write(outputStr);

    // Calculate lines rendered:
    linesRendered = 1 + 1 + 1; // Symbol + Title + (Error Message or Instructions) + Option Display
  }

  renderOption();

  return new Promise<T>((resolve) => {
    function onKeyPress(str: string, key: readline.Key) {
      if (key.name === "left" || key.name === "h") {
        // Move left
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        errorMessage = ""; // Clear error message on navigation
        renderOption();
      } else if (key.name === "right" || key.name === "l") {
        // Move right
        selectedIndex = (selectedIndex + 1) % options.length;
        errorMessage = ""; // Clear error message on navigation
        renderOption();
      } else if (key.name === "return") {
        // Confirm selection
        if (!options[selectedIndex]) {
          deleteLastLine();
          errorMessage = "You must select an option.";
          renderOption();
        } else {
          cleanup();
          resolve(options[selectedIndex]);
          deleteLastLine();
          deleteLastLine();
          msg({
            type: "M_MIDDLE",
          });
        }
      } else if (key.name === "c" && key.ctrl) {
        // Handle Ctrl+C: Show endTitle message and exit gracefully
        msg({
          type: "M_NEWLINE",
        });
        msg({
          type: "M_END",
          title: endTitle,
          titleColor: endTitleColor,
          titleTypography,
          titleVariant,
          border,
          borderColor,
          addNewLineBefore: true,
        });
        cleanup(true); // Passing a flag to indicate a graceful exit
      }
    }

    function cleanup(isCtrlC = false) {
      if (typeof input.setRawMode === "function") {
        input.setRawMode(false);
      }
      rl.close();
      input.removeListener("keypress", onKeyPress);
      // Move cursor down to the end of options
      process.stdout.write(`\x1B[${linesRendered}B`);
      if (isCtrlC) {
        process.exit(); // Exit the process without throwing an error
      } else {
        console.log(); // Move to a new line
      }
    }

    input.on("keypress", onKeyPress);
  });
}
