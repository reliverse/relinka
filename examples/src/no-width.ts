import { createRelinka } from "~/deprecated/components/relinka/mod.js";

function main() {
  const relinkaWrapper = createRelinka({
    formatOptions: { columns: 0 },
  });
  relinkaWrapper.info("Foobar");
  const scoped = relinkaWrapper.withTag("test");
  scoped.success("Foobar");
}

main();
