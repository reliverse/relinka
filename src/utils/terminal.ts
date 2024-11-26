import ansiEscapes from "ansi-escapes";
import { cursor } from "sisteransi";
import wrapAnsi from "wrap-ansi";

import { msg } from "./messages.js";

export function removeCursor() {
  process.stdout.write(cursor.hide);
}

export function restoreCursor() {
  process.stdout.write(cursor.show);
}

export function deleteLastLine() {
  process.stdout.write(ansiEscapes.cursorUp(1) + ansiEscapes.eraseLine);
}

export function deleteLastLines(count: number) {
  if (count <= 0) {
    msg({
      type: "M_ERROR",
      title: "Count is less than or equal to 0. Nothing to delete.",
    });
    return;
  }
  process.stdout.write(ansiEscapes.eraseLines(count));
}

export function countLines(text: string): number {
  const terminalWidth = process.stdout.columns || 80;
  const lines = text.split("\n");
  let lineCount = 0;

  for (const line of lines) {
    const wrapped = wrapAnsi(line, terminalWidth, { hard: true });
    lineCount += wrapped.split("\n").length;
  }

  return lineCount;
}
