import { relinkaInstance } from "~/main.js";

relinkaInstance.error({
  message: "Foobar",
});

relinkaInstance.log({
  AAA: "BBB",
});

// relinkaInstance.log(relinka)

relinkaInstance.log("%d", 12);

relinkaInstance.error({ type: "CSSError", message: "Use scss" });

relinkaInstance.error(undefined, null, false, true, Number.NaN);

relinkaInstance.log("We can `monospace` keyword using grave accent character!");

relinkaInstance.log(
  "We can also _underline_ words but not_this or this should_not_be_underlined!",
);

// Nonstandard error
const { message, stack } = new Error("Custom Error!");
relinkaInstance.error({ message, stack });

// Circular object
const a = { foo: 1, bar: undefined as any };
a.bar = a;
relinkaInstance.log(a);

// Multiline
relinkaInstance.log("`Hello` the `JS`\n`World` and `Beyond`!");
