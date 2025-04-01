import { relinkaInstanceDeprecated } from "~/libs/core/core-main.js";

async function main() {
  relinkaInstanceDeprecated.start("Creating project...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  relinkaInstanceDeprecated.success("Project created!");
}

await main();
