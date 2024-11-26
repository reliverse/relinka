import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import { cyanBright, dim, greenBright, redBright } from "picocolors";

import type { ColorName, Variant, TypographyName } from "~/types/general.js";

import { deleteLastLine } from "~/main.js";
import { bar, fmt, msg, symbols } from "~/utils/messages.js";

export async function selectPrompt<T extends string>(params: {
  title: string;
  options: { label: string; value: T; hint?: string }[];
  initial?: T;
  required?: boolean;
  borderColor?: ColorName;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: Variant;
  border?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
  maxItems?: number;
}): Promise<T> {
  const {
    title,
    options,
    initial,
    required = false,
    borderColor = "viceGradient",
    titleColor = "cyanBright",
    titleTypography = "bold",
    titleVariant,
    border = true,
    endTitle = "👋",
    endTitleColor = "passionGradient",
    maxItems,
  } = params;

  let selectedIndex = initial
    ? options.findIndex((option) => option.value === initial)
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
  const instructions = `Use <↑/↓> or <k/j> to navigate, <Enter> to select, <Ctrl+C> to exit`;
  let errorMessage = ""; // Initialize error message

  function renderOptions() {
    // Move cursor up to the start of the options if not the first render
    if (linesRendered > 0) {
      process.stdout.write(`\x1B[${linesRendered}A`);
    }

    let outputStr = `${greenBright(symbols.step_active)}  ${fmt({
      type: "M_NULL",
      title,
      titleColor,
    })}\n`;

    // Display error message if present; otherwise, show instructions
    if (errorMessage) {
      outputStr += `${redBright(symbols.step_error)}  ${errorMessage}\n`;
    } else {
      outputStr += `${formattedBar}  ${dim(instructions)}\n`;
    }

    // Determine max items based on terminal size and provided maxItems
    const terminalHeight = process.stdout.rows || 24; // Default to 24 if undefined
    const availableHeight = terminalHeight - 4; // Header and footer adjustment
    const computedMaxItems = Math.min(
      maxItems ?? Infinity,
      availableHeight > 0 ? availableHeight : Infinity,
      options.length
    );
    const minItems = 3; // Minimum number of items to display for better UX
    const displayItems = Math.max(computedMaxItems, minItems);

    let startIdx = 0;
    let endIdx = options.length - 1;

    if (options.length > displayItems) {
      const half = Math.floor(displayItems / 2);

      // We're adjusting startIdx and endIdx here to center the selected item
      startIdx = selectedIndex - half;
      endIdx = selectedIndex + (displayItems - half - 1);

      if (startIdx < 0) {
        startIdx = 0;
        endIdx = displayItems - 1;
      } else if (endIdx >= options.length) {
        endIdx = options.length - 1;
        startIdx = options.length - displayItems;
      }
    }

    // Determine if ellipses should be displayed
    const shouldRenderTopEllipsis = startIdx > 0;
    const shouldRenderBottomEllipsis = endIdx < options.length - 1;

    if (shouldRenderTopEllipsis) {
      outputStr += `${formattedBar}  ${dim("...")}\n`;
    }

    for (let index = startIdx; index <= endIdx; index++) {
      const option = options[index];
      const isSelected = index === selectedIndex;
      const prefix = isSelected ? "> " : "  ";
      const optionLabel = isSelected ? cyanBright(option.label) : option.label;
      const hint = option.hint ? ` (${option.hint})` : "";
      outputStr += `${formattedBar} ${prefix}${optionLabel}${dim(hint)}\n`;
    }

    if (shouldRenderBottomEllipsis) {
      outputStr += `${formattedBar}  ${dim("...")}\n`;
    }

    // Calculate lines rendered
    linesRendered =
      1 + // Title
      1 + // Instructions or error message
      (shouldRenderTopEllipsis ? 1 : 0) + // Top ellipsis
      (endIdx - startIdx + 1) + // Displayed options
      (shouldRenderBottomEllipsis ? 1 : 0); // Bottom ellipsis

    process.stdout.write(outputStr);
  }

  renderOptions();

  return new Promise<T>((resolve) => {
    function onKeyPress(str: string, key: readline.Key) {
      if (key.name === "up" || key.name === "k") {
        // Move up
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        errorMessage = "";// Clear error message on navigation
        renderOptions();
      } else if (key.name === "down" || key.name === "j") {
        // Move down
        selectedIndex = (selectedIndex + 1) % options.length;
        errorMessage = "";// Clear error message on navigation
        renderOptions();
      } else if (key.name === "return") {
        // Confirm selection
        if (required && !options[selectedIndex].value) {
          deleteLastLine();
          errorMessage = "You must select an option.";
          renderOptions();
        } else {
          cleanup();
          resolve(options[selectedIndex].value);
          deleteLastLine();
          deleteLastLine();
        }
      } else if (key.name === "c" && key.ctrl) {
        // Show endTitle message and exit gracefully
        msg({ type: "M_NEWLINE" });
        msg({
          type: "M_END",
          title: endTitle,
          titleColor: endTitleColor,
          titleTypography,
          titleVariant,
          border,
          borderColor,
        });
        cleanup(true);
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
