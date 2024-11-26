import type { Prettify } from "~/types/index.js";

import { lines, type Layout } from "./lines.js";
import { finite, infinite } from "./position.js";
import { type Theme } from "./theme.js";
import { useRef } from "./use-ref.js";
import { readlineWidth } from "./utils.js";

export function usePagination<T>({
  items,
  active,
  renderItem,
  pageSize,
  loop = true,
}: {
  items: readonly T[];
  /** The index of the active item. */
  active: number;
  /** Renders an item as part of a page. */
  renderItem: (layout: Prettify<Layout<T>>) => string;
  /** The size of the page. */
  pageSize: number;
  /** Allows creating an infinitely looping list. `true` if unspecified. */
  loop?: boolean;
  theme?: Theme;
}): string {
  const state = useRef({ position: 0, lastActive: 0 });

  const position = loop
    ? infinite({
        active,
        lastActive: state.current.lastActive,
        total: items.length,
        pageSize,
        pointer: state.current.position,
      })
    : finite({
        active,
        total: items.length,
        pageSize,
      });

  state.current.position = position;
  state.current.lastActive = active;

  return lines({
    items,
    width: readlineWidth(),
    renderItem,
    active,
    position,
    pageSize,
  }).join("\n");
}
