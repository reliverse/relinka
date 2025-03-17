import type { TreeItem } from "~/utils/tree.js";

import {
  relinkaInstance,
  createRelinka,
} from "~/deprecated/components/relinka/mod.js";
import { formatTree } from "~/utils/tree.js";

import { reporterDemo } from "./src/utils/index.js";

async function detailedExample() {
  // TODO: implement relinkaInstance.clear
  // relinkaInstance.box("=== 🥷 you can't see me 🥷 ===");
  // relinkaInstance.clear(true);

  // box
  relinkaInstance.box("=== box ===");

  relinkaInstance.box(
    `Welcome to @reliverse/prompts! You're going to test an 'experimental' example.`,
  );

  relinkaInstance.box({
    title: "Box with options",
    message: `You'll see an example of errors, but it's not a real error 😉`,
    style: {
      padding: 1,
      borderColor: "magenta",
      borderStyle: "double-single-rounded",
    },
  });

  // reporter
  relinkaInstance.box("=== reporter 'basic' ===");
  reporterDemo({
    fancy: false,
  });
  relinkaInstance.box("=== reporter 'fancy' ===");
  reporterDemo({
    fancy: true,
  });

  relinkaInstance.box({
    title: "By the way",
    // message: `\`v1.0.2\` → \`v2.0.0\`\n\nRun \`npm install -g relinka\` to update`,
    message: `You can check \`@reliverse/prompts\` in the production usage\n\nJust run \`bunx -g reliverse@latest\``,
    style: {
      padding: 2,
      borderColor: "yellow",
      borderStyle: "rounded",
    },
  });

  // sleep
  relinkaInstance.start("Creating project...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  relinkaInstance.success("Project created!");

  // json
  relinkaInstance.box("=== json ===");

  const jsonRelinka = createRelinka({
    reporters: [
      {
        log: (logObj) => {
          console.log(JSON.stringify(logObj));
        },
      },
    ],
  });

  jsonRelinka.log("foo bar");

  // mock
  relinkaInstance.box("=== mock ===");

  function mockFn(type) {
    if (type === "info") {
      return function (this: { log: (msg: string) => void }) {
        this.log("(mocked fn with info tag)");
      };
    }
    return undefined;
  }

  relinkaInstance.info("before");
  relinkaInstance.mockTypes((type) => {
    if (type === "info") {
      return () => {
        relinkaInstance.log("(mocked fn with info tag)");
      };
    }
    return undefined;
  });

  relinkaInstance.mockTypes(mockFn);

  const tagged = relinkaInstance.withTag("newTag");

  relinkaInstance.log("log is not mocked!");

  relinkaInstance.info("Dont see me");
  tagged.info("Dont see me too");

  // no-width
  relinkaInstance.box("=== no-width ===");

  const noWidthRelinka = createRelinka({
    formatOptions: { columns: 0 },
  });
  noWidthRelinka.info("Foobar");
  const scoped = noWidthRelinka.withTag("test: no-width");
  scoped.success("Foobar");

  // with-width
  relinkaInstance.box("=== with-width ===");

  const withWidthRelinka = createRelinka({
    formatOptions: { columns: 10 },
  });
  withWidthRelinka.info("Foobar");
  const scopedWithWidth = withWidthRelinka.withTag("test: with-width");
  scopedWithWidth.success("Foobar");

  // pause
  relinkaInstance.box("=== pause ===");

  const c1 = relinkaInstance.withTag("foo");
  const c2 = relinkaInstance.withTag("bar");

  relinkaInstance.log("before pause");

  // @ts-expect-error TODO: fix ts
  c2.pause();

  c1.log("C1 is ready");
  c2.log("C2 is ready");

  setTimeout(() => {
    // @ts-expect-error TODO: fix ts
    relinkaInstance.resume();
    relinkaInstance.log("Yo!");
  }, 1000);

  // raw
  relinkaInstance.box("=== raw ===");

  relinkaInstance.log('relinkaInstance.log({ message: "hello" })');
  // Prints "hello"
  relinkaInstance.log({ message: "hello" });

  relinkaInstance.log('relinkaInstance.log.raw({ message: "hello" })');
  // Prints "{ message: 'hello' }"
  relinkaInstance.log.raw({ message: "hello" });

  // sample
  relinkaInstance.box("=== sample ===");

  relinkaInstance.warn("A new version of relinka is available: 3.0.1");
  relinkaInstance.error(
    new Error("This is an example error. Everything is fine!"),
  );
  relinkaInstance.info("Using relinka 3.0.0");
  relinkaInstance.start("Building project...");
  relinkaInstance.success("Project built!");

  // spam
  relinkaInstance.box("=== spam ===");

  function waitFor(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function spam({ count, delay }) {
    for (let i = 0; i < count; i++) {
      await waitFor(delay);
      relinkaInstance.log(`Spam (Count: ${count} Delay: ${delay} ms)`);
    }
  }

  await (async () => {
    await spam({ count: 2, delay: 10 });
    await spam({ count: 20, delay: 10 });
    await spam({ count: 20, delay: 0 });
    await spam({ count: 80, delay: 10 });
  })();

  // special
  relinkaInstance.box("=== special ===");

  relinkaInstance.error({
    message: "Foobar",
  });

  relinkaInstance.log({
    AAA: "BBB",
  });

  // relinkaInstance.log(relinka)

  relinkaInstance.log("%d", 12);

  relinkaInstance.error({ type: "CSSError", message: "Use scss" });

  relinkaInstance.error(undefined, null, false, true, Number.NaN);

  relinkaInstance.log(
    "We can `monospace` keyword using grave accent character!",
  );

  relinkaInstance.log(
    "We can also _underline_ words but not_this or this should_not_be_underlined!",
  );

  // Nonstandard error
  const { message, stack } = new Error("Custom Error!");
  relinkaInstance.error({ message, stack });

  // Circular object
  const a = { foo: 1, bar: undefined as any };
  a.bar = a;
  relinkaInstance.log(a);

  // Multiline
  relinkaInstance.log("`Hello` the `JS`\n`World` and `Beyond`!");

  // spinner
  relinkaInstance.box("=== spinner ===");

  relinkaInstance.start("Creating project...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  relinkaInstance.success("Project created!");

  // tree
  relinkaInstance.box("=== tree ===");

  function treeDemo() {
    const keywords = [
      "console",
      "logger",
      "reporter",
      "elegant",
      "cli",
      "universal",
      "unified",
      "prompt",
      "prompts",
      "reliverse",
      "relinka",
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

  treeDemo();

  // wrap-all
  relinkaInstance.box("=== wrap-all ===");

  function fooWrapAll() {
    console.info("console foo");
    process.stderr.write("called from stderr\n");
  }

  relinkaInstance.wrapAll();
  fooWrapAll();
  relinkaInstance.restoreAll();
  fooWrapAll();

  // wrap-console

  function fooWrapConsole() {
    console.info("foo");
    console.warn("foo warn");
  }

  function _trace() {
    console.trace("foobar");
  }
  function trace() {
    _trace();
  }

  fooWrapConsole();
  relinkaInstance.wrapConsole();
  fooWrapConsole();
  trace();
  relinkaInstance.restoreConsole();
  fooWrapConsole();
  trace();

  // wrap-std
  relinkaInstance.box("=== wrap-std ===");

  function fooWrapStd() {
    console.info("console foo");
    process.stdout.write("called from stdout foo\n");
    process.stderr.write("called from stderr foo\n");
  }

  relinkaInstance.wrapStd();
  fooWrapStd();
  relinkaInstance.restoreStd();
  fooWrapStd();
}

await detailedExample().catch((error) => {
  console.error(error);
});
