import { relinkaInstanceDeprecated } from "~/libs/core/core-impl/deprecated/components/relinka-deprecated/mod.js";

function foo() {
  console.info("console foo");
  process.stderr.write("called from stderr\n");
}

relinkaInstanceDeprecated.wrapAll();
foo();
relinkaInstanceDeprecated.restoreAll();
foo();
