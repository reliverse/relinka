import { green, greenBright, red } from "picocolors";

export type ProgressBarOptions = {
  total: number; // Total units of work to complete
  width?: number; // Width of the progress bar
  completeChar?: string; // Character to represent completed progress
  incompleteChar?: string; // Character to represent incomplete progress
  format?: string; // Display format of the progress bar
  colorize?: boolean; // Whether to colorize the progress bar
};

export class ProgressBar {
  private total: number;
  private current: number;
  private width: number;
  private completeChar: string;
  private incompleteChar: string;
  private startTime: number;
  private format: string;
  private colorize: boolean;

  constructor(options: ProgressBarOptions) {
    if (options.total <= 0) {
      throw new Error("Total must be a positive number");
    }

    this.total = options.total;
    this.current = 0;
    this.width = options.width || 40;
    this.completeChar = options.completeChar || "█";
    this.incompleteChar = options.incompleteChar || "░";
    this.startTime = Date.now();
    this.format =
      options.format || "Progress: [:bar] :percent% | Elapsed: :elapsed s";
    this.colorize = options.colorize || false;
  }

  /**
   * Update the progress bar to a specific value.
   * @param value - The current progress value.
   */
  update(value: number) {
    const newValue = Math.min(value, this.total);
    if (newValue !== this.current) {
      this.current = newValue;
      this.render();
    }
  }

  /**
   * Increment the progress bar by a specific amount.
   * @param amount - The amount to increment.
   */
  increment(amount = 1) {
    this.update(this.current + amount);
  }

  /**
   * Render the progress bar in the console.
   */
  private render() {
    const percent = this.current / this.total;
    const filledLength = Math.round(this.width * percent);
    const emptyLength = this.width - filledLength;

    let bar =
      this.completeChar.repeat(filledLength) +
      this.incompleteChar.repeat(emptyLength);

    if (this.colorize) {
      bar =
        green(this.completeChar.repeat(filledLength)) +
        red(this.incompleteChar.repeat(emptyLength));
    }

    const percentage = (percent * 100).toFixed(2);
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const eta =
      percent > 0
        ? ((Date.now() - this.startTime) / percent / 1000).toFixed(2)
        : "N/A";

    const output = this.format
      .replace(":bar", bar)
      .replace(":percent", percentage)
      .replace(":elapsed", elapsed)
      .replace(":eta", eta);

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(greenBright("◆") + "  " + output);

    if (this.current >= this.total) {
      process.stdout.write("\n");
    }
  }
}
