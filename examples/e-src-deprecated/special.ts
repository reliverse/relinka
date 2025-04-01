import { relinkaInstanceDeprecated } from "~/libs/relinka/relinka-main.js";

relinkaInstanceDeprecated.error({
  message: "Foobar",
});

relinkaInstanceDeprecated.log({
  AAA: "BBB",
});

// relinkaInstanceDeprecated.log(relinka)

relinkaInstanceDeprecated.log("%d", 12);

relinkaInstanceDeprecated.error({ type: "CSSError", message: "Use scss" });

relinkaInstanceDeprecated.error(undefined, null, false, true, Number.NaN);

relinkaInstanceDeprecated.log(
  "We can `monospace` keyword using grave accent character!",
);

relinkaInstanceDeprecated.log(
  "We can also _underline_ words but not_this or this should_not_be_underlined!",
);

// Nonstandard error
const { message, stack } = new Error("Custom Error!");
relinkaInstanceDeprecated.error({ message, stack });

// Circular object
const a = { foo: 1, bar: undefined as any };
a.bar = a;
relinkaInstanceDeprecated.log(a);

// Multiline
relinkaInstanceDeprecated.log("`Hello` the `JS`\n`World` and `Beyond`!");
