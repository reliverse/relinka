import { relinkaInstanceDeprecated } from "~/libs/core/core-impl/deprecated/components/relinka-deprecated/mod.js";

relinkaInstanceDeprecated.log(
  'relinkaInstanceDeprecated.log({ message: "hello" })',
);
// Prints "hello"
relinkaInstanceDeprecated.log({ message: "hello" });

relinkaInstanceDeprecated.log(
  'relinkaInstanceDeprecated.log.raw({ message: "hello" })',
);
// Prints "{ message: 'hello' }"
relinkaInstanceDeprecated.log.raw({ message: "hello" });
