/// <reference types="node" />
import type { Duplex } from "node:stream";
/**
 * `RelinkaReadline` is a re-implementation of `readline.Interface` from Node.js.
 * It's reimplemented because of 3 reasons:
 * 1. The `readline.Interface` API is not complete; it's missing for example `clearLine`.
 * 2. The input/output streams are not generics, meaning they're inexact.
 * 3. Since ReadLine isn't built-in Typescript Global NodeJS type, it'd force us to ship `@types/node` as a dependency to all users.
 */
export type RelinkaReadline = {
  output: Duplex & { mute: () => void; unmute: () => void };
  input: NodeJS.ReadableStream;
  clearLine: (dir: 0 | 1 | -1) => void; // https://nodejs.org/api/readline.html#rlclearlinedir
  getCursorPos: () => { rows: number; cols: number };
  setPrompt: (prompt: string) => void;
  line: string;
  write: (data: string) => void;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (
    event: string,
    listener: (...args: unknown[]) => void,
  ) => void;
  pause: () => void;
  resume: () => void;
  close: () => void;
};

export type Context = {
  input?: NodeJS.ReadableStream;
  output?: NodeJS.WritableStream;
  clearPromptOnDone?: boolean;
  signal?: AbortSignal;
};

export type Prompt<Value, Config> = (
  config: Config,
  context?: Context,
) => Promise<Value> & {
  /** @deprecated pass an AbortSignal in the context options instead. See {@link https://github.com/SBoudrias/Relinka.js#canceling-prompt} */
  cancel: () => void;
};
