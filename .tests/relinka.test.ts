// bun test

import { afterAll, describe, test } from "bun:test";

import { flushAllLogBuffers, relinka, relinkaShutdown } from "../src/mod.js";

// Clean up after all tests
afterAll(async () => {
  // Ensure all logs are flushed before checking
  await flushAllLogBuffers();
  await relinkaShutdown();
});

describe("Relinka Logger", () => {
  test("basic log levels output to console", () => {
    // These just shouldn't throw and should output to console
    relinka("info", "Info message");
    relinka("success", "Success message");
    relinka("warn", "Warning message");
    relinka("error", "Error message");
    relinka("log", "Regular log message");

    // Verbose logs only show if verbose mode is enabled
    relinka("verbose", "This might not show depending on config");

    // Fatal would throw, so we're not testing it here
    // relinka("fatal", "Fatal message");
  });
});
