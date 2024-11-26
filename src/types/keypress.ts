import type { Readable } from "stream";

export enum KeyName {
  RETURN = "return",
  ENTER = "enter",
  TAB = "tab",
  BACKSPACE = "backspace",
  ESCAPE = "escape",
  SPACE = "space",
  UP = "up",
  DOWN = "down",
  RIGHT = "right",
  LEFT = "left",
  F1 = "f1",
  F2 = "f2",
  F3 = "f3",
  F4 = "f4",
  F5 = "f5",
  F6 = "f6",
  F7 = "f7",
  F8 = "f8",
  F9 = "f9",
  F10 = "f10",
  F11 = "f11",
  F12 = "f12",
  CLEAR = "clear",
  END = "end",
  HOME = "home",
  INSERT = "insert",
  PAGEUP = "pageup",
  PAGEDOWN = "pagedown",
  DELETE = "delete",
  NEXT = "next",
  PREVIOUS = "previous",
  SUBMIT = "submit",
  ABORT = "abort",
}

export type Keypress = {
  name: KeyName | string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  sequence: string;
  code?: string;
  raw: string;
};

export type KeypressCallback = (key: Keypress) => void;

/**
 * Type definition for the listenForKeys function
 */
export type ListenForKeys = {
  (stream: Readable, callback: KeypressCallback): () => void;

  parse: (s: string | Buffer, enc?: string) => Keypress | Keypress[];
};

declare const listenForKeys: ListenForKeys;

export default listenForKeys;
