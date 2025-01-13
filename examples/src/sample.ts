import { relinkaInstance } from "~/main.js";

async function main() {
  relinkaInstance.warn("A new version of relinka is available: 3.0.1");
  relinkaInstance.error(
    new Error("This is an example error. Everything is fine!"),
  );
  relinkaInstance.info("Using relinka 3.0.0");
  relinkaInstance.start("Building project...");
  relinkaInstance.success("Project built!");
}

await main();
