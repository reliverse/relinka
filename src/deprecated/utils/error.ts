import { sep } from "node:path";

/**
 * Parses a stack trace string and normalizes its paths by removing the current working directory and the "file://" protocol.
 * @param {string} stack - The stack trace string.
 * @returns {string[]} An array of stack trace lines with normalized paths.
 */
export function parseStack(stack: string) {
  const cwd = process.cwd() + sep;

  const lines = stack
    .split("\n")
    .splice(1)
    .map((l) => l.trim().replace("file://", "").replace(cwd, ""));

  return lines;
}
