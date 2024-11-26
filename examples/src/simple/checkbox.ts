import * as url from "node:url";

import { checkbox, Separator } from "~/components/prompts/index.js";

const demo = async () => {
  let answer;

  answer = await checkbox({
    message: "Select a package manager",
    choices: [
      // @ts-expect-error TODO: fix ts
      { name: "npm", value: "npm" },
      // @ts-expect-error TODO: fix ts
      { name: "yarn", value: "yarn" },
      new Separator(),
      // @ts-expect-error TODO: fix ts
      { name: "jspm", value: "jspm", disabled: true },
      {
        // @ts-expect-error TODO: fix ts
        name: "pnpm",
        value: "pnpm",
        disabled: "(pnpm is not available)",
      },
    ],
  });
  console.log("Answer:", answer);

  answer = await checkbox({
    message: "Select your favorite letters",
    choices: [
      new Separator("== Alphabet (choices cycle as you scroll through) =="),
      // @ts-expect-error TODO: fix ts
      { value: "A", checked: true },
      // @ts-expect-error TODO: fix ts
      { value: "B" },
      // @ts-expect-error TODO: fix ts
      { value: "C", checked: true },
      // @ts-expect-error TODO: fix ts
      { value: "D" },
      // @ts-expect-error TODO: fix ts
      { value: "E" },
      // @ts-expect-error TODO: fix ts
      { value: "F" },
      // @ts-expect-error TODO: fix ts
      { value: "G" },
      // @ts-expect-error TODO: fix ts
      { value: "H" },
      // @ts-expect-error TODO: fix ts
      { value: "I" },
      // @ts-expect-error TODO: fix ts
      { value: "J" },
      // @ts-expect-error TODO: fix ts
      { value: "K" },
      // @ts-expect-error TODO: fix ts
      { value: "L" },
      // @ts-expect-error TODO: fix ts
      { value: "M" },
      // @ts-expect-error TODO: fix ts
      { value: "N" },
      // @ts-expect-error TODO: fix ts
      { value: "O" },
      // @ts-expect-error TODO: fix ts
      { value: "P" },
      // @ts-expect-error TODO: fix ts
      { value: "Q" },
      // @ts-expect-error TODO: fix ts
      { value: "R" },
      // @ts-expect-error TODO: fix ts
      { value: "S" },
      // @ts-expect-error TODO: fix ts
      { value: "T" },
      // @ts-expect-error TODO: fix ts
      { value: "U" },
      // @ts-expect-error TODO: fix ts
      { value: "V" },
      // @ts-expect-error TODO: fix ts
      { value: "W" },
      // @ts-expect-error TODO: fix ts
      { value: "X" },
      // @ts-expect-error TODO: fix ts
      { value: "Y" },
      // @ts-expect-error TODO: fix ts
      { value: "Z" },
    ],
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
