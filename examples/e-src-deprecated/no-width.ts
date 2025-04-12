import { createRelinkaDeprecated } from "~/main.js";

function main() {
  const relinkaWrapper = createRelinkaDeprecated({
    formatOptions: { columns: 0 },
  });
  relinkaWrapper.info("Foobar");
  const scoped = relinkaWrapper.withTag("test");
  scoped.success("Foobar");
}

main();
