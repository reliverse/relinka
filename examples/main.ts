// 1-main-example.ts: An advanced example of a CLI application with a beautiful UI config. This example
// demonstrates all possible prompt components. Everything is divided into separate files for clarity.

import {
  askDir,
  doSomeFunStuff,
  showAnimatedText,
  showAnykeyPrompt,
  showConfirmPrompt,
  showDatePrompt,
  showEndPrompt,
  showNumMultiselectPrompt,
  showNextStepsPrompt,
  showNumberPrompt,
  showNumSelectPrompt,
  showPasswordPrompt,
  showResults,
  showStartPrompt,
  showTextPrompt,
  showSelectPrompt,
  showMultiselectPrompt,
  showProgressBar,
  showTogglePrompt,
} from "@/src/prompts.js";
import { type UserInput } from "@/src/schema.js";

import { errorHandler } from "~/utils/errors.js";

export async function detailedExample() {
  await showStartPrompt();
  await showAnykeyPrompt("privacy");
  const username = await showTextPrompt();
  const dir = await askDir(username);
  const age = await showNumberPrompt();
  const password = await showPasswordPrompt();
  const birthday = await showDatePrompt();
  const lang = await showSelectPrompt();
  const langs = await showMultiselectPrompt();
  const color = await showNumSelectPrompt();
  const features = await showNumMultiselectPrompt();
  const toggle = await showTogglePrompt();
  const spinner = await showConfirmPrompt(username);
  const userInput = {
    username,
    dir,
    age,
    lang,
    color,
    password,
    birthday,
    langs,
    features,
    spinner,
    toggle,
  } satisfies UserInput;
  await showProgressBar();
  await showResults(userInput);
  await doSomeFunStuff(userInput);
  await showNextStepsPrompt();
  await showAnimatedText();
  await showEndPrompt();
}

await detailedExample().catch((error) => errorHandler(error));
