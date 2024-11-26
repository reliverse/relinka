import type { Writable } from "stream";

import Differ from "ansi-diff-stream";
import esc from "ansi-escapes";
import chalk from "chalk";
import ui from "cli-styles";
import { EventEmitter } from "events";
import precision from "precision";
import stringWidth from "string-width";
import windowSize from "window-size";

import wrap from "~/utils/skeleton.js";

/**
 * Interface for RangePrompt options
 */
type RangePromptOptions = {
  hint?: string;
  marker?: string;
  bar?: string;
  values?: any[];
  value?: number | null;
  unit?: string;
  typed?: string;
  lastHit?: number;
  min?: number;
  max?: number;
  step?: number;
  size?: number;
};

/**
 * RangePrompt class extends EventEmitter to handle events
 */
export class RangePrompt extends EventEmitter {
  // Prompt properties
  hint: string;
  marker: string;
  bar: string;
  values: any[];
  value: number | null;
  unit: string;
  typed: string;
  lastHit: number;
  min: number;
  max: number;
  step: number;
  size: number;
  done: boolean;
  aborted: boolean;
  msg: string;
  initialValue: number | null;
  out: Writable;
  close: () => void;
  pause: () => void;
  resume: () => void;
  _: (input: string) => void; // Property for handling unknown input

  // Internal properties for managing listeners and state
  private stdin: NodeJS.ReadStream;
  private keyListener: (chunk: Buffer) => void;
  private cursorHidden: boolean;

  constructor(msg: string, options: RangePromptOptions = {}) {
    super();

    // Default options
    const defaults: Required<RangePromptOptions> = {
      hint: "– Use arrow keys or type a value.",
      marker: chalk.cyan.bold("●"),
      bar: "–",
      values: [],
      value: null,
      unit: "",
      typed: "",
      lastHit: 0,
      min: 0,
      max: 100,
      step: 1,
      size: windowSize.width,
    };

    // Merge defaults with user-provided options
    const opts = { ...defaults, ...options };

    // Initialize properties
    this.hint = opts.hint;
    this.marker = opts.marker;
    this.bar = opts.bar;
    this.values = opts.values;
    this.value = opts.value;
    this.unit = opts.unit;
    this.typed = opts.typed;
    this.lastHit = opts.lastHit;
    this.min = opts.min;
    this.max = opts.max;
    this.step = opts.step;
    this.size = opts.size;
    this.done = false;
    this.aborted = false;
    this.msg = msg;
    this.initialValue = this.value;
    this.out = process.stdout; // Initially Writable; will be reassigned to Differ

    // Internal properties
    this.stdin = process.stdin;
    this.keyListener = this.onKeyPress.bind(this);
    this.cursorHidden = false;

    // Placeholder for the close function (to be implemented)
    this.close = this._close.bind(this);

    // Bind methods to maintain 'this' context
    this.reset = this.reset.bind(this);
    this.abort = this.abort.bind(this);
    this.submit = this.submit.bind(this);
    this.up = this.up.bind(this);
    this.down = this.down.bind(this);
    this.handleNumericInput = this.handleNumericInput.bind(this);
    this.handleUnknownInput = this.handleUnknownInput.bind(this);
    this.render = this.render.bind(this);
    this.left = this.down.bind(this);
    this.right = this.up.bind(this);

    // Assign the unknown input handler to the '_' property
    this._ = this.handleUnknownInput;

    // Initialize the prompt (e.g., hide cursor, set raw mode, add listeners)
    this.initialize();
  }

  /**
   * Initializes the prompt by setting up listeners and terminal settings
   */
  private initialize(): void {
    // Hide the cursor
    this.out.write(esc.cursorHide);
    this.cursorHidden = true;

    // Set stdin to raw mode to capture keypresses
    if (this.stdin.isTTY) {
      this.stdin.setRawMode(true);
      this.stdin.resume();
    }

    // Add keypress listener
    this.stdin.on("data", this.keyListener);

    // Initial render
    this.render(true);
  }

  /**
   * Closes the prompt, restoring terminal settings and cleaning up
   */
  private _close(): void {
    // Remove keypress listener
    this.stdin.removeListener("data", this.keyListener);

    // Restore stdin to normal mode
    if (this.stdin.isTTY) {
      this.stdin.setRawMode(false);
      this.stdin.pause();
    }

    // Show the cursor if it was hidden
    if (this.cursorHidden) {
      this.out.write(esc.cursorShow);
      this.cursorHidden = false;
    }

    // If using Differ, end it
    if (this.out instanceof Differ) {
      this.out.end();
    }

    // Emit the 'close' event
    this.emit("close");
  }

  /**
   * Handles keypress events
   * @param chunk - The input buffer
   */
  private onKeyPress(chunk: Buffer): void {
    const key = chunk.toString();

    // Handle control sequences
    if (key === "\u0003") {
      // Ctrl+C
      this.abort();
      return;
    } else if (key === "\r" || key === "\n") {
      // Enter
      this.submit();
      return;
    } else if (key === "\u001B[A" || key === "\u001B[B") {
      // Arrow keys (Up/Down)
      if (key === "\u001B[A") {
        this.up();
      } else {
        this.down();
      }
      return;
    }

    // Handle numeric input
    if (isFloat.test(key)) {
      this.handleNumericInput(key);
    } else {
      this.handleUnknownInput(key);
    }
  }

  /**
   * Resets the prompt to its initial state
   */
  reset(): void {
    this.typed = "";
    this.value = this.initialValue;
    this.emit("change");
    this.render();
  }

  /**
   * Aborts the prompt
   */
  abort(): void {
    this.done = true;
    this.aborted = true;
    this.emit("abort");
    this.render();
    this.out.write("\n");
    this.close();
  }

  /**
   * Submits the current value
   */
  submit(): void {
    this.done = true;
    this.aborted = false;
    this.emit("submit");
    this.render();
    this.out.write("\n");
    this.close();
  }

  /**
   * Increases the value by the step
   */
  up(): void {
    this.typed = "";
    if (this.value !== null && this.value >= this.max) {
      this.bell();
      return;
    }
    if (this.value !== null) {
      this.value = +(this.value + this.step).toFixed(precision(this.step));
      // Ensure value does not exceed max
      if (this.value > this.max) {
        this.value = this.max;
      }
    }
    this.emit("change");
    this.render();
  }

  /**
   * Decreases the value by the step
   */
  down(): void {
    this.typed = "";
    if (this.value !== null && this.value <= this.min) {
      this.bell();
      return;
    }
    if (this.value !== null) {
      this.value = +(this.value - this.step).toFixed(precision(this.step));
      // Ensure value does not go below min
      if (this.value < this.min) {
        this.value = this.min;
      }
    }
    this.emit("change");
    this.render();
  }

  /**
   * Handles numeric input
   * @param n - The input character
   */
  handleNumericInput(n: string): void {
    if (!isFloat.test(n)) {
      this.bell();
      return;
    }

    const now = Date.now();
    if (now - this.lastHit > 1000) {
      this.typed = "";
    } // Reset if more than 1s elapsed
    this.typed += n;
    this.lastHit = now;

    const v = parseFloat(this.typed);
    if (isNaN(v)) {
      this.bell();
      return;
    }

    let newValue = v;
    if (newValue > this.max) {
      newValue = this.max;
    }
    if (newValue < this.min) {
      newValue = this.min;
    }

    this.value = newValue;
    this.emit("change");
    this.render();
  }

  /**
   * Handles unknown input
   * @param input - The input string
   */
  handleUnknownInput(input: string): void {
    // Define what to do with unknown inputs, possibly emit an event or handle gracefully
    this.bell();
  }

  /**
   * Renders the prompt to the output
   * @param first - Indicates if this is the first render
   */
  render(first = false): void {
    let out = "";
    if (first) {
      out += esc.cursorHide;
    } else {
      out += esc.eraseLines(2) + esc.cursorTo(0);
    }

    out +=
      [
        ui.symbol(this.done, this.aborted),
        chalk.bold(this.msg),
        ui.delimiter(this.done),
        this.value !== null ? this.value : "",
        chalk.gray(this.unit),
      ].join(" ") + "\n";

    const size =
      this.size -
      stringWidth(String(this.min)) -
      stringWidth(String(this.max)) -
      6;

    const barWidth = stringWidth(this.bar);
    const left = Math.round(
      ((size - barWidth) * (this.value !== null ? this.value : 0)) /
        (this.max - this.min),
    );
    const right = size - left - barWidth;

    const leftBar = this.bar.repeat(Math.max(0, Math.floor(left / barWidth)));
    const rightBar = this.bar.repeat(Math.max(0, Math.floor(right / barWidth)));

    out +=
      [
        "",
        this.min,
        chalk.gray(leftBar) + this.marker + chalk.gray(rightBar),
        this.max,
        "",
      ].join(" ") + "\n";

    this.out.write(out);
  }

  /**
   * Emits a bell sound to indicate an error or invalid action
   */
  bell(): void {
    this.out.write("\x07"); // ASCII Bell character
  }

  // Left and Right bindings
  left: () => void;
  right: () => void;
}

// Regular expression to check for float numbers (fixed unnecessary escape)
const isFloat = /^[0-9.]+$/;

/**
 * Function to create a new RangePrompt instance
 * @param msg - The message to display
 * @param opt - Optional configuration options
 * @returns Wrapped RangePrompt instance
 */
export const rangePrompt = (msg: string, opt?: RangePromptOptions) => {
  if (typeof msg !== "string") {
    throw new Error("Message must be string.");
  }
  if (Array.isArray(opt) || typeof opt !== "object") {
    opt = {};
  }

  const prompt = new RangePrompt(msg, opt);
  return wrap(prompt);
};

// Export rangePrompt as default and attach RangePrompt as a property
export default Object.assign(rangePrompt, { RangePrompt });
