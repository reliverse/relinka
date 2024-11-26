import { relinka } from "~/main.js";

async function main() {
  relinka.warn("A new version of relinka is available: 3.0.1");
  relinka.error(new Error("This is an example error. Everything is fine!"));
  relinka.info("Using relinka 3.0.0");
  relinka.start("Building project...");
  relinka.success("Project built!");
}

await main();
