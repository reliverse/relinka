import type { TSchema } from "@sinclair/typebox";

import type { OptionalPromptOptions, PromptType } from "./general.js";

export type StateDeprecated =
  | "initial"
  | "active"
  | "completed"
  | "cancel"
  | "submit"
  | "error";

export type PromptStateDeprecated = {
  id: string;
  state: StateDeprecated;
  symbol: string;
  value: any;
};

export type RequiredPromptOptionsDeprecated = {
  id: string;
  type: PromptType;
  title: string;
};

export type PromptOptionsDeprecated<T extends TSchema = any> =
  RequiredPromptOptionsDeprecated &
    OptionalPromptOptions<T> & {
      state?: StateDeprecated;
      stateCompletedTitle?: string;
    };

export type SymbolCharacterDeprecated =
  | "S_START"
  | "S_MIDDLE"
  | "S_END"
  | "S_LINE"
  | "S_STEP_ACTIVE"
  | "S_STEP_CANCEL"
  | "S_STEP_ERROR"
  | "S_STEP_SUBMIT"
  | "S_RADIO_ACTIVE"
  | "S_RADIO_INACTIVE"
  | "S_CHECKBOX_ACTIVE"
  | "S_CHECKBOX_SELECTED"
  | "S_CHECKBOX_INACTIVE"
  | "S_PASSWORD_MASK"
  | "S_BAR_H"
  | "S_CORNER_TOP_RIGHT"
  | "S_CONNECT_LEFT"
  | "S_CORNER_BOTTOM_RIGHT";
