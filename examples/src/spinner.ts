import { relinka } from "./utils/index.js";

async function main() {
  relinka.start("Creating project...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  relinka.success("Project created!");
}

await main();
