import { relinkaInstance } from "~/main.js";

function foo() {
  console.info("console foo");
  process.stderr.write("called from stderr\n");
}

relinkaInstance.wrapAll();
foo();
relinkaInstance.restoreAll();
foo();
