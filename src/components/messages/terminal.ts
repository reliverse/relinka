import ansiEscapes from "ansi-escapes";
import { cursor } from "sisteransi";
import terminalSize from "terminal-size";
import wrapAnsi from "wrap-ansi";

export function getTerminalHeight(): number {
  return terminalSize().rows ?? 24;
}

export function getExactTerminalWidth(): number {
  return terminalSize().columns ?? 80;
}

export function getTerminalWidth(terminalWidth = 0): number {
  if (terminalWidth === 0) {
    terminalWidth = getExactTerminalWidth();
  }

  if (terminalWidth > 150) {
    return terminalWidth - 40;
  } else if (terminalWidth > 120) {
    return terminalWidth - 30;
  } else if (terminalWidth > 100) {
    return terminalWidth - 20;
  }
  return terminalWidth;
}

/**
 * Force line returns at specific width. This function is ANSI code friendly and it'll
 * ignore invisible codes during width calculation.
 * @param {string} content
 * @return {string}
 */
export function breakLines(content: string, terminalWidth = 0): string {
  if (terminalWidth === 0) {
    terminalWidth = getTerminalWidth();
  }

  return content
    .split("\n")
    .flatMap((line) =>
      wrapAnsi(line, terminalWidth, { trim: false, hard: true })
        .split("\n")
        .map((str) => str.trimEnd()),
    )
    .join("\n");
}

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
    console.error("Count is less than or equal to 0. Nothing to delete.");
    return;
  }
  process.stdout.write(ansiEscapes.eraseLines(count));
}

export function countLines(text: string): number {
  const adjustedWidth = getTerminalWidth();
  const lines = text.split("\n");
  let lineCount = 0;

  for (const line of lines) {
    const wrapped = wrapAnsi(line, adjustedWidth, { hard: true });
    lineCount += wrapped.split("\n").length;
  }

  return lineCount;
}
