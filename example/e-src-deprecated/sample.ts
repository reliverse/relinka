import { relinkaInstanceDeprecated } from "~/mod.js";

async function main() {
  relinkaInstanceDeprecated.warn(
    "A new version of relinka is available: 3.0.1",
  );
  relinkaInstanceDeprecated.error(
    new Error("This is an example error. Everything is fine!"),
  );
  relinkaInstanceDeprecated.info("Using relinka 3.0.0");
  relinkaInstanceDeprecated.start("Building project...");
  relinkaInstanceDeprecated.success("Project built!");
}

await main();
