import { relinkaInstance } from "~/main.js";

function foo() {
  console.info("console foo");
  process.stdout.write("called from stdout foo\n");
  process.stderr.write("called from stderr foo\n");
}

relinkaInstance.wrapStd();
foo();
relinkaInstance.restoreStd();
foo();
