import { isDebug, isTest, isCI } from "std-env";

import type { LogLevel } from "./components/levels/levels.js";
import type { RelinkaInstance } from "./components/relinka/relinka.js";
import type { RelinkaOptions } from "./types/mod.js";

import { LogLevels } from "./components/levels/levels.js";
import { createRelinka as _createRelinka } from "./components/relinka/relinka.js";
import { BasicReporter } from "./components/reporters/basic.js";
import { FancyReporter } from "./components/reporters/fancy.js";

export * from "~/components/modes/shared.js";

/**
 * Factory function to create a new Relinka instance tailored for use in different environments.
 * It automatically adjusts logging levels based on environment variables and execution context.
 *
 * @param {Partial<RelinkaOptions & { fancy: boolean }>} [options={}] - Optional configuration options. See {@link RelinkaOptions}.
 * @returns {RelinkaInstance} A new Relinka instance with configurations based on the given options and the execution environment.
 */
export function createRelinka(
  options: Partial<RelinkaOptions & { fancy: boolean }> = {},
): RelinkaInstance {
  // Log level
  let level = _getDefaultLogLevel();
  if (process.env.RELINKA_LEVEL) {
    level = Number.parseInt(process.env.RELINKA_LEVEL) ?? level;
  }

  // Create new relinka instance
  const relinka = _createRelinka({
    level: level as LogLevel,
    defaults: { level },
    stdout: process.stdout,
    stderr: process.stderr,
    reporters: options.reporters || [
      (options.fancy ?? !(isCI || isTest))
        ? new FancyReporter()
        : new BasicReporter(),
    ],
    ...options,
  });

  return relinka;
}

function _getDefaultLogLevel() {
  if (isDebug) {
    return LogLevels.debug;
  }
  if (isTest) {
    return LogLevels.warn;
  }
  return LogLevels.info;
}

/**
 * A default instance of Relinka, created and configured for immediate use.
 * This instance is configured based on the execution environment and the options provided.
 *
 * @type {RelinkaInstance} relinka - The default Relinka instance, ready to use.
 */
export const relinka = createRelinka();

export default relinka;
