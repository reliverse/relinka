import { relinkaInstance } from "~/main.js";

relinkaInstance.log('relinkaInstance.log({ message: "hello" })');
// Prints "hello"
relinkaInstance.log({ message: "hello" });

relinkaInstance.log('relinkaInstance.log.raw({ message: "hello" })');
// Prints "{ message: 'hello' }"
relinkaInstance.log.raw({ message: "hello" });
