import type { TSchema } from "@sinclair/typebox";

import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { cyanBright } from "picocolors";
import {
  buildRegExp,
  digit,
  endOfString,
  repeat,
  startOfString,
} from "ts-regex-builder";

import type { PromptOptions } from "~/types/general.js";

import { bar, fmt, msg } from "~/utils/messages.js";
import {
  countLines,
  deleteLastLine,
  deleteLastLines,
} from "~/utils/terminal.js";

// Helper constructs
const twoDigits = repeat(digit, 2); // \d{2}
const fourDigits = repeat(digit, 4); // \d{4}
const separatorDot = "."; // Literal dot
const separatorSlash = "/"; // Literal slash

// DD.MM.YYYY
const regexDDMMYYYY = buildRegExp([
  startOfString,
  twoDigits, // DD
  separatorDot,
  twoDigits, // MM
  separatorDot,
  fourDigits, // YYYY
  endOfString,
]);

// MM/DD/YYYY
const regexMMDDYYYY = buildRegExp([
  startOfString,
  twoDigits, // MM
  separatorSlash,
  twoDigits, // DD
  separatorSlash,
  fourDigits, // YYYY
  endOfString,
]);

// YYYY.MM.DD
const regexYYYYMMDD = buildRegExp([
  startOfString,
  fourDigits, // YYYY
  separatorDot,
  twoDigits, // MM
  separatorDot,
  twoDigits, // DD
  endOfString,
]);

// Combine all date formats into a union schema using TypeBox
const dateFormatSchema = Type.Union([
  Type.RegExp(regexDDMMYYYY, { description: "DD.MM.YYYY" }),
  Type.RegExp(regexMMDDYYYY, { description: "MM/DD/YYYY" }),
  Type.RegExp(regexYYYYMMDD, { description: "YYYY.MM.DD" }),
]);

// Implement the datePrompt function
export async function datePrompt<T extends TSchema>(
  options: PromptOptions<T> & {
    dateFormat: string; // Description of accepted date formats
    dateKind: "birthday" | "other"; // Type of date for additional validation
  },
): Promise<string> {
  const {
    title,
    dateFormat,
    dateKind,
    hint,
    validate,
    defaultValue,
    schema,
    titleColor = "cyanBright",
    titleTypography = "bold",
    titleVariant,
    content,
    contentColor,
    contentTypography,
    contentVariant,
    borderColor = "viceGradient",
    variantOptions,
  } = options;

  const rl = readline.createInterface({ input, output });

  const formattedBar = bar({ borderColor });

  let linesToDelete = 0;
  let errorMessage = "";

  try {
    while (true) {
      // Delete previous lines if necessary
      if (linesToDelete > 0) {
        deleteLastLines(linesToDelete);
      }

      // Format the question prompt
      const questionText = fmt({
        type: errorMessage !== "" ? "M_ERROR_NULL" : "M_GENERAL_NULL",
        title: `${title} [Format: ${dateFormat}]`,
        titleColor,
        titleTypography,
        titleVariant,
        content,
        contentColor,
        contentTypography,
        contentVariant,
        borderColor,
        hint,
        variantOptions,
        errorMessage,
        addNewLineBefore: false,
      });

      const questionLines = countLines(questionText);
      linesToDelete = questionLines + 1; // +1 for user's input

      // Display the formatted question
      msg({
        type: errorMessage !== "" ? "M_ERROR" : "M_GENERAL",
        title: questionText,
      });

      deleteLastLine();
      deleteLastLine();

      // Prompt the user for input
      const answer =
        (await rl.question(`${cyanBright(">")}  `)).trim() || defaultValue;

      // Display defaultValue if it is used
      if (answer === defaultValue && defaultValue) {
        deleteLastLine();
        msg({
          type: "M_MIDDLE",
          title: `  ${defaultValue}`,
          titleColor: "none",
        });
      }

      // Validate the answer against the dateFormatSchema
      if (!Value.Check(dateFormatSchema, answer)) {
        deleteLastLine();
        deleteLastLine();
        errorMessage = `Please enter a valid date in ${dateFormat} format.`;
        msg({ type: "M_ERROR", title: errorMessage });
        continue;
      }

      // Determine which regex matched
      let matchedFormat: string | null = null;
      if (regexDDMMYYYY.test(answer)) {
        matchedFormat = "DD.MM.YYYY";
      } else if (regexMMDDYYYY.test(answer)) {
        matchedFormat = "MM/DD/YYYY";
      } else if (regexYYYYMMDD.test(answer)) {
        matchedFormat = "YYYY.MM.DD";
      }

      // Additional validation for 'birthday' kind
      if (dateKind === "birthday" && matchedFormat) {
        const parts = answer.split(/[./-]/);
        let date: Date;

        if (matchedFormat === "DD.MM.YYYY") {
          date = new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0]),
          );
        } else if (matchedFormat === "MM/DD/YYYY") {
          date = new Date(
            Number(parts[2]),
            Number(parts[0]) - 1,
            Number(parts[1]),
          );
        } else if (matchedFormat === "YYYY.MM.DD") {
          date = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2]),
          );
        } else {
          date = new Date(answer);
        }

        if (
          isNaN(date.getTime()) ||
          date.getFullYear() < 1900 ||
          date > new Date()
        ) {
          errorMessage =
            "Please enter a valid birthday date (e.g., 14.09.1999).";
          msg({ type: "M_ERROR", title: errorMessage });
          continue;
        }
      }

      let isValid = true;
      let gotError = false;
      if (errorMessage !== "") {
        gotError = true;
      }
      errorMessage = ""; // Reset errorMessage

      // Validate against additional schema if provided
      if (schema) {
        isValid = Value.Check(schema, answer);
        if (!isValid) {
          const errors = [...Value.Errors(schema, answer)];
          errorMessage = errors[0]?.message ?? "Invalid input.";
          msg({ type: "M_ERROR", title: errorMessage });
          gotError = true;
          continue;
        }
      }

      // Custom validation function
      if (validate && isValid) {
        const validation = await validate(answer);
        if (validation !== true) {
          isValid = false;
          errorMessage =
            typeof validation === "string" ? validation : "Invalid input.";
          msg({ type: "M_ERROR", title: errorMessage });
          gotError = true;
          continue;
        }
      }

      // If all validations pass, return the answer
      if (isValid) {
        if (gotError) {
          deleteLastLine();
          deleteLastLine();
          msg({ type: "M_MIDDLE", title: `  ${answer}` });
        }
        msg({ type: "M_NEWLINE", title: "" });
        rl.close();
        return answer;
      }
    }
  } finally {
    rl.close();
  }
}
