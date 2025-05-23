import type { TreeItem } from "deprecated/utils/tree.js";

import { relinkaInstanceDeprecated } from "deprecated/components/relinka-deprecated/mod.js";
import { createRelinkaDeprecated } from "deprecated/components/relinka-deprecated/relinka.js";
import { formatTree } from "deprecated/utils/tree.js";

import { reporterDemo } from "./e-src-deprecated/utils/index.js";

async function detailedExample() {
  // TODO: implement relinkaInstanceDeprecated.clear
  // relinkaInstanceDeprecated.box("=== 🥷 you can't see me 🥷 ===");
  // relinkaInstanceDeprecated.clear(true);

  // box
  relinkaInstanceDeprecated.box("=== box ===");

  relinkaInstanceDeprecated.box(
    `Welcome to @reliverse/prompts! You're going to test an 'experimental' example.`,
  );

  relinkaInstanceDeprecated.box({
    title: "Box with options",
    message: `You'll see an example of errors, but it's not a real error 😉`,
    style: {
      padding: 1,
      borderColor: "magenta",
      borderStyle: "double-single-rounded",
    },
  });

  // reporter
  relinkaInstanceDeprecated.box("=== reporter 'basic' ===");
  reporterDemo({
    fancy: false,
  });
  relinkaInstanceDeprecated.box("=== reporter 'fancy' ===");
  reporterDemo({
    fancy: true,
  });

  relinkaInstanceDeprecated.box({
    title: "By the way",
    // message: `\`v1.0.2\` → \`v2.0.0\`\n\nRun \`npm install -g relinka\` to update`,
    message: `You can check '@reliverse/prompts' in the production usage\n\nJust run 'bunx -g reliverse@latest'`,
    style: {
      padding: 2,
      borderColor: "yellow",
      borderStyle: "rounded",
    },
  });

  // sleep
  relinkaInstanceDeprecated.start("Creating project...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  relinkaInstanceDeprecated.success("Project created!");

  // json
  relinkaInstanceDeprecated.box("=== json ===");

  const jsonRelinka = createRelinkaDeprecated({
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
  relinkaInstanceDeprecated.box("=== mock ===");

  function mockFn(type) {
    if (type === "info") {
      return function (this: { log: (msg: string) => void }) {
        this.log("(mocked fn with info tag)");
      };
    }
    return undefined;
  }

  relinkaInstanceDeprecated.info("before");
  relinkaInstanceDeprecated.mockTypes((type) => {
    if (type === "info") {
      return () => {
        relinkaInstanceDeprecated.log("(mocked fn with info tag)");
      };
    }
    return undefined;
  });

  relinkaInstanceDeprecated.mockTypes(mockFn);

  const tagged = relinkaInstanceDeprecated.withTag("newTag");

  relinkaInstanceDeprecated.log("log is not mocked!");

  relinkaInstanceDeprecated.info("Dont see me");
  tagged.info("Dont see me too");

  // no-width
  relinkaInstanceDeprecated.box("=== no-width ===");

  const noWidthRelinka = createRelinkaDeprecated({
    formatOptions: { columns: 0 },
  });
  noWidthRelinka.info("Foobar");
  const scoped = noWidthRelinka.withTag("test: no-width");
  scoped.success("Foobar");

  // with-width
  relinkaInstanceDeprecated.box("=== with-width ===");

  const withWidthRelinka = createRelinkaDeprecated({
    formatOptions: { columns: 10 },
  });
  withWidthRelinka.info("Foobar");
  const scopedWithWidth = withWidthRelinka.withTag("test: with-width");
  scopedWithWidth.success("Foobar");

  // pause
  relinkaInstanceDeprecated.box("=== pause ===");

  const c1 = relinkaInstanceDeprecated.withTag("foo");
  const c2 = relinkaInstanceDeprecated.withTag("bar");

  relinkaInstanceDeprecated.log("before pause");

  // @ts-expect-error TODO: fix ts
  c2.pause();

  c1.log("C1 is ready");
  c2.log("C2 is ready");

  setTimeout(() => {
    // @ts-expect-error TODO: fix ts
    relinkaInstanceDeprecated.resume();
    relinkaInstanceDeprecated.log("Yo!");
  }, 1000);

  // raw
  relinkaInstanceDeprecated.box("=== raw ===");

  relinkaInstanceDeprecated.log(
    'relinkaInstanceDeprecated.log({ message: "hello" })',
  );
  // Prints "hello"
  relinkaInstanceDeprecated.log({ message: "hello" });

  relinkaInstanceDeprecated.log(
    'relinkaInstanceDeprecated.log.raw({ message: "hello" })',
  );
  // Prints "{ message: 'hello' }"
  relinkaInstanceDeprecated.log.raw({ message: "hello" });

  // sample
  relinkaInstanceDeprecated.box("=== sample ===");

  relinkaInstanceDeprecated.warn(
    "A new version of relinka is available: 3.0.1",
  );
  relinkaInstanceDeprecated.error(
    new Error("This is an example error. Everything is fine!"),
  );
  relinkaInstanceDeprecated.info("Using relinka 3.0.0");
  relinkaInstanceDeprecated.start("Building project...");
  relinkaInstanceDeprecated.success("Project built!");

  // spam
  relinkaInstanceDeprecated.box("=== spam ===");

  function waitFor(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function spam({ count, delay }) {
    for (let i = 0; i < count; i++) {
      await waitFor(delay);
      relinkaInstanceDeprecated.log(
        `Spam (Count: ${count} Delay: ${delay} ms)`,
      );
    }
  }

  await (async () => {
    await spam({ count: 2, delay: 10 });
    await spam({ count: 20, delay: 10 });
    await spam({ count: 20, delay: 0 });
    await spam({ count: 80, delay: 10 });
  })();

  // special
  relinkaInstanceDeprecated.box("=== special ===");

  relinkaInstanceDeprecated.error({
    message: "Foobar",
  });

  relinkaInstanceDeprecated.log({
    AAA: "BBB",
  });

  // relinkaInstanceDeprecated.log(relinka)

  relinkaInstanceDeprecated.log("%d", 12);

  relinkaInstanceDeprecated.error({ type: "CSSError", message: "Use scss" });

  relinkaInstanceDeprecated.error(undefined, null, false, true, Number.NaN);

  relinkaInstanceDeprecated.log(
    "We can `monospace` keyword using grave accent character!",
  );

  relinkaInstanceDeprecated.log(
    "We can also _underline_ words but not_this or this should_not_be_underlined!",
  );

  // Nonstandard error
  const { message, stack } = new Error("Custom Error!");
  relinkaInstanceDeprecated.error({ message, stack });

  // Circular object
  const a = { foo: 1, bar: undefined as any };
  a.bar = a;
  relinkaInstanceDeprecated.log(a);

  // Multiline
  relinkaInstanceDeprecated.log("`Hello` the `JS`\n`World` and `Beyond`!");

  // spinner
  relinkaInstanceDeprecated.box("=== spinner ===");

  relinkaInstanceDeprecated.start("Creating project...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  relinkaInstanceDeprecated.success("Project created!");

  // tree
  relinkaInstanceDeprecated.box("=== tree ===");

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

  treeDemo();

  // wrap-all
  relinkaInstanceDeprecated.box("=== wrap-all ===");

  function fooWrapAll() {
    console.info("console foo");
    process.stderr.write("called from stderr\n");
  }

  relinkaInstanceDeprecated.wrapAll();
  fooWrapAll();
  relinkaInstanceDeprecated.restoreAll();
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
  relinkaInstanceDeprecated.wrapConsole();
  fooWrapConsole();
  trace();
  relinkaInstanceDeprecated.restoreConsole();
  fooWrapConsole();
  trace();

  // wrap-std
  relinkaInstanceDeprecated.box("=== wrap-std ===");

  function fooWrapStd() {
    console.info("console foo");
    process.stdout.write("called from stdout foo\n");
    process.stderr.write("called from stderr foo\n");
  }

  relinkaInstanceDeprecated.wrapStd();
  fooWrapStd();
  relinkaInstanceDeprecated.restoreStd();
  fooWrapStd();
}

await detailedExample().catch((error) => {
  console.error(error);
});
