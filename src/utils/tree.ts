import { type ColorName, colorize } from "./color.js";

export type TreeItemObject = {
  /**
   * Text of the item
   */
  text: string;

  /**
   * Children of the item
   */
  children?: TreeItem[];

  /**
   * Color of the item
   */
  color?: ColorName;
};

export type TreeItem = string | TreeItemObject;

export type TreeOptions = {
  /**
   * Color of the tree
   */
  color?: ColorName;

  /**
   * Prefix of the tree
   *
   * @default "  "
   */
  prefix?: string;
};

/**
 * Formats a hierarchical list of items into a string representing a tree structure.
 * Each item in the tree can be a simple string or an object defining the text of the item,
 * optional children, and color. The tree structure can be customized with options
 * Specify the overall color and the prefix used for indentation and tree lines.
 *
 * @param {TreeItem[]} items - An array of items to include in the tree. Each item can be
 * either a string or an object with `text', `children' and `color' properties.
 * @param {TreeOptions} [options] - Optional settings to customize the appearance of the tree, including
 * the color of the tree text and the prefix for branches. See {@link TreeOptions}.
 * @returns {string} The formatted tree as a string, ready for printing to the console or elsewhere.
 */
export function formatTree(items: TreeItem[], options?: TreeOptions): string {
  options = {
    prefix: "  ",
    ...options,
  };

  const tree = _buildTree(items, options).join("");
  if (options?.color) {
    return colorize(options.color, tree);
  }

  return tree;
}

function _buildTree(items: TreeItem[], options?: TreeOptions): string[] {
  const chunks: string[] = [];

  const total = items.length - 1;
  for (let i = 0; i <= total; i++) {
    const item = items[i];
    const isLast = i === total;
    const prefix = isLast ? `${options?.prefix}└─` : `${options?.prefix}├─`;

    if (typeof item === "string") {
      chunks.push(`${prefix}${item}\n`);
    } else {
      const log = `${prefix}${item.text}\n`;
      chunks.push(item.color ? colorize(item.color, log) : log);

      if (item.children) {
        const _tree = _buildTree(item.children, {
          ...options,
          prefix: `${options?.prefix}${isLast ? "  " : "│  "}`,
        });
        chunks.push(..._tree);
      }
    }
  }

  return chunks;
}
