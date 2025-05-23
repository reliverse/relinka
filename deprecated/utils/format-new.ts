import { compileFormat, formatString } from "@reliverse/repris";

// Caches compiled format strings for reuse (optional, as repris already caches internally)
const _compileCache: Record<string, string> = {};

/**
 * Compiles a format string with named or positional arguments to a standard format string.
 * Uses @reliverse/repris's built-in compileFormat.
 * @param {string} format - The format string containing named placeholders.
 * @returns {string} The compiled format string with positional indices.
 */
export function compile(format: string) {
  if (_compileCache[format]) {
    return _compileCache[format];
  }
  const compiled = compileFormat(format);
  _compileCache[format] = compiled;
  return compiled;
}

/**
 * Formats a string using either an array or an object of arguments.
 * Uses @reliverse/repris's built-in formatString.
 * @param {string} format - The format string (named or positional).
 * @param {any[] | Record<string, unknown>} args - Arguments to format into the string.
 * @returns {string} The formatted string.
 */
export function formatStr(
  format: string,
  args: any[] | Record<string, unknown>,
) {
  return formatString(format, args);
}
