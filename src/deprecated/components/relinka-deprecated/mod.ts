import { isDebug, isTest, isCI } from "std-env";

import type { LogLevelDeprecated } from "~/deprecated/types.js";
import type {
  RelinkaOptionsDeprecated,
  RelinkaReporterDeprecated,
} from "~/deprecated/types.js";

import { LogLevelsDeprecated } from "~/deprecated/components/levels/levels.js";
import { BasicReporter } from "~/deprecated/components/reporters/basic.js";
import { FancyReporter } from "~/deprecated/components/reporters/fancy.js";

import type { RelinkaInstanceDeprecated } from "./relinka.js";

import { createRelinkaDeprecated as _createRelinkaDeprecated } from "./relinka.js";

export * from "~/deprecated/components/modes/shared.js";

/**
 * Factory function to create a new Relinka instance tailored for use in different environments.
 * It automatically adjusts logging levels based on environment variables and execution context.
 *
 * @param {Partial<RelinkaOptionsDeprecated & { fancy: boolean }>} [options={}] - Optional configuration options. See {@link RelinkaOptionsDeprecated}.
 * @returns {RelinkaInstanceDeprecated} A new Relinka instance with configurations based on the given options and the execution environment.
 */
export function createRelinkaSharedDeprecated(
  options: Partial<RelinkaOptionsDeprecated & { fancy: boolean }> = {},
): RelinkaInstanceDeprecated {
  // Log level
  let level = _getDefaultLogLevelDeprecated();
  if (process.env.RELINKA_LEVEL) {
    level = Number.parseInt(process.env.RELINKA_LEVEL) ?? level;
  }

  // Create new relinka instance
  const relinka = _createRelinkaDeprecated({
    level: level as LogLevelDeprecated,
    defaults: { level },
    stdout: process.stdout,
    stderr: process.stderr,
    reporters:
      options.reporters ||
      ([
        (options.fancy ?? !(isCI || isTest))
          ? new FancyReporter()
          : new BasicReporter(),
      ] as RelinkaReporterDeprecated[]),
    ...options,
  });

  return relinka;
}

function _getDefaultLogLevelDeprecated() {
  if (isDebug) {
    return LogLevelsDeprecated.debug;
  }
  if (isTest) {
    return LogLevelsDeprecated.warn;
  }
  return LogLevelsDeprecated.info;
}

/**
 * A default instance of Relinka, created and configured for immediate use.
 * This instance is configured based on the execution environment and the options provided.
 *
 * @type {RelinkaInstanceDeprecated} relinka - The default Relinka instance, ready to use.
 */
export const relinkaInstanceDeprecated: RelinkaInstanceDeprecated =
  createRelinkaSharedDeprecated();
