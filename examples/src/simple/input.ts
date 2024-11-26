import * as url from "node:url";
import colors from "picocolors";

import { input } from "~/components/prompts/index.js";

const hexRegEx = /(\d|[a-f])/gim;
const isHex = (value: string) =>
  (value.match(hexRegEx) || []).length === value.length &&
  (value.length === 3 || value.length === 6);

const demo = async () => {
  let answer;

  answer = await input({
    message: "What's your favorite food?",
    default: "Croissant",
  });
  console.log("Answer:", answer);

  answer = await input({
    message: "Enter an hex color?",
    // biome-ignore lint/style/useDefaultParameterLast: <explanation>
    transformer(value = "", { isFinal }) {
      return isFinal ? colors.underline(value) : value;
    },
    validate: (value = "") => isHex(value) || "Pass a valid hex value",
  });
  console.log("Answer:", answer);

  answer = await input({
    message: "(Slow validation) provide a number:",
    validate: (value) =>
      new Promise((resolve) => {
        setTimeout(
          () =>
            resolve(
              !Number.isNaN(Number(value)) || "You must provide a number",
            ),
          3000,
        );
      }),
  });
  console.log("Answer:", answer);
};

if (import.meta.url.startsWith("file:")) {
  const modulePath = url.fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    await demo();
  }
}

export default demo;
