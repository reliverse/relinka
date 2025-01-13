import { relinkaInstance } from "~/main.js";

function main() {
  relinkaInstance.box(`I am the default banner`);

  relinkaInstance.box({
    title: "Box with options",
    message: `I am a banner with different options`,
    style: {
      padding: 1,
      borderColor: "magenta",
      borderStyle: "double-single-rounded",
    },
  });

  relinkaInstance.box({
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
