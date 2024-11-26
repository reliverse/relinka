import type { RelinkaOptions } from "~/types/general.js";

import { BrowserReporter } from "~/components/instance/reporter/browser.js";
import { createRelinka as _createRelinka } from "~/components/prompts/relinka.js";

export * from "~/components/instance/shared.js";

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
    prompt(message, options = {}) {
      if (options.type === "confirm") {
        return Promise.resolve(confirm(message) as any);
      }
      return Promise.resolve(prompt(message));
    },
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
