import { relinkaInstanceDeprecated } from "~/libs/relinka/relinka-main.js";

const c1 = relinkaInstanceDeprecated.withTag("foo");
const c2 = relinkaInstanceDeprecated.withTag("bar");

relinkaInstanceDeprecated.log("before pause");

// @ts-expect-error TODO: fix ts
c2.pause();

c1.log("C1 is ready");
c2.log("C2 is ready");

setTimeout(() => {
  // @ts-expect-error TODO: fix ts
  relinkaInstanceDeprecated.resume();
  relinkaInstanceDeprecated.log("Yo!");
}, 1000);
