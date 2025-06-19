import {
  relinka,
  relinkaAsync,
  relinkaConfig,
  relinkaShutdown,
} from "~/mod.js";

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

  // --- BOX LEVEL EXAMPLES ---
  relinka("box", "This is a boxed message using direct syntax!");
  relinka.box("This is a boxed message using method syntax!");

  // --- MESSAGE LEVEL EXAMPLES ---
  relinka("message", "This is a message using direct syntax!");
  relinka.message("This is a message using method syntax!");

  // --- STEP LEVEL EXAMPLES ---
  relinka("step", "Step 1: Initialize application");
  relinka.step("Step 2: Load configuration");
  relinka.step("Step 3: Start services");

  // --- LOG LEVEL EXAMPLES ---
  relinka("log", "Hello! 👋");
  relinka("log", "Great to see you here!");
  relinka("info", "Everything is running smoothly");
  relinka("warn", "This might be a problem");
  relinka(
    "error", // non-fatal issue level can be recovered
    "Uh oh, something broke",
  );

  relinka(
    "null",
    "'null' level has a special handling case: no symbol or spacing",
  );

  // relinka(
  //   "fatal",
  //   "We should never reach this code! This should never happen! (see <anonymous> line)",
  // ); // fatal level throws error and halts execution
  relinka("success", "Thanks for using Relinka!");

  // Make sure to shut down the logger at the end of your program
  // This is important to flush all buffers and close file handles
  await relinkaShutdown();

  // Make sure to exit the program after your CLI is done
  // It's not required for Bun-only apps, but recommended
  // for other terminal runtimes like Node.js (incl. `tsx`)
  // It's also not required for @reliverse/rempts `runMain()`
  process.exit(0);
}

await main();
