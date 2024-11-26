import { textSync, type Fonts } from "figlet";

export async function createAsciiArt({
  message,
  font = "Standard",
  clearConsole = false,
}: {
  message: string;
  font?: Fonts;
  clearConsole?: boolean;
}): Promise<void> {
  if (clearConsole) {
    console.clear();
  }

  const asciiArt = textSync(message, { font });
  console.log(asciiArt);
}
