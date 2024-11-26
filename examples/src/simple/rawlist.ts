import * as url from "node:url";

import { rawlist, Separator } from "~/components/prompts/index.js";

const demo = async () => {
  let answer;

  answer = await rawlist({
    message: "(no keys) Conflict on `file.js`:",
    choices: [
      {
        // @ts-expect-error TODO: fix ts
        name: "Overwrite",
        value: "overwrite",
      },
      {
        // @ts-expect-error TODO: fix ts
        name: "Overwrite this one and all next",
        value: "overwrite_all",
      },
      {
        // @ts-expect-error TODO: fix ts
        name: "Show diff",
        value: "diff",
      },
      new Separator(),
      {
        // @ts-expect-error TODO: fix ts
        name: "Abort",
        value: "abort",
      },
    ],
  });
  console.log("Answer:", answer);

  answer = await rawlist({
    message: "(with keys) Conflict on `file.js`:",
    choices: [
      {
        // @ts-expect-error TODO: fix ts
        key: "y",
        name: "Overwrite",
        value: "overwrite",
      },
      {
        // @ts-expect-error TODO: fix ts
        key: "a",
        name: "Overwrite this one and all next",
        value: "overwrite_all",
      },
      {
        // @ts-expect-error TODO: fix ts
        key: "d",
        name: "Show diff",
        value: "diff",
      },
      new Separator(),
      {
        // @ts-expect-error TODO: fix ts
        key: "x",
        name: "Abort",
        value: "abort",
      },
    ],
  });
  console.log("Answer:", answer);
};

if (import.meta.url.startsWith("file:")) {
  const modulePath = url.fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    await demo();
  }
}

export default demo;
