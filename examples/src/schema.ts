import { Type, type Static } from "@sinclair/typebox";
import {
  buildRegExp,
  choiceOf,
  endOfString,
  startOfString,
} from "ts-regex-builder";

import { colorMap } from "~/main.js";

// You can define pieces of the schema separately and then use them in the main schema.
const colorSchema = Type.Enum(
  Object.keys(colorMap).reduce(
    (acc, key) => {
      acc[key] = key;
      return acc;
    },
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    {} as Record<keyof typeof colorMap, string>,
  ),
);

// You can use ts-regex-builder or magic-regexp
// libraries to define a more stable regexes
const usernameRegexPrecise = buildRegExp([
  startOfString,
  choiceOf(
    // a-zA-Z0-9 and Cyrillic characters
    /[a-zA-Z0-9\u0400-\u04FF]+/,
  ),
  endOfString,
]);

// @reliverse/relinka allows you to define the schema once and reuse it for each prompt.
// This is useful if you want to validate the input of multiple prompts using TypeBox.
export const schema = Type.Object({
  username: Type.RegExp(usernameRegexPrecise, {
    description:
      "Username must be 2-20 characters long and contain only latin letters, numbers, or cyrillic characters.",
  }),
  dir: Type.String({ minLength: 1 }),
  spinner: Type.Boolean(),
  password: Type.String({ minLength: 4 }),
  age: Type.Number({ minimum: 18, maximum: 99 }),
  lang: Type.String(),
  color: colorSchema,
  birthday: Type.String({ minLength: 10, maxLength: 10 }),
  langs: Type.Array(Type.String()),
  features: Type.Array(Type.String()),
  toggle: Type.Boolean(),
});

// You can define the type to use in the result object, populated with results from the prompts.
export type UserInput = Static<typeof schema>;
