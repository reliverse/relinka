import type { TreeItem } from "~/deprecated/utils/tree.js";

import { formatTree } from "~/deprecated/utils/tree.js";
import { relinkaInstance } from "~/main.js";

function main() {
  const keywords = [
    "console",
    "logger",
    "reporter",
    "elegant",
    "cli",
    "universal",
    "unified",
    "prompt",
    "clack",
    "format",
    "error",
    "stacktrace",
  ];

  relinkaInstance.log(formatTree(keywords));

  relinkaInstance.log(
    formatTree(keywords, {
      color: "cyan",
      prefix: "  |  ",
    }),
  );

  relinkaInstance.log(
    formatTree(
      [
        {
          text: "relinka",
          color: "green",
        },
        {
          text: "logger",
        },
      ].map(
        (item) =>
          ({
            text: ` ${item.text}`,
            color: item.color,
          }) as TreeItem,
      ),
      {
        color: "gray",
      },
    ),
  );

  // Deep tree
  relinkaInstance.log(
    formatTree([
      {
        text: "format",
        color: "red",
      },
      {
        text: "relinka",
        color: "yellow",
        children: [
          {
            text: "logger",
            color: "green",
            children: [
              {
                text: "reporter",
                color: "cyan",
              },
              {
                text: "test",
                color: "magenta",
                children: ["nice tree"],
              },
            ],
          },
          {
            text: "reporter",
            color: "bold",
          },
          "test",
        ],
      },
    ]),
  );
}

main();
