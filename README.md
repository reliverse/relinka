# Relinka: Logging that Actually Feels Good

> **@reliverse/relinka** is a modern, minimal logging library that actually *feels* right. It's not just pretty output — it's a system: smart formatting, file-safe logging, runtime config support, and a `fatal` mode built for developers who care about correctness. Whether you're building CLI tools, SDKs, or full-stack apps — Relinka helps you log with intention.

[sponsor](https://github.com/sponsors/blefnk) — [discord](https://discord.gg/Pb8uKbwpsJ) — [repo](https://github.com/reliverse/relinka) — [npm](https://npmjs.com/@reliverse/relinka)

## Why Relinka

- 🧙 Drop-in replacement for `node:console`, `consola`, or your internal logger
- 💬 Supports: `info`, `warn`, `success`, `error`, `verbose`, `fatal`, `clear`
- 🎨 Terminal output that *pops*, with automatic color handling
- 📁 Save logs to file (with daily rotation, cleanup, and max-file limits)
- 🧠 Structured message formatting (objects, errors, stacks — handled!)
- ⚙️ Runtime config via `relinka.config.ts` (powered by `reconf`)
- 🚨 `fatal` logs halt execution and trigger `debugger` in dev
- 🧩 Sync-first, async, & CLI-friendly thanks to buffer flushing

## Getting Started

Make sure you have git, node.js, and bun/pnpm/yarn/npm installed.

### 1. Install

```bash
bun add @reliverse/relinka
```

**Coming soon**:

```bash
bun i -g @reliverse/dler
dler relinka --console-to-relinka
```

### 2. Use It

#### Direct Method (Recommended)

- Place this **at the START** of your app's main function:

```ts
await relinkaConfig;
```

- Place this **at the END** of your app's main function:

```ts
await relinkaShutdown();
```

**Usage example**:

```ts
import {
  relinka,
  relinkaAsync,
  relinkaConfig,
  relinkaShutdown,
} from "@reliverse/relinka";

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
```

#### [🔜 Soon] Singleton Method

```ts
const logger = initRelinkaInstance({/* per-project config */}); 
logger("info", "Looks great!");
```

#### [🔜 Soon] Object Method

```ts
await relinkaConfig;
relinka.info("Looks great!");
```

## Advanced Usage

```ts
// Clear terminal:
relinka("clear", "");
// Blank line:
relinka("info", "");
// Async variant:
import { relinkaAsync } from "@reliverse/relinka";
await relinkaAsync("info", "Logged from async context");
// Coming soon:
await relinkaAsync("info", "Something happened", { animate: true });
```

## Config

Create `relinka.config.ts`:

```ts
import { defineConfig } from "@reliverse/relinka";
/**
 * RELINKA CONFIGURATION FILE
 * - Hover over a field to see the information
 * - Use intellisense to see available options
 * @see https://github.com/reliverse/relinka
 */
export default defineConfig({
  // Enable to see verbose logs
  verbose: false,

  // Timestamp configuration
  timestamp: {
    enabled: false,
    format: "HH:mm:ss",
  },

  // Control whether logs are saved to a file
  saveLogsToFile: true,

  // Disable colors in the console
  disableColors: false,

  // Log file path
  logFilePath: "relinka.log",

  levels: {
    success: {
      symbol: "✓",
      fallbackSymbol: "[OK]",
      color: "greenBright",
      spacing: 3,
    },
    info: {
      symbol: "i",
      fallbackSymbol: "[i]",
      color: "cyanBright",
      spacing: 3,
    },
    error: {
      symbol: "✖",
      fallbackSymbol: "[ERR]",
      color: "redBright",
      spacing: 3,
    },
    warn: {
      symbol: "⚠",
      fallbackSymbol: "[WARN]",
      color: "yellowBright",
      spacing: 3,
    },
    fatal: {
      symbol: "‼",
      fallbackSymbol: "[FATAL]",
      color: "redBright",
      spacing: 3,
    },
    verbose: {
      symbol: "✧",
      fallbackSymbol: "[VERBOSE]",
      color: "gray",
      spacing: 3,
    },
    log: { symbol: "│", fallbackSymbol: "|", color: "dim", spacing: 3 },
  },

  // Directory settings
  dirs: {
    dailyLogs: true,
    logDir: "logs", // store logs in a custom folder
    maxLogFiles: 5, // keep only the 5 most recent log files
    specialDirs: {
      distDirNames: [],
      useParentConfigInDist: true,
    },
  },
});
```

Supported files:

- `relinka.config.ts`
- 🔜 other formats, supported by `reconf`, are coming soon

## Log Files

- Default: `logs/relinka.log`
- Daily mode: `2025-04-11-relinka.log`
- Auto-cleanup: keep latest N logs

## API Summary

```ts
relinka("info", "message", optionalDetails);
relinka("fatal", "something broke"); // throws
relinka("clear", ""); // clears terminal

await relinkaAsync("warn", "something async");
```

```ts
defineConfig({ ... }) // helper for relinka.config.ts
```

## Built-in Utilities

- ✅ Timestamping
- ✅ File-safe formatting
- ✅ Log rotation
- ✅ Fatal logging (with debugger)
- ✅ Colorized terminal output

## FAQ

### Why `relinka.config.ts` doesn't works for me?

→ You forget to load user's config by using `await relinkaConfig;` **at the START** of your app's main function.

### Why my terminal stucks after last relinka() usage?

→ You forget to flush the buffer. Place `await relinkaShutdown();` **at the END** of your app's main function.

### Why does TS linter tells that something wrong with `relinka("info", args)`?

→ Add empty string: `relinka("info", "", args)`

### Does `fatal` throw?

→ Yes, always. It will halt execution and trigger `debugger` in dev mode.

### What's coming next?

- Relinka is designed to be used in the different ways:
- Use `relinka(level, message, ...args)` (recommended).
- 🔜 Or, just `relinka.level(message, ...args)`
- 🔜 Both designed to work with both sync (default) and async/await.
- 🔜 Both designed to work with both direct and wrapper methods.
- 🔜 Use the async logger if you want some advanced features (like typing text streaming animation).

## Tips

- Building CLIs? Use with [`@reliverse/prompts`](https://npmjs.com/@reliverse/prompts)
- Want type-safe injections? Try [`@reliverse/reinject`](https://npmjs.com/@reliverse/reinject)
- For advanced bundling? Pair with [`@reliverse/dler`](https://npmjs.com/@reliverse/dler)

## Roadmap

- [x] File logging
- [x] Timestamps
- [x] Daily logs
- [x] Log rotation
- [x] `fatal` type
- [x] Runtime config
- [ ] Implement per-project config redefinition
- [ ] Plugin support (custom formatters, hooks)
- [ ] CLI interface (to manage logs, config, etc)

## Shoutouts

Relinka wouldn't exist without these gems:

- [unjs/consola](https://github.com/unjs/consola#readme)  
- [winston](https://github.com/winstonjs/winston#readme)  
- [pino](https://github.com/pinojs/pino#readme)  
- [node-bunyan](https://github.com/trentm/node-bunyan#readme)

## License

💖 MIT © 2025 [blefnk Nazar Kornienko](https://github.com/blefnk)
