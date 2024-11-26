import { BrowserReporter } from "~/components/reporters/browser.js";
import { createRelinka as _createRelinka } from "~/components/relinka/relinka.js";
import type { RelinkaOptions } from "~/types/mod.js";

export * from "./shared.js";

/**
 * Creates a new Relinka instance configured specifically for browser environments.
 * This function sets up default reporters and a prompt method tailored to the browser's dialogue APIs.
 *
 * @param {Partial<RelinkaOptions>} [options={}] - Optional configuration options.
 * The options can override the default reporter and prompt behavior. See {@link RelinkaOptions}.
 * @returns {RelinkaInstance} A new Relinka instance optimized for use in browser environments.
 */
export function createRelinka(options: Partial<RelinkaOptions> = {}) {
  const relinka = _createRelinka({
    reporters: options.reporters || [new BrowserReporter({})],
    ...options,
  });
  return relinka;
}

/**
 * A standard Relinka instance created with browser-specific configurations.
 * This instance can be used throughout a browser-based project.
 *
 * @type {RelinkaInstance} relinka - The default browser-configured Relinka instance.
 */
export const relinka = createRelinka();

export default relinka;
