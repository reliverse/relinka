import { relinka } from "./utils/index.js";

relinka.log('relinka.log({ message: "hello" })');
// Prints "hello"
relinka.log({ message: "hello" });

relinka.log('relinka.log.raw({ message: "hello" })');
// Prints "{ message: 'hello' }"
relinka.log.raw({ message: "hello" });
