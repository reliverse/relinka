import { relinkaInstanceDeprecated } from "deprecated/components/relinka-deprecated/mod.js";

function main() {
  relinkaInstanceDeprecated.box("I am the default banner");

  relinkaInstanceDeprecated.box({
    title: "Box with options",
    message: "I am a banner with different options",
    style: {
      padding: 1,
      borderColor: "magenta",
      borderStyle: "double-single-rounded",
    },
  });

  relinkaInstanceDeprecated.box({
    title: "Update available for `relinka`",
    message: "`v1.0.2` → `v2.0.0`\n\nRun `npm install -g relinka` to update",
    style: {
      padding: 2,
      borderColor: "yellow",
      borderStyle: "rounded",
    },
  });
}

main();
