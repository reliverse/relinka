import {
  re,
  colorize,
  getColor,
  setColorLevel,
  rgb,
  colorSupport,
} from "@reliverse/relico";

// Print color support information
console.log("Color Support Info:");
console.log(re.cyan("Terminal: " + colorSupport.terminalName));
console.log(re.green("Colors Supported: " + colorSupport.isColorSupported));
console.log(re.yellow("Colors Forced: " + colorSupport.isForced));
console.log(re.red("Colors Disabled: " + colorSupport.isDisabled));
console.log();

// Basic color examples
console.log("Basic Colors:");
console.log(re.red("This is red text"));
console.log(re.blue("This is blue text"));
console.log(re.green("This is green text"));
console.log(re.yellow("This is yellow text"));
console.log();

// Style examples
console.log("Text Styles:");
console.log(re.bold("This is bold text"));
console.log(re.dim("This is dim text"));
console.log(re.italic("This is italic text"));
console.log(re.underline("This is underlined text"));
console.log();

// Nested colors and styles
console.log("Nested Styles:");
console.log(re.red(re.bold("Bold red text")));
console.log(re.blue(re.underline("Underlined blue text")));
console.log(re.green(re.italic("Italic green text")));
console.log();

// Background colors
console.log("Background Colors:");
console.log(re.bgRed("Text with red background"));
console.log(re.bgBlue("Text with blue background"));
console.log(re.bgGreen("Text with green background"));
console.log();

// Bright colors
console.log("Bright Colors:");
console.log(re.redBright("Bright red text"));
console.log(re.blueBright("Bright blue text"));
console.log(re.greenBright("Bright green text"));
console.log();

// Using colorize function
console.log("Using colorize():");
console.log(colorize("magenta", "This is magenta using colorize()"));
console.log(colorize("cyan", "This is cyan using colorize()"));
console.log();

// Using getColor function
console.log("Using getColor():");
const redColor = getColor("red");
const blueColor = getColor("blue");
console.log(redColor("This is red using getColor()"));
console.log(blueColor("This is blue using getColor()"));
console.log();

// Custom RGB colors (requires level 3 support)
console.log("Custom RGB Colors (requires level 3 support):");
setColorLevel(3);
const salmon = rgb(250, 128, 114);
const turquoise = rgb(64, 224, 208);
const gold = rgb(255, 215, 0);
console.log(salmon("This is salmon colored text"));
console.log(turquoise("This is turquoise colored text"));
console.log(gold("This is gold colored text"));
console.log();

// Demonstrate color levels
console.log("Color Level Examples:");
console.log("Level 3 (True Color):");
setColorLevel(3);
console.log(re.red("This should be colored"));

console.log("\nLevel 0 (No Color):");
setColorLevel(0);
console.log(re.red("This should NOT be colored"));

console.log("\nBack to Level 3:");
setColorLevel(3);
console.log(re.red("Colors working again!"));
