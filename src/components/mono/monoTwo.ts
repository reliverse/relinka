/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import { text, confirm, select, multiselect } from "../prompts/promptTwo.js";

type SelectOption = {
  label: string;
  value: string;
  hint?: string;
};

export type TextPromptOptions = {
  /**
   * Specifies the prompt type as text.
   * @optional
   * @default "text"
   */
  type?: "text";

  /**
   * The default text value.
   * @optional
   */
  default?: string;

  /**
   * A placeholder text displayed in the prompt.
   * @optional
   */
  placeholder?: string;

  /**
   * The initial text value.
   * @optional
   */
  initial?: string;
};

export type ConfirmPromptOptions = {
  /**
   * Specifies the prompt type as confirm.
   */
  type: "confirm";

  /**
   * The initial value for the confirm prompt.
   * @optional
   */
  initial?: boolean;
};

export type SelectPromptOptions = {
  /**
   * Specifies the prompt type as select.
   */
  type: "select";

  /**
   * The initial value for the select prompt.
   * @optional
   */
  initial?: string;

  /**
   * The options to select from. See {@link SelectOption}.
   */
  options: (string | SelectOption)[];
};

export type MultiSelectOptions = {
  /**
   * Specifies the prompt type as multiselect.
   */
  type: "multiselect";

  /**
   * The options to select from. See {@link SelectOption}.
   */
  initial?: string[];

  /**
   * The options to select from. See {@link SelectOption}.
   */
  options: (string | SelectOption)[];

  /**
   * Whether the prompt requires at least one selection.
   */
  required?: boolean;
};

/**
 * Defines a combined type for all prompt options.
 */
export type PromptOptions =
  | TextPromptOptions
  | ConfirmPromptOptions
  | SelectPromptOptions
  | MultiSelectOptions;

type inferPromptReturnType<T extends PromptOptions> =
  T extends TextPromptOptions
    ? string
    : T extends ConfirmPromptOptions
      ? boolean
      : T extends SelectPromptOptions
        ? T["options"][number] extends SelectOption
          ? T["options"][number]["value"]
          : T["options"][number]
        : T extends MultiSelectOptions
          ? T["options"]
          : unknown;

/**
 * Asynchronously prompts the user for input based on specified options.
 * Supports text, confirm, select and multi-select prompts.
 *
 * @param {string} message - The message to display in the prompt.
 * @param {PromptOptions} [opts={}] - The prompt options. See {@link PromptOptions}.
 * @returns {Promise<inferPromptReturnType<T>>} - A promise that resolves with the user's response, the type of which is inferred from the options. See {@link inferPromptReturnType}.
 */
export async function prompt<
  _ = any,
  __ = any,
  T extends PromptOptions = TextPromptOptions,
>(
  message: string,
  opts: PromptOptions = {},
): Promise<inferPromptReturnType<T>> {
  if (!opts.type || opts.type === "text") {
    return (await text({
      message,
      defaultValue: (opts as TextPromptOptions).default,
      placeholder: (opts as TextPromptOptions).placeholder,
      initialValue: (opts as TextPromptOptions).initial,
    })) as any;
  }

  if (opts.type === "confirm") {
    return (await confirm({
      message,
      initialValue: opts.initial,
    })) as any;
  }

  if (opts.type === "select") {
    return (await select({
      message,
      options: opts.options.map((o) =>
        typeof o === "string" ? { value: o, label: o } : o,
      ),
      initialValue: opts.initial,
    })) as any;
  }

  if (opts.type === "multiselect") {
    return (await multiselect({
      message,
      options: opts.options.map((o) =>
        typeof o === "string" ? { value: o, label: o } : o,
      ),
      required: opts.required,
      initialValues: opts.initial,
    })) as any;
  }

  // @ts-expect-error - TODO: fix ts
  throw new Error(`Unknown prompt type: ${opts.type}`);
}

// /**
//  * Defines the options for the multi-select prompt.
//  */
// type MultiselectPromptOptionsSeparate<Value = string> = {
//   /**
//    * The message to display in the prompt.
//    */
//   message: string;

//   /**
//    * The list of options to choose from.
//    */
//   options: (Value extends string
//     ? string | { value: Value; label: string; hint?: string }
//     : { value: Value; label: string; hint?: string })[];

//   /**
//    * Whether at least one option must be selected.
//    * @default true
//    */
//   required?: boolean;

//   /**
//    * The initially selected values.
//    */
//   initial?: Value[];

//   /**
//    * The cursor position or other cursor-related configurations.
//    */
//   cursorAt?: number;
// };

/**
 * Asynchronously prompts the user for a multi-select input.
 *
 * @param {MultiselectPromptOptionsSeparate} opts - The options for the multi-select prompt.
 * @returns {Promise<string[] | symbol>} - A promise that resolves with an array of selected options or a symbol.
 */
/* export async function multiselectPrompt<Value = string>(
  opts: MultiselectPromptOptionsSeparate<Value>,
): Promise<Value[] | symbol> {
  return await multiselect<Value[]>({
    message: opts.message,
    options: opts.options.map((o) =>
      typeof o === "string"
        ? { value: o as Value, label: o } // Ensure consistent Value type
        : o,
    ),
    required: opts.required ?? true,
    initialValues: opts.initial,
    cursorAt: opts.cursorAt as any, // `cursorAt` should conform to the type, ensuring compatibility
  });
} */
