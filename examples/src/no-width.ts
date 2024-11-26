import { createRelinka } from "~/main.js";

function main() {
  const relinka = createRelinka({
    formatOptions: { columns: 0 },
  });
  relinka.info("Foobar");
  const scoped = relinka.withTag("test");
  scoped.success("Foobar");
}

main();
