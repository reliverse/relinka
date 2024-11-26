// useKeyPress: Detect and perform actions on key press events with useKeyPress.

import { stdin } from "node:process";
import readline from "node:readline";

type KeyPressCallback = (str: string, key: readline.Key) => void;

export function useKeyPress(callback: KeyPressCallback) {
  readline.emitKeypressEvents(stdin);
  if (stdin.isTTY) {
    stdin.setRawMode(true);
  }

  const onKeypress = (str: string, key: readline.Key) => {
    callback(str, key);
  };

  stdin.on("keypress", onKeypress);

  return () => {
    stdin.setRawMode(false);
    stdin.off("keypress", onKeypress);
  };
}
