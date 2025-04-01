import type { TreeItem } from "~/libs/relinka/relinka-impl/deprecated/utils/tree.js";

import { relinkaInstanceDeprecated } from "~/libs/relinka/relinka-impl/deprecated/components/relinka-deprecated/mod.js";
import { formatTree } from "~/libs/relinka/relinka-impl/deprecated/utils/tree.js";

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

  relinkaInstanceDeprecated.log(formatTree(keywords));

  relinkaInstanceDeprecated.log(
    formatTree(keywords, {
      color: "cyan",
      prefix: "  |  ",
    }),
  );

  relinkaInstanceDeprecated.log(
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
  relinkaInstanceDeprecated.log(
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
