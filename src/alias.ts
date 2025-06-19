/**
 * Alias exports for the relinka logger
 * Provides convenient aliases for common logging needs
 */

import { relinka } from "./impl.js";

// Export the main relinka function as log and logger (supports both syntaxes)
export { relinka as log, relinka as logger };

// Create a message function that maps to the "log" level
export function message(msg: string, ...args: unknown[]): void {
  relinka.log(msg, ...args);
}

// Export step level directly for convenience
export function step(msg: string, ...args: unknown[]): void {
  relinka.step(msg, ...args);
}
