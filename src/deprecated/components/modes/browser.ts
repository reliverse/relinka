import type { RelinkaOptionsDeprecated } from "~/deprecated/types.js";

import {
  createRelinkaDeprecated as _createRelinkaDeprecated,
  type RelinkaInstanceDeprecated,
} from "~/deprecated/components/relinka-deprecated/relinka.js";
import { BrowserReporter } from "~/deprecated/components/reporters/browser.js";

export * from "./shared.js";

/**
 * Creates a new Relinka instance configured specifically for browser environments.
 * This function sets up default reporters and a prompt method tailored to the browser's dialogue APIs.
 *
 * @param {Partial<RelinkaOptionsDeprecated>} [options={}] - Optional configuration options.
 * The options can override the default reporter and prompt behavior. See {@link RelinkaOptionsDeprecated}.
 * @returns {RelinkaInstanceDeprecated} A new Relinka instance optimized for use in browser environments.
 */
export function createRelinkaBrowserDeprecatedDeprecated(
  options: Partial<RelinkaOptionsDeprecated> = {},
) {
  const relinka = _createRelinkaDeprecated({
    reporters: options.reporters || [new BrowserReporter({})],
    ...options,
  });
  return relinka;
}

/**
 * A standard Relinka instance created with browser-specific configurations.
 * This instance can be used throughout a browser-based project.
 *
 * @type {RelinkaInstanceDeprecated} relinka - The default browser-configured Relinka instance.
 */
export const relinkaBrowserDeprecated: RelinkaInstanceDeprecated =
  createRelinkaBrowserDeprecatedDeprecated();
