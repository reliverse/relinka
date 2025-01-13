import { relinkaInstance } from "~/main.js";

const c1 = relinkaInstance.withTag("foo");
const c2 = relinkaInstance.withTag("bar");

relinkaInstance.log("before pause");

// @ts-expect-error TODO: fix ts
c2.pause();

c1.log("C1 is ready");
c2.log("C2 is ready");

setTimeout(() => {
  // @ts-expect-error TODO: fix ts
  relinkaInstance.resume();
  relinkaInstance.log("Yo!");
}, 1000);
