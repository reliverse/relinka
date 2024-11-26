import type { ColorName, Variant } from "~/types/general.js";

import { colorMap } from "./mapping.js";

export const variantMap = {
  // box: createBox,
  doubleBox: createDoubleBox,
  // banner: createBanner,
  // underline: createUnderline,
};

export async function applyVariant(
  lines: string[] | string,
  variant?: Variant,
  options?: { limit?: number },
  borderColor?: ColorName,
): Promise<string> {
  const linesArray = Array.isArray(lines) ? lines : [lines];

  switch (variant) {
    // case "box":
    //   return createBox(linesArray, options?.limit);
    case "doubleBox":
      return createDoubleBox(linesArray, options?.limit, borderColor);
    // case "banner":
    //   return createBanner(linesArray);
    // case "underline":
    //   return createUnderline(linesArray);
    default:
      return linesArray.join("\n");
  }
}

// function createBox(lines: string[], limit?: number): string {
//   const processedLines = processLines(lines, limit);
//   const maxLength = Math.max(...processedLines.map((line) => line.length));
//   const topBorder = `┌${"─".repeat(maxLength + 2)}┐`;
//   const bottomBorder = `└${"─".repeat(maxLength + 2)}┘`;
//   const middle = processedLines
//     .map((line) => `│ ${line.padEnd(maxLength)} │`)
//     .join("\n");
//   return `${topBorder}\n${middle}\n${bottomBorder}`;
// }

function createDoubleBox(
  lines: string[],
  limit?: number,
  borderColor?: ColorName,
): string {
  const processedLines = processLines(lines, limit);
  const maxLength = Math.max(...processedLines.map((line) => line.length));
  const indentation = "";

  if (borderColor === undefined) {
    borderColor = "viceGradient";
  }

  const topBorder = borderColor
    ? colorMap[borderColor](`${"═".repeat(maxLength)}╗`)
    : `${"═".repeat(maxLength)}╗`;
  const bottomBorder = borderColor
    ? colorMap[borderColor](`${indentation}╚${"═".repeat(maxLength + 2)}╝`)
    : `${indentation}╚${"═".repeat(maxLength + 2)}╝`;

  const middle = processedLines
    .map((line, index) => {
      const lineIndentation = index === 0 ? indentation : indentation + "  ";
      return `${lineIndentation}${borderColor ? colorMap[borderColor]("║") : "║"} ${colorMap[borderColor](line.padEnd(maxLength))} ${borderColor ? colorMap[borderColor]("║") : "║"}`;
    })
    .join("\n");

  return `${topBorder}\n${middle}\n${bottomBorder}`;
}

// function createBanner(lines: string[]): string {
//   const text = lines.join(" ");
//   const bannerLine = "*".repeat(text.length + 4);
//   return `${bannerLine}\n* ${text} *\n${bannerLine}`;
// }

// function createUnderline(lines: string[]): string {
//   return lines.map((line) => `${line}\n${"=".repeat(line.length)}`).join("\n");
// }

function processLines(lines: string[] | string, limit?: number): string[] {
  const linesArray = Array.isArray(lines) ? lines : [lines];

  return linesArray.map((line) => {
    let truncatedLine = line;
    if (limit && line.length > limit) {
      truncatedLine = `${line.slice(0, limit - 3)}...`;
    }
    return truncatedLine.padEnd(limit || truncatedLine.length);
  });
}
