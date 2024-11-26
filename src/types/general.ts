import type { AnimationName } from "@figliolia/chalk-animation";
import type { TSchema } from "@sinclair/typebox";

import type { LogLevel, LogType } from "~/utils/constants.js";

export type State = "initial" | "active" | "cancel" | "submit" | "error";

export type MsgType =
  | "M_NULL"
  | "M_START"
  | "M_MIDDLE"
  | "M_GENERAL"
  | "M_GENERAL_NULL"
  | "M_INFO"
  | "M_INFO_NULL"
  | "M_NEWLINE"
  | "M_END"
  | "M_ERROR"
  | "M_ERROR_NULL";

export type TypographyName = "bold" | "strikethrough" | "underline" | "italic";

export type Variant =
  | "box"
  | "doubleBox"
  | "banner"
  | "underline"
  | "none"
  | "animated";

export type ColorName =
  | "dim"
  | "inverse"
  | "black"
  | "red"
  | "redBright"
  | "bgRed"
  | "bgRedBright"
  | "green"
  | "greenBright"
  | "bgGreen"
  | "bgGreenBright"
  | "yellow"
  | "yellowBright"
  | "blue"
  | "blueBright"
  | "magenta"
  | "cyan"
  | "cyanBright"
  | "bgCyan"
  | "bgCyanBright"
  | "white"
  | "gray"
  | "gradientGradient"
  | "rainbowGradient"
  | "cristalGradient"
  | "mindGradient"
  | "passionGradient"
  | "viceGradient"
  | "retroGradient"
  | "none";

export type MsgConfig = {
  symbol: string;
  prefix?: string;
  color?: (text: string) => string;
  newLineBefore?: boolean;
  newLineAfter?: boolean;
  suffix?: string;
};

export type FmtMsgOptions = {
  type: MsgType;
  title?: string;
  titleAfterAnim?: string;
  content?: string;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: Variant;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: Variant;
  hint?: string;
  border?: boolean;
  borderColor?: ColorName;
  dontRemoveBar?: boolean;
  variantOptions?: {
    box?: {
      limit?: number;
    };
  };
  errorMessage?: string;
  addNewLineBefore?: boolean;
  addNewLineAfter?: boolean;
  placeholder?: string;
};

export type RequiredPromptOptions = {
  id: string;
  title: string;
};

export type OptionalPromptOptions<T extends TSchema = any> = {
  schema?: T;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: Variant;
  titleAnimation?: AnimationName;
  titleAnimationDelay?: number;
  content?: string;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: Variant;
  hint?: string;
  placeholder?: string;
  validate?: (value: any) => boolean | string | Promise<boolean | string>;
  defaultValue?: string | string[] | number | boolean;
  defaultColor?: ColorName;
  defaultTypography?: TypographyName;
  choices?: ChoiceOptions[];
  variantOptions?: {
    box?: {
      limit?: number;
    };
  };
  action?: () => Promise<void>;
  border?: boolean;
  borderColor?: ColorName;
  clearConsole?: boolean;
  additionalLinesToDelete?: number;
  hintColor?: ColorName;
  hints?: string[];
  required?: boolean;
  initial?: any[];
  endTitle?: string;
  endTitleColor?: ColorName;
};

export type PromptOptions<T extends TSchema = any> = RequiredPromptOptions &
  OptionalPromptOptions<T>;

export type ChoiceRequiredOptions = {
  id: string;
  title: string;
};

export type ChoiceOptionalOptions = {
  description?: string;
  titleTypography?: TypographyName;
  action?: () => Promise<void>;
};

export type ChoiceOptions = ChoiceRequiredOptions & ChoiceOptionalOptions;

export type PromptType =
  | "text"
  | "number"
  | "confirm"
  | "numSelect"
  | "select"
  | "multiselect"
  | "password"
  | "date"
  | "start"
  | "nextSteps"
  | "end";

export type RelinkaOptions = {
  /**
   * An array of RelinkaReporter instances used to handle and output log messages.
   */
  reporters: RelinkaReporter[];

  /**
   * A record mapping LogType to InputLogObject, defining the log configuration for each log type.
   * See {@link LogType} and {@link InputLogObject}.
   */
  types: Record<LogType, InputLogObject>;

  /**
   * The minimum log level to output. See {@link LogLevel}.
   */
  level: LogLevel;

  /**
   * Default properties applied to all log messages unless overridden. See {@link InputLogObject}.
   */
  defaults: InputLogObject;

  /**
   * The maximum number of times a log message can be repeated within a given frame of time.
   */
  throttle: number;

  /**
   * The minimum time in milliseconds that must elapse before a throttled log message can be logged again.
   */
  throttleMin: number;

  /**
   * The Node writable stream for standard output. See {@link NodeJS.WriteStream}.
   * @optional
   */
  stdout?: NodeJS.WriteStream;

  /**
   * The Node writeable stream for standard error output. See {@link NodeJS.WriteStream}.
   * @optional
   */
  stderr?: NodeJS.WriteStream;

  /**
   * A function that allows you to mock log messages for testing purposes.
   * @optional
   */
  mockFn?: (type: LogType, defaults: InputLogObject) => (...args: any) => void;

  /**
   * Custom prompt function to use. It can be undefined.
   * @optional
   */
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  prompt?: typeof import("~/components/mono/monoTwo.js").prompt | undefined;

  /**
   * Configuration options for formatting log messages. See {@link FormatOptions}.
   */
  formatOptions: FormatOptions;
};

/**
 * @see https://nodejs.org/api/util.html#util_util_inspect_object_showhidden_depth_colors
 */
export type FormatOptions = {
  /**
   * The maximum number of columns to output, affects formatting.
   * @optional
   */
  columns?: number;

  /**
   * Whether to include timestamp information in log messages.
   * @optional
   */
  date?: boolean;

  /**
   * Whether to use colors in the output.
   * @optional
   */
  colors?: boolean;

  /**
   * Specifies whether or not the output should be compact. Accepts a boolean or numeric level of compactness.
   * @optional
   */
  compact?: boolean | number;

  /**
   * Allows additional custom formatting options.
   */
  [key: string]: unknown;
};

export type InputLogObject = {
  /**
   * The logging level of the message. See {@link LogLevel}.
   * @optional
   */
  level?: LogLevel;

  /**
   * A string tag to categorize or identify the log message.
   * @optional
   */
  tag?: string;

  /**
   * The type of log message, which affects how it's processed and displayed. See {@link LogType}.
   * @optional
   */
  type?: LogType;

  /**
   * The main log message text.
   * @optional
   */
  message?: string;

  /**
   * Additional text or texts to be logged with the message.
   * @optional
   */
  additional?: string | string[];

  /**
   * Additional arguments to be logged with the message.
   * @optional
   */
  args?: any[];

  /**
   * The date and time when the log message was created.
   * @optional
   */
  date?: Date;
};

export type LogObject = {
  /**
   * The logging level of the message, overridden if required. See {@link LogLevel}.
   */
  level: LogLevel;

  /**
   * The type of log message, overridden if required. See {@link LogType}.
   */
  type: LogType;

  /**
   * A string tag to categorize or identify the log message, overridden if necessary.
   */
  tag: string;

  /**
   * Additional arguments to be logged with the message, overridden if necessary.
   */
  args: any[];

  /**
   * The date and time the log message was created, overridden if necessary.
   */
  date: Date;

  /**
   * Allows additional custom properties to be set on the log object.
   */
  [key: string]: unknown;
} & InputLogObject;

export type RelinkaReporter = {
  /**
   * Defines how a log message is processed and displayed by this reporter.
   * @param logObj The LogObject containing the log information to process. See {@link LogObject}.
   * @param ctx An object containing context information such as options. See {@link RelinkaOptions}.
   */
  log: (
    logObj: LogObject,
    ctx: {
      options: RelinkaOptions;
    },
  ) => void;
};
