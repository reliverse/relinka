import { relinkaInstanceDeprecated } from "deprecated/components/relinka-deprecated/mod.js";

function foo() {
  console.info("console foo");
  process.stdout.write("called from stdout foo\n");
  process.stderr.write("called from stderr foo\n");
}

relinkaInstanceDeprecated.wrapStd();
foo();
relinkaInstanceDeprecated.restoreStd();
foo();
