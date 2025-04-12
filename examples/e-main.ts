import {
  relinka,
  relinkaAsync,
  relinkaConfig,
  relinkaShutdown,
} from "~/main.js";

export async function main() {
  await relinkaAsync(
    // this automatically loads the config
    "verbose",
    "This ASYNC verbose message can be seen only if verbose=true (in user config)",
  );
  await relinkaConfig; // place this at your main function or just at the top of your entry file
  relinka(
    "verbose",
    "This SYNC verbose message can be seen only if verbose=true (in user config) AND config was loaded ",
  );
  relinka("log", "Hello! 👋");
  relinka("log", "Great to see you here!");
  relinka("info", "Everything is running smoothly");
  relinka("warn", "This might be a problem");
  relinka(
    "error", // non-fatal issue level can be recovered
    "Uh oh, something broke",
  );
  // relinka(
  //   "fatal",
  //   "We should never reach this code! This should never happen! (see <anonymous> line)",
  // ); // fatal level throws error and halts execution
  relinka("success", "Thanks for using Relinka!");

  // Make sure to shut down the logger at the end of your program
  // This is important to flush all buffers and close file handles
  await relinkaShutdown();
}

await main();
