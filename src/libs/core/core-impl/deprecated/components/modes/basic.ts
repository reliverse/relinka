import type { LogLevelDeprecated } from "~/libs/core/core-impl/deprecated/components/levels/levels.js";
import type { RelinkaInstanceDeprecated } from "~/libs/core/core-impl/deprecated/components/relinka-deprecated/relinka.js";
import type { RelinkaOptions } from "~/libs/core/core-types.js";

import { LogLevelsDeprecated } from "~/libs/core/core-impl/deprecated/components/levels/levels.js";
import { createRelinkaDeprecated as _createRelinkaDeprecated } from "~/libs/core/core-impl/deprecated/components/relinka-deprecated/relinka.js";
import { BasicReporter } from "~/libs/core/core-impl/deprecated/components/reporters/basic.js";

export * from "./shared.js";

/**
 * Factory function to create a new Relinka instance
 *
 * @param {Partial<RelinkaOptions & { fancy: boolean }>} [options={}] - Optional configuration options. See {@link RelinkaOptions}.
 * @returns {RelinkaInstanceDeprecated} A new Relinka instance configured with the given options.
 */
export function createRelinkaBaseDeprecated(
  options: Partial<RelinkaOptions & { fancy: boolean }> = {},
): RelinkaInstanceDeprecated {
  // Log level
  let level: LogLevelDeprecated = LogLevelsDeprecated.info;
  if (process.env.RELINKA_LEVEL) {
    level = Number.parseInt(process.env.RELINKA_LEVEL) ?? level;
  }

  // Create new relinka instance
  const relinka = _createRelinkaDeprecated({
    level,
    defaults: { level },
    stdout: process.stdout,
    stderr: process.stderr,
    reporters: options.reporters || [new BasicReporter()],
    ...options,
  });

  return relinka;
}

/**
 * Creates and exports a standard instance of Relinka with the default configuration.
 * This instance can be used directly for logging throughout the application.
 *
 * @type {RelinkaInstanceDeprecated} relinka - The default instance of Relinka.
 */
export const relinkaBasicDeprecated: RelinkaInstanceDeprecated =
  createRelinkaBaseDeprecated();
