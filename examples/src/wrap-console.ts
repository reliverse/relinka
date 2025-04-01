import { relinkaInstanceDeprecated } from "~/libs/core/core-impl/deprecated/components/relinka-deprecated/mod.js";

function foo() {
  console.info("foo");
  console.warn("foo warn");
}

function _trace() {
  console.trace("foobar");
}
function trace() {
  _trace();
}

foo();
relinkaInstanceDeprecated.wrapConsole();
foo();
trace();
relinkaInstanceDeprecated.restoreConsole();
foo();
trace();
