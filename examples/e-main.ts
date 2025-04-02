import { relinkaConfig, relinka } from "~/main.js";

export async function main() {
  await relinkaConfig;
  relinka(
    "verbose",
    "This message can be seen only if config was loaded AND debug is enabled",
  );
  relinka("info", "Everything is running smoothly");
  relinka("warn", "This might be a problem");
  relinka("error", "Uh oh, something broke");
  relinka("success", "Thanks for using Relinka! 👋");
}

await main();
