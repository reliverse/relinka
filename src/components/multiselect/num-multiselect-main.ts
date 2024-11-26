import { stdin as input, stdout as output } from "process";
import readline from "readline/promises";

export async function multiselectPrompt<T extends string>(params: {
  message: string;
  options: T[];
  required?: boolean;
  initial?: T[];
}): Promise<T[]> {
  const { message, options, required = false, initial = [] } = params;

  const rl = readline.createInterface({ input, output });

  while (true) {
    console.log(`\n${message}`);
    options.forEach((option, index) => {
      const isSelected = initial.includes(option) ? "[x]" : "[ ]";
      console.log(`${index + 1}. ${isSelected} ${option}`);
    });

    const promptMessage =
      initial.length > 0
        ? `Please select options by number (separated by commas, default ${initial
            .map((opt) => options.indexOf(opt) + 1)
            .join(", ")}): `
        : "Please select options by number (separated by commas): ";

    const response = await rl.question(promptMessage);

    let indices: number[];

    if (response.trim() === "" && initial.length > 0) {
      indices = initial.map((opt) => options.indexOf(opt));
    } else {
      indices = response
        .split(",")
        .map((num) => parseInt(num.trim(), 10) - 1)
        .filter((index) => index >= 0 && index < options.length);
    }

    if (indices.length > 0 || (!required && indices.length === 0)) {
      rl.close();
      return indices.map((index) => options[index]);
    } else {
      console.log("Invalid selection. Please try again.");
    }
  }
}
