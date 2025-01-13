import { relinkaInstance } from "~/main.js";

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
relinkaInstance.wrapConsole();
foo();
trace();
relinkaInstance.restoreConsole();
foo();
trace();
