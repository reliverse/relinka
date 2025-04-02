# Relinka: Stylish Logging Made Simple

[💖 GitHub Sponsors](https://github.com/sponsors/blefnk) • [💬 Discord](https://discord.gg/Pb8uKbwpsJ) • [✨ Repo](https://github.com/reliverse/relinka-logger) • [📦 NPM](https://npmjs.com/@reliverse/relinka) • [📚 Docs](https://docs.reliverse.org)

**@reliverse/relinka** is your next favorite logging library — built to make your terminal (and browser console — soon) output look good, stay clean, and be actually helpful. It’s styled, structured, and smart. Oh, and it works with configs, files, and colors out of the box.

## 🌟 Features

- 🧙 Drop-in replacement for `node:console` and `consola`
- 💬 `relinka` supports: `info`, `warn`, `success`, `error`, `verbose`
- 🎨 Beautiful, color-coded logs in the terminal
- 🧠 Auto-formats messages, objects, and errors
- 📁 Save logs to file (with daily logs, cleanup, and rotation)
- 📦 Use it programmatically or through CLI-compatible tools
- ⚙️ Smart customization via config
- ✨ Extensible and future-proof

## 🚀 Getting Started

### 1. Install

```bash
bun add @reliverse/relinka
```

And, optionally, install the CLI globally to manage your config:

```bash
bun i -g @reliverse/relinka-cli
```

### 2. Basic Usage

```ts
import { relinkaConfig, relinka } from "@reliverse/relinka";
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
```

## 🧪 Advanced Usage

Want a clean blank line?

```ts
relinka("info", ""); // Just prints a newline
```

🔜 Use the async logger if you want some advanced features (like typing text animation - soon):

```ts
import { relinkaAsync } from "@reliverse/relinka";

await relinkaAsync("info", "Something happened", { animate: true });
```

## ⚙️ Configuration

Create a `relinka.config.ts` file with a content like:

```ts
import { defineConfig } from "@reliverse/relinka";
export default defineConfig({
  // Enable debug to see verbose logs
  debug: true,
  // Show timestamp in each log message
  withTimestamp: false,
  // Control whether logs are saved to a file
  saveLogsToFile: true,
  // Disable colors in the console
  disableColors: false,
  // Log file path
  logFilePath: "relinka.log",
  // Directory settings
  dirs: {
    dailyLogs: true,
    logDir: ".reliverse/logs", // store logs in a custom folder
    maxLogFiles: 5, // keep only the 5 most recent log files
    specialDirs: {
      distDirNames: [],
      useParentConfigInDist: true,
    },
  },
});
```

Supported config file names:

- `relinka.config.ts`
- 🔜 `.relinka.config.js`
- 🔜 `.relinkarc`
- 🔜 or any other supported by c12

## 📁 Log Files

- Stored in `.reliverse/logs/` by default
- Filename: `relinka.log` or `YYYY-MM-DD-relinka.log` if daily logs are enabled
- Auto-rotates based on `maxLogFiles`

## 📚 API Summary

### relinka(level, message, ...args)

Logs synchronously. Skips debug logs if `debug: false`.

### relinkaAsync(level, message, ...args)

Async logger that waits for config automatically, and provides some additional advanced features.

### defineConfig(config)

Helper to define typed config in `relinka.config.ts`

## 🧰 Utilities

✅ Timestamping  
✅ Log file rotation  
✅ File-safe formatting  
✅ ANSI color support  
✅ Error object handling

## 💡 Tips

- Want `@ts-expect-error` auto-injection? Check out [`@reliverse/reinject`](https://npmjs.com/@reliverse/reinject).
- Using this in a CLI tool? Combine with [`@reliverse/prompts`](https://npmjs.com/@reliverse/prompts).

## ✅ TODO

- [x] File-based logging
- [x] Timestamp support
- [x] Daily logs
- [x] Smart config
- [x] Log rotation
- [ ] CLI interface (optional)
- [ ] Plugin support (custom formatters, log levels, etc)

## 🙌 Shoutout

Relinka was inspired by this gem:

- [unjs/consola](https://github.com/unjs/consola#readme)

## 📄 License

💖 MIT © [blefnk (Nazar Kornienko)](https://github.com/blefnk)
