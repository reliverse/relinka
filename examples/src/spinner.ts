import { relinkaInstance } from "~/main.js";

async function main() {
  relinkaInstance.start("Creating project...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  relinkaInstance.success("Project created!");
}

await main();
