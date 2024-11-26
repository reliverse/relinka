import { relinka } from "./utils/index.js";

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
relinka.wrapConsole();
foo();
trace();
relinka.restoreConsole();
foo();
trace();
