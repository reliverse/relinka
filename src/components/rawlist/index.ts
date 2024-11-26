import colors from "picocolors";

import type { PartialDeep } from "~/types/index.js";

import {
  createPrompt,
  useMemo,
  useState,
  useKeypress,
  usePrefix,
  isEnterKey,
  Separator,
  makeTheme,
  type Theme,
  type Status,
} from "~/components/core/index.js";

const numberRegex = /\d+/;

type Choice<Value> = {
  value: Value;
  name?: string;
  short?: string;
  key?: string;
};

type NormalizedChoice<Value> = {
  value: Value;
  name: string;
  short: string;
  key: string;
};

type RawlistConfig<Value, ChoicesObject = readonly (string | Separator)[]> = {
  message: string;
  choices: ChoicesObject extends readonly (string | Separator)[]
    ? ChoicesObject
    : readonly (Choice<Value> | Separator)[];
  theme?: PartialDeep<Theme>;
};

function isSelectableChoice<T>(
  choice: undefined | Separator | NormalizedChoice<T>,
): choice is NormalizedChoice<T> {
  return choice != null && !Separator.isSeparator(choice);
}

function normalizeChoices<Value>(
  choices: readonly (string | Separator)[],
): (NormalizedChoice<Value> | Separator)[] {
  let index = 0;
  return choices.map((choice) => {
    if (Separator.isSeparator(choice)) {
      return choice;
    }

    index += 1;
    if (typeof choice === "string") {
      return {
        value: choice as Value,
        name: choice,
        short: choice,
        key: String(index),
      };
    }
    // @ts-expect-error - TODO: fix ts

    const name = choice.name ?? String(choice.value);
    return {
      // @ts-expect-error - TODO: fix ts
      value: choice.value,
      name,
      // @ts-expect-error - TODO: fix ts
      short: choice.short ?? name,
      // @ts-expect-error - TODO: fix ts
      key: choice.key ?? String(index),
    };
  });
}

const rawlist = createPrompt(
  <Value>(config: RawlistConfig<Value>, done: (value: Value) => void) => {
    const choices = useMemo(
      () => normalizeChoices(config.choices),
      [config.choices],
    );
    const [status, setStatus] = useState<Status>("idle");
    const [value, setValue] = useState<string>("");
    const [errorMsg, setError] = useState<string>();
    const theme = makeTheme(config.theme);
    const prefix = usePrefix({ status, theme });

    useKeypress((key, rl) => {
      if (isEnterKey(key)) {
        let selectedChoice;
        if (numberRegex.test(value)) {
          const answer = Number.parseInt(value, 10) - 1;
          selectedChoice = choices.filter(isSelectableChoice)[answer];
        } else {
          selectedChoice = choices.find(
            (choice) => isSelectableChoice(choice) && choice.key === value,
          );
        }

        if (isSelectableChoice(selectedChoice)) {
          setValue(selectedChoice.short);
          setStatus("done");
          // @ts-expect-error - TODO: fix ts
          done(selectedChoice.value);
        } else if (value === "") {
          setError("Please input a value");
        } else {
          setError(`"${colors.red(value)}" isn't an available option`);
        }
      } else {
        setValue(rl.line);
        setError(undefined);
      }
    });

    const message = theme.style.message(config.message, status);

    if (status === "done") {
      return `${prefix} ${message} ${theme.style.answer(value)}`;
    }

    const choicesStr = choices
      .map((choice) => {
        if (Separator.isSeparator(choice)) {
          return ` ${choice.separator}`;
        }

        const line = `  ${choice.key}) ${choice.name}`;

        if (choice.key === value.toLowerCase()) {
          return theme.style.highlight(line);
        }

        return line;
      })
      .join("\n");

    let error = "";
    if (errorMsg) {
      error = theme.style.error(errorMsg);
    }

    return [
      `${prefix} ${message} ${value}`,
      [choicesStr, error].filter(Boolean).join("\n"),
    ];
  },
);

export default rawlist;
export { Separator } from "~/components/core/index.js";
