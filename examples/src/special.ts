import { relinka } from "./utils/index.js";

relinka.error({
  message: "Foobar",
});

relinka.log({
  AAA: "BBB",
});

// relinka.log(relinka)

relinka.log("%d", 12);

relinka.error({ type: "CSSError", message: "Use scss" });

relinka.error(undefined, null, false, true, Number.NaN);

relinka.log("We can `monospace` keyword using grave accent character!");

relinka.log(
  "We can also _underline_ words but not_this or this should_not_be_underlined!",
);

// Nonstandard error
const { message, stack } = new Error("Custom Error!");
relinka.error({ message, stack });

// Circular object
const a = { foo: 1, bar: undefined as any };
a.bar = a;
relinka.log(a);

// Multiline
relinka.log("`Hello` the `JS`\n`World` and `Beyond`!");
