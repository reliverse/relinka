import { relinka } from "./utils/index.js";

function foo() {
  console.info("console foo");
  process.stderr.write("called from stderr\n");
}

relinka.wrapAll();
foo();
relinka.restoreAll();
foo();
