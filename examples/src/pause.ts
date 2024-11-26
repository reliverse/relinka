import { relinka } from "./utils/index.js";

const c1 = relinka.withTag("foo");
const c2 = relinka.withTag("bar");

relinka.log("before pause");

// @ts-expect-error TODO: fix ts
c2.pause();

c1.log("C1 is ready");
c2.log("C2 is ready");

setTimeout(() => {
  // @ts-expect-error TODO: fix ts
  relinka.resume();
  relinka.log("Yo!");
}, 1000);
