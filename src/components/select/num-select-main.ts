import { stdin as input, stdout as output } from "process";
import readline from "readline/promises";

export async function selectPrompt<T extends string>(params: {
  message: string;
  options: { label: string; value: T }[];
  initial?: T;
}): Promise<T> {
  const { message, options, initial } = params;

  const selectedIndex = initial
    ? options.findIndex((option) => option.value === initial)
    : 0;

  const rl = readline.createInterface({ input, output });

  while (true) {
    console.log(`\n${message}`);
    options.forEach((option, index) => {
      const prefix = index === selectedIndex ? "->" : "  ";
      const isDefault = option.value === initial ? "(default)" : "";
      console.log(`${prefix} [${index + 1}] ${option.label} ${isDefault}`);
    });

    const promptMessage =
      initial !== undefined
        ? `Please select an option by number (default ${selectedIndex + 1}): `
        : "Please select an option by number: ";

    const response = await rl.question(promptMessage);

    let index: number;

    if (response.trim() === "" && initial !== undefined) {
      index = selectedIndex;
    } else {
      index = parseInt(response.trim(), 10) - 1;
    }

    if (index >= 0 && index < options.length) {
      rl.close();
      return options[index].value;
    } else {
      console.log("Invalid selection. Please try again.");
    }
  }
}
