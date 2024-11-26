import { relinka } from "./utils/index.js";

function foo() {
  console.info("console foo");
  process.stdout.write("called from stdout foo\n");
  process.stderr.write("called from stderr foo\n");
}

relinka.wrapStd();
foo();
relinka.restoreStd();
foo();
