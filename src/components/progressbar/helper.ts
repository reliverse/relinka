import { msg } from "~/utils/messages.js";

import type { ProgressBarOptions } from "./ProgressBar.js";

import { ProgressBar } from "./ProgressBar.js";

/**
 * Options for the progressbar helper function.
 */
export type ProgressBarTaskOptions = ProgressBarOptions & {
  /**
   * The amount to increment the progress bar each step.
   * @default 1
   */
  increment?: number;

  /**
   * Desired total time for the progress bar to complete in milliseconds.
   * @default 3000
   */
  desiredTotalTime?: number;
};

/**
 * Displays a progress bar that completes based on the provided options.
 * @param options - Configuration options for the progress bar.
 * @returns A promise that resolves when the progress bar completes.
 */
export async function progressbar(
  options: ProgressBarTaskOptions,
): Promise<void> {
  const {
    total,
    increment = 1,
    desiredTotalTime = 3000,
    ...progressBarOptions
  } = options;

  if (increment <= 0) {
    throw new Error("Increment must be a positive number");
  }

  const iterations = Math.ceil(total / increment) + 1;
  const delay = desiredTotalTime / iterations;

  const progressBar = new ProgressBar({
    total,
    ...progressBarOptions,
  });

  try {
    for (let i = 0; i <= total; i += increment) {
      progressBar.update(i);
      await sleep(delay);
    }

    // Ensure the progress bar completes if not already
    if (total % increment !== 0) {
      progressBar.update(total);
    }
  } catch (error) {
    console.error("Progress bar encountered an error:", error);
  }

  // New line
  msg({
    type: "M_MIDDLE",
    title: "",
    borderColor: "viceGradient",
  });
}

/**
 * Sleep for a specified number of milliseconds.
 * @param ms - Milliseconds to sleep.
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
