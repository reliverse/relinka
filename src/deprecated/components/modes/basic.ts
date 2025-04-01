import type { LogLevel } from "~/deprecated/components/levels/levels.js";
import type { RelinkaInstance } from "~/deprecated/components/relinka/relinka.js";
import type { RelinkaOptions } from "~/deprecated/types/mod.js";

import { LogLevels } from "~/deprecated/components/levels/levels.js";
import { createRelinka as _createRelinka } from "~/deprecated/components/relinka/relinka.js";
import { BasicReporter } from "~/deprecated/components/reporters/basic.js";

export * from "./shared.js";

/**
 * Factory function to create a new Relinka instance
 *
 * @param {Partial<RelinkaOptions & { fancy: boolean }>} [options={}] - Optional configuration options. See {@link RelinkaOptions}.
 * @returns {RelinkaInstance} A new Relinka instance configured with the given options.
 */
export function createRelinka(
  options: Partial<RelinkaOptions & { fancy: boolean }> = {},
): RelinkaInstance {
  // Log level
  let level: LogLevel = LogLevels.info;
  if (process.env.RELINKA_LEVEL) {
    level = Number.parseInt(process.env.RELINKA_LEVEL) ?? level;
  }

  // Create new relinka instance
  const relinka = _createRelinka({
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
 * @type {RelinkaInstance} relinka - The default instance of Relinka.
 */
export const relinkaBasic = createRelinka();

export default relinkaBasic;
