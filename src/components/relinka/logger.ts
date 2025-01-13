import { msg } from "~/main.js";

export type MessageKind = "log" | "info" | "warn" | "error" | "success";
export type VerboseKind = `${MessageKind}-verbose`;
export type AllKinds = MessageKind | VerboseKind;
export type MessageConfig = {
  type: "M_INFO" | "M_ERROR";
  titleColor?: "retroGradient" | "viceGradient" | "yellowBright";
  titleTypography?: "bold";
  contentColor?: "dim";
  contentTypography?: "italic";
};

const verboseLogging = false;

const MESSAGE_CONFIGS: Record<MessageKind, MessageConfig> = {
  log: {
    type: "M_INFO",
    titleColor: "retroGradient",
    titleTypography: "bold",
  },
  info: {
    type: "M_INFO",
    titleColor: "retroGradient",
    titleTypography: "bold",
  },
  success: {
    type: "M_INFO",
    titleColor: "viceGradient",
    titleTypography: "bold",
  },
  warn: {
    type: "M_ERROR",
    titleColor: "yellowBright",
    titleTypography: "bold",
  },
  error: {
    type: "M_ERROR",
    titleColor: "yellowBright",
    titleTypography: "bold",
  },
};

export const relinka = (
  kind: AllKinds,
  title: string,
  content?: string,
  hint?: string,
): void => {
  const isVerbose = kind.endsWith("-verbose");
  const baseKind = (
    isVerbose ? kind.replace("-verbose", "") : kind
  ) as MessageKind;

  if (isVerbose && !verboseLogging) {
    return;
  }

  const config = MESSAGE_CONFIGS[baseKind];
  msg({
    ...config,
    title: isVerbose ? `[debug] ${title}` : title,
    content: content ?? "",
    contentColor: "dim",
    contentTypography: "italic",
    hint: hint ?? "",
  });
};

export const throwError = (error: unknown): never => {
  msg({
    type: "M_ERROR",
    title:
      error instanceof Error
        ? `🤔 Failed to set up the project: ${error.message}`
        : "🤔 An unknown error occurred.",
  });

  process.exit(1);
};
