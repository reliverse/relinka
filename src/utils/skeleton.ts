import type Differ from "ansi-diff-stream";
import type { Writable } from "stream";

import differ from "ansi-diff-stream";
import esc from "ansi-escapes";
import windowSize from "window-size";

import type { RangePrompt } from "~/components/range/range.js";
import type { Keypress } from "~/types/keypress.js";

import listenForKeys from "~/utils/keypress.js";

/**
 * Action mapping based on keypress
 */
export const action = (key: Keypress): string | false => {
  const code = key.raw.charCodeAt(0);

  if (key.ctrl) {
    if (key.name === "a") {
      return "first";
    }
    if (key.name === "c") {
      return "abort";
    }
    if (key.name === "d") {
      return "abort";
    }
    if (key.name === "e") {
      return "last";
    }
    if (key.name === "g") {
      return "reset";
    }
  }
  if (key.name === "return") {
    return "submit";
  }
  if (key.name === "enter") {
    return "submit";
  } // ctrl + J
  if (key.name === "backspace") {
    return "delete";
  }
  if (key.name === "abort") {
    return "abort";
  }
  if (key.name === "escape") {
    return "abort";
  }
  if (key.name === "tab") {
    return "next";
  }

  if (key.name === "up") {
    return "up";
  }
  if (key.name === "down") {
    return "down";
  }
  if (key.name === "right") {
    return "right";
  }
  if (key.name === "left") {
    return "left";
  }
  if (code === 8747) {
    return "left";
  } // alt + B
  if (code === 402) {
    return "right";
  } // alt + F

  return false;
};

/**
 * Handles window resize events
 */
const onResize = (stream: Writable, cb: () => void): (() => void) => {
  stream.on("resize", cb);
  const stopListening = () => {
    stream.removeListener("resize", cb);
  };
  return stopListening;
};

/**
 * Interface for the wrapped RangePrompt
 */
type WrappedRangePrompt = {
  out: ReturnType<typeof differ>;
  _: (input: string) => void;
  bell: () => void;
  pause: () => void;
  resume: () => void;
  close: () => void;
} & RangePrompt;

/**
 * Wrap function to enhance RangePrompt with additional functionality
 * @param p - The RangePrompt instance
 * @returns A Promise that resolves or rejects based on user interaction
 */
const wrap = (p: RangePrompt): Promise<number | null> => {
  const wrappedPrompt = p as WrappedRangePrompt;

  // Initialize ansi-diff-stream
  wrappedPrompt.out = differ();
  wrappedPrompt.out.pipe(process.stdout);

  // Define the bell method
  wrappedPrompt.bell = () => {
    process.stdout.write(esc.beep);
  };

  // Fallback for the '_' method
  if (typeof wrappedPrompt._ !== "function") {
    wrappedPrompt._ = wrappedPrompt.bell;
  }

  /**
   * Handle keypress events
   * @param key - The keypress event
   */
  const onKey = (key: Keypress) => {
    const a = action(key);
    if (a === "abort") {
      return wrappedPrompt.close();
    }
    if (a === false) {
      return wrappedPrompt._(key.raw);
    }
    if (typeof wrappedPrompt[a] === "function") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      (wrappedPrompt[a] as Function)(key);
    } else {
      wrappedPrompt.bell();
    }
  };

  /**
   * Handle window resize events
   */
  const onNewSize = () => {
    const { width, height } = windowSize;
    wrappedPrompt.out.reset(); // Now valid as 'out' is Differ
    wrappedPrompt.render(true);
  };

  // Initialize listeners
  let offKeypress: (() => void) | null = null;
  let offResize: (() => void) | null = null;

  /**
   * Pause the prompt by removing listeners and showing the cursor
   */
  const pause = () => {
    if (!offKeypress) {
      return;
    }
    offKeypress();
    offKeypress = null;
    if (offResize) {
      offResize();
      offResize = null;
    }
    process.stdout.write(esc.cursorShow);
  };

  /**
   * Resume the prompt by adding listeners and hiding the cursor
   */
  const resume = () => {
    if (offKeypress) {
      return;
    }
    offKeypress = listenForKeys(process.stdin, onKey);
    offResize = onResize(process.stdout, onNewSize);
    process.stdout.write(esc.cursorHide);
  };

  wrappedPrompt.pause = pause;
  wrappedPrompt.resume = resume;

  // Return a Promise that resolves or rejects based on user action
  return new Promise<number | null>((resolve, reject) => {
    let isClosed = false;

    /**
     * Close the prompt and resolve or reject the Promise
     */
    wrappedPrompt.close = () => {
      if (isClosed) {
        return;
      }
      isClosed = true;

      wrappedPrompt.out.unpipe(process.stdout); // Now valid as 'out' is Differ
      pause();

      if (wrappedPrompt.aborted) {
        reject(new Error("Prompt aborted")); // Reject with an Error object
      } else {
        resolve(wrappedPrompt.value);
      }
    };

    // Ensure the prompt is closed on process exit
    process.on("beforeExit", () => wrappedPrompt.close());

    // Fallback for submit method
    if (typeof wrappedPrompt.submit !== "function") {
      wrappedPrompt.submit = wrappedPrompt.close;
    }

    // Start listening for events
    resume();
    wrappedPrompt.render(true);
  });
};

export default Object.assign(wrap, { action });
