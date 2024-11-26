import { relinka } from "./utils/index.js";

function main() {
  relinka.box(`I am the default banner`);

  relinka.box({
    title: "Box with options",
    message: `I am a banner with different options`,
    style: {
      padding: 1,
      borderColor: "magenta",
      borderStyle: "double-single-rounded",
    },
  });

  relinka.box({
    title: "Update available for `relinka`",
    message: `\`v1.0.2\` → \`v2.0.0\`\n\nRun \`npm install -g relinka\` to update`,
    style: {
      padding: 2,
      borderColor: "yellow",
      borderStyle: "rounded",
    },
  });
}

main();
