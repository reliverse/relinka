import * as url from "node:url";

import { select, Separator } from "~/components/prompts/index.js";

const alphabet = [
  { value: "A" },
  { value: "B" },
  { value: "C" },
  { value: "D" },
  { value: "E" },
  { value: "F" },
  { value: "G" },
  { value: "H" },
  { value: "I" },
  { value: "J" },
  { value: "K" },
  { value: "L" },
  { value: "M" },
  { value: "N" },
  { value: "O", description: "Letter O, not number 0" },
  { value: "P" },
  { value: "Q" },
  { value: "R" },
  { value: "S" },
  { value: "T" },
  { value: "U" },
  { value: "V" },
  { value: "W" },
  { value: "X" },
  { value: "Y" },
  { value: "Z" },
];

const demo = async () => {
  let answer;

  answer = await select({
    message: "Select a package manager",
    choices: [
      {
        // @ts-expect-error TODO: fix ts
        name: "npm",
        value: "npm",
        description: "npm is the most popular package manager",
      },
      {
        // @ts-expect-error TODO: fix ts
        name: "bun",
        value: "bun",
        description: "bun is an awesome package manager",
      },
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

  answer = await select({
    message: "Select your favorite letter",
    choices: [
      new Separator("== Alphabet (choices cycle as you scroll through) =="),
      // @ts-expect-error - TODO: fix ts
      ...alphabet,
    ],
  });
  console.log("Answer:", answer);

  answer = await select({
    message: "Select your favorite letter (example without loop)",
    choices: [
      new Separator("== Alphabet (choices cycle as you scroll through) =="),
      // @ts-expect-error - TODO: fix ts
      ...alphabet,
    ],
    loop: false,
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
