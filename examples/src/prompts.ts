import { detect } from "detect-package-manager";
import { emojify } from "node-emoji";
import { bold } from "picocolors";

import pkg from "~/../package.json" assert { type: "json" };
import { anykeyPrompt } from "~/main.js";
import { multiselectPrompt } from "~/main.js";
import { progressbar } from "~/main.js";
import {
  animateText,
  confirmPrompt,
  datePrompt,
  endPrompt,
  msg,
  numMultiSelectPrompt,
  nextStepsPrompt,
  numberPrompt,
  passwordPrompt,
  startPrompt,
  textPrompt,
  togglePrompt,
} from "~/main.js";
import { promptsDisplayResults } from "~/main.js";
import { numSelectPrompt } from "~/main.js";
import { selectPrompt } from "~/main.js";
import { spinner } from "~/main.js";
import { deleteLastLine } from "~/utils/terminal.js";

import { basicConfig, experimentalConfig, extendedConfig } from "./configs.js";
import { schema, type UserInput } from "./schema.js";
import {
  calculateAge,
  createColorChoices,
  displayUserInputs,
  hashPassword,
  validateAge,
} from "./utils.js";

const IDs = {
  start: "start",
  username: "username",
  dir: "dir",
  spinner: "spinner",
  password: "password",
  age: "age",
  lang: "lang",
  color: "color",
  birthday: "birthday",
  features: "features",
};

export async function showStartPrompt() {
  await startPrompt({
    id: IDs.start,
    title: `@reliverse/relinka v${pkg.version}`,
    ...basicConfig,
    titleColor: "inverse",
    clearConsole: true,
  });
}

export async function showAnykeyPrompt(
  kind: "pm" | "privacy",
  username?: string,
) {
  const pm = await detect();
  let notification = bold("[anykeyPrompt] Press any key to continue...");
  if (kind === "privacy") {
    notification = `Before you continue, please note that you are only testing an example CLI app.\n│  None of your responses will be sent anywhere. No actions, such as installing dependencies, will actually take place;\n│  this is simply a simulation with a sleep timer and spinner. You can always review the source code to learn more.\n│  ============================\n│  ${notification}`;
  }
  if (kind === "pm" && pm === "bun" && username) {
    notification += `\n│  ============================\n│  ${username}, did you know? Bun currently may crash if you press Enter while setTimeout\n│  is running. So please avoid doing that in the prompts after this one! 😅`;
  }
  await anykeyPrompt(notification);
}

export async function showTextPrompt(): Promise<UserInput["username"]> {
  const username = await textPrompt({
    // 'id' is the key in the userInput result object.
    // Choose any name for it, but ensure it’s unique.
    // Intellisense will show you all available IDs.
    id: IDs.username,
    title: "We're glad you're testing our interactive prompts library!",
    content: "Let's get to know each other!\nWhat's your username?",
    hint: "Press <Enter> to use the default value.",
    placeholder: "[Default: johnny911]",
    defaultValue: "johnny911",
    schema: schema.properties.username,
    ...extendedConfig,
  });
  return username ?? "johnny911";
}

export async function askDir(username: string): Promise<UserInput["dir"]> {
  const dir = await textPrompt({
    id: IDs.dir,
    title: `[textPrompt] Great! Nice to meet you, ${username}!`,
    content: "Where should we create your project?",
    // Schema is required, because it provides a runtime typesafety validation.
    schema: schema.properties.dir,
    ...extendedConfig,
    titleVariant: "doubleBox",
    hint: "Default: ./prefilled-default-value",
    defaultValue: "./prefilled-default-value",
  });
  return dir ?? "./prefilled-default-value";
}

export async function showNumberPrompt(): Promise<UserInput["age"]> {
  const age = await numberPrompt({
    id: IDs.age,
    ...extendedConfig,
    title: "[numberPrompt] Enter your age",
    // Adding a hint helps users understand the expected input format.
    hint: "Try: 42 | Default: 36",
    defaultValue: "36",
    // Define a schema to validate the input.
    // Errors are automatically handled and displayed based on the type.
    schema: schema.properties.age,
    // Additional validation can be configured using the 'validate' option.
    validate: (value) => {
      const num = Number(value);
      if (num === 42) {
        return "42 is the answer to the ultimate question of life, the universe, and everything. Try a different number.";
      }
      return true;
    },
  });
  return age ?? 34;
}

export async function showPasswordPrompt(): Promise<UserInput["password"]> {
  // Initialize `passwordResult` to avoid uninitialized variable errors.
  let password = "silverHand2077";
  // Wrap password prompts with a try-catch block to handle cancellations,
  // which otherwise would terminate the process with an error.
  try {
    password = await passwordPrompt({
      id: IDs.password,
      title: "[passwordPrompt] Imagine a password",
      schema: schema.properties.password,
      defaultValue: "silverHand2077",
      hint: "Default: silverHand2077",
      validate: (input) => {
        if (!/[A-Z]/.test(input)) {
          return "Password must be latin letters and contain at least one uppercase letter.";
        }
        return true;
      },
    });
  } catch (error) {
    msg({
      type: "M_ERROR",
      title: "Password prompt was aborted or something went wrong.",
    });
  }
  // We can set default values for missing responses, especially
  // for the cases when we allow the user to cancel the prompt.
  return password ?? "silverHand2077";
}

export async function showDatePrompt(): Promise<UserInput["birthday"]> {
  const birthdayDate = await datePrompt({
    id: IDs.birthday,
    dateKind: "birthday",
    dateFormat: "DD.MM.YYYY",
    title: "[datePrompt] Enter your birthday",
    hint: "Default: 16.11.1988",
    // You can set a default value for the prompt if desired.
    defaultValue: "16.11.1988",
    schema: schema.properties.birthday,
  });
  return birthdayDate ?? "16.11.1988";
}

// Experimental alternative to showDatePrompt
export async function showDatePromptTwo() {
  const userDate = await datePrompt({
    id: IDs.birthday,
    title: "Enter your birthday",
    dateFormat: "DD.MM.YYYY | MM/DD/YYYY | YYYY.MM.DD",
    dateKind: "birthday",
    hint: "Please use one of the specified date formats.",
    validate: async (input: string) => {
      // Example custom validation: we ensure the year is not before 1900
      const parts = input.split(/[./-]/);
      let year: number;
      if (input.includes(".")) {
        if (input.split(".").length === 3 && input.includes("/")) {
          // Handle multiple separators if necessary
          year = Number(parts[2]);
        } else {
          year = Number(parts[2] || parts[3]);
        }
      } else if (input.includes("/")) {
        year = Number(parts[2]);
      } else {
        year = Number(parts[0]);
      }

      if (year && year < 1900) {
        return "Year must be 1900 or later.";
      }
      return true;
    },
    defaultValue: "01.01.2000",
    schema: undefined, // @reliverse/relinka allows you to pass an additional TypeBox schema if needed, but it's not required
  });

  console.log(`You entered: ${userDate}`);
}

export async function showSelectPrompt(): Promise<UserInput["lang"]> {
  const lang = await selectPrompt({
    title: "[selectPrompt] Choose your language",
    options: [
      { label: "English", value: "en", hint: "Default" },
      { label: "Ukrainian", value: "uk", hint: "Українська" },
      { label: "Polish", value: "pl", hint: "Polski" },
      { label: "French", value: "fr", hint: "Français" },
      { label: "German", value: "de", hint: "Deutsch" },
      { label: "Spanish", value: "es", hint: "Español" },
      { label: "Italian", value: "it", hint: "Italiano" },
      { label: "Other", value: "else", hint: "Other" },
    ],
    initial: "en",
    ...experimentalConfig,
  });

  switch (lang) {
    case "en":
      msg({ type: "M_INFO", title: "You selected English" });
      break;
    case "uk":
      msg({ type: "M_INFO", title: "Ви обрали українську" });
      break;
    case "pl":
      msg({ type: "M_INFO", title: "Wybrałeś język polski" });
      break;
    case "fr":
      msg({ type: "M_INFO", title: "Vous avez choisi le français" });
      break;
    case "de":
      msg({
        type: "M_INFO",
        title: "Sie haben die deutsche Sprache ausgewählt",
      });
      break;
    case "es":
      msg({ type: "M_INFO", title: "Has elegido el español" });
      break;
    case "it":
      msg({ type: "M_INFO", title: "Hai scelto l'italiano" });
      break;
    case "else":
      msg({ type: "M_INFO", title: "You selected Other" });
      break;
  }

  return lang;
}

export async function showMultiselectPrompt(): Promise<UserInput["langs"]> {
  const jokes: Record<string, string> = {
    TypeScript:
      "- Why did TypeScript bring a type-checker to the party? Because it couldn't handle any loose ends!",
    JavaScript:
      "- Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
    CoffeeScript:
      "- Why do CoffeeScript developers always seem calm? Because they never have to deal with too much Java!",
    Python:
      "- Why do Python programmers prefer dark mode? Because light attracts bugs!",
    Java: "- Why do Java developers wear glasses? Because they don't C#.",
    CSharp:
      "- Why did the C# developer go broke? Because he used up all his cache.",
    Go: "- Why do Go programmers prefer the beach? Because they love to handle their goroutines!",
    Rust: "- Why did the Rust programmer never get lost? Because he always borrowed the right path.",
    Swift:
      "- Why did the Swift developer quit his job? Because he didn't like being optional!",
  };

  const selectedOptions = await multiselectPrompt({
    title: "Select your favorite programming languages",
    options: [
      { value: "TypeScript", hint: "💙 Type-safe and scalable" },
      { value: "JavaScript", hint: "💛 Versatile and widely-used" },
      { value: "CoffeeScript", hint: "☕ Elegant and concise" },
      { value: "Python", hint: "🐍 Powerful and easy to learn" },
      { value: "Java", hint: "🍵 Robust and portable" },
      { value: "CSharp", hint: "🔢 Modern and object-oriented" },
      { value: "Go", hint: "🐋 Simple and efficient" },
      { value: "Rust", hint: "🦀 Fast and memory-safe" },
      { value: "Swift", hint: "🐦 Safe and performant" },
    ],
    required: true,
    initial: ["TypeScript", "JavaScript"],
    ...experimentalConfig,
  });

  if (!Array.isArray(selectedOptions)) {
    process.exit(0);
  }

  selectedOptions.forEach((option) => {
    // By using forEach, @reliverse/relinka
    // has Intellisense to each selected option
    switch (option) {
      case "CoffeeScript":
        msg({
          type: "M_INFO",
          title: "CoffeeScript... 🤔",
          titleColor: "dim",
        });
        break;
      default:
        break;
    }
  });

  msg({
    type: "M_INFO",
    title: "Here are some dumb jokes for you:",
    titleTypography: "bold",
    titleColor: "viceGradient",
    addNewLineBefore: false,
    addNewLineAfter: false,
  });

  selectedOptions.forEach((option) => {
    const joke = jokes[option];
    msg({
      type: "M_INFO_NULL",
      title: joke ? joke : `${option} selected.`,
      addNewLineBefore: false,
      addNewLineAfter: false,
    });
  });

  msg({
    type: "M_NEWLINE",
  });

  return selectedOptions;
}

export async function showNumSelectPrompt(): Promise<UserInput["color"]> {
  const choices = createColorChoices();

  const color = await numSelectPrompt({
    id: IDs.color,
    title: "[numSelectPrompt] Choose your favorite color",
    content:
      "You are free to customize everything in your prompts using the following color palette.",
    ...extendedConfig,
    choices,
    defaultValue: "17",
    hint: "Default: 17",
    schema: schema.properties.color,
  });

  return color.toString() ?? "red";
}

export async function showNumMultiselectPrompt(): Promise<
  UserInput["features"]
> {
  const features = await numMultiSelectPrompt({
    id: IDs.features,
    title: "[numMultiSelectPrompt] What web technologies do you like?",
    defaultValue: ["react", "typescript"],
    choices: [
      {
        title: "React",
        id: "react",
        // Some properties, like 'choices.description', are optional.
        description: "A library for building user interfaces.",
      },
      {
        title: "TypeScript",
        id: "typescript",
        description:
          "A programming language that adds static typing to JavaScript.",
      },
      {
        title: "ESLint",
        id: "eslint",
        description: "A tool for identifying patterns in JavaScript code.",
      },
    ] as const,
    schema: schema.properties.features,
  });
  return features ?? ["react", "typescript"];
}

export async function showTogglePrompt(): Promise<UserInput["toggle"]> {
  const result = await togglePrompt({
    title: "[togglePrompt] Do you like @reliverse/relinka library?",
    options: ["Yes", "No"],
    initial: "Yes",
  });

  const agree = result === "Yes";
  msg({
    type: "M_INFO",
    title: "Your response:",
    content: agree ? "You like it! 🥰" : "You don't like it... 😔",
  });

  return agree;
}

export async function showConfirmPrompt(
  username: string,
): Promise<UserInput["spinner"]> {
  await showAnykeyPrompt("pm", username);

  const spinner = await confirmPrompt({
    id: IDs.spinner,
    title: "[confirmPrompt] Do you want to see spinner in action?",
    // Intellisense will show you all available colors thanks to the enum.
    titleColor: "red",
    titleVariant: "doubleBox",
    schema: schema.properties.spinner,
    // @reliverse/relinka includes styled prompts, with the `title` color defaulting
    // to "cyanBright". Setting the color to "none" removes the default styling.
    content: "Spinners are helpful for long-running tasks.",
    ...extendedConfig,
    // Default value can be set both by the `defaultValue` property,
    // or by returning the value in your own function like this one.
    defaultValue: true,
  });

  if (spinner) {
    await showSpinner();
  }

  // A return value is unnecessary for prompts when the result is not needed later.
  return spinner ?? false;
}

// Prompt ID is not required for the following
// components, as they don't return any values.

export async function showSpinner() {
  await spinner({
    initialMessage: "Some long-running task is in progress...",
    successMessage: "Hooray! The long-running task was a success!",
    errorMessage: "An error occurred while the long-running task!",
    spinnerSolution: "ora",
    spinnerType: "arc",
    action: async (updateMessage) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateMessage("This is just an example, nothing really happens...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  });
}

export async function showProgressBar() {
  await progressbar({
    total: 100,
    width: 10,
    format:
      "[progressbar] [:bar] :percent% | Elapsed: :elapsed s | ETA: :eta s",
    completeChar: "#",
    incompleteChar: "-",
    colorize: true, // Enable colorization
    increment: 5, // Increment by 5
    desiredTotalTime: 3000, // 3 seconds
  });
}

export async function showResults(userInput: UserInput) {
  await promptsDisplayResults({
    // Display all user input values, e.g.:
    // ┌────────────────────────────────┐
    // │ Here is your input result:     │
    // │ {                              │
    // │   "deps": true,                │
    // │   "username": "GeraltOfRivia", │
    // │   "password": "21ytrewq",      │
    // │   "age": 98,                   │
    // │   "color": "blue",             │
    // │   "features": [                │
    // │      "typescript", "eslint"    │
    // │   ]                            │
    // │ }                              │
    // └────────────────────────────────┘
    results: userInput,
    inline: true,
  });
}

export async function doSomeFunStuff(userInput: UserInput) {
  // Just for fun, let's create an age calculator
  // based on the birthday to verify age accuracy.
  const calculatedAge = calculateAge(userInput.birthday);
  validateAge(calculatedAge, userInput.age, userInput.birthday);

  // Hash the password and update the user input object
  userInput.password = hashPassword(userInput.password);

  // Display user registration information
  displayUserInputs(userInput);
}

export async function showNextStepsPrompt() {
  await nextStepsPrompt({
    id: "nextSteps",
    title: "[nextStepsPrompt] Next Steps",
    content: "- Set up your profile\n- Review your dashboard\n- Add tasks",
    ...extendedConfig,
  });
}

export async function showAnimatedText() {
  await animateText({
    title: emojify(
      "ℹ  :exploding_head: Our library even supports animated messages and emojis!",
    ),
    anim: "neon",
    delay: 2000,
    ...basicConfig,
    titleColor: "passionGradient",
    titleTypography: "bold",
  });
}

export async function showEndPrompt() {
  await endPrompt({
    id: "end",
    title: emojify(
      "ℹ  :books: Learn the docs here: https://docs.reliverse.org/relinka",
    ),
    titleAnimation: "glitch",
    ...basicConfig,
    titleColor: "retroGradient",
    titleTypography: "bold",
    titleAnimationDelay: 2000,
  });
}
