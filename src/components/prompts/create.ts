import { isDebug, isTest, isCI } from "std-env";

import type { RelinkaOptions } from "~/types/general.js";

import type { LogLevel } from "../../utils/constants.js";
import type { RelinkaInstance } from "./relinka.js";

import { LogLevels } from "../../utils/constants.js";
import { BasicReporter } from "../instance/reporter/basic.js";
import { FancyReporter } from "../instance/reporter/fancy.js";
import { createRelinka as _createRelinka } from "./relinka.js";

export * from "../instance/shared.js";

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
    prompt: (...args: [any]) =>
      import("~/components/mono/monoTwo.js").then((m) => m.prompt(...args)),
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
