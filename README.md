# Relinka: Logging that Actually Feels Good

[sponsor](https://github.com/sponsors/blefnk) — [discord](https://discord.gg/Pb8uKbwpsJ) — [repo](https://github.com/reliverse/relinka) — [npm](https://npmjs.com/@reliverse/relinka)

> **@reliverse/relinka** is a modern logging library that actually *feels* right. It's not just pretty output — it's a system: smart formatting, file-safe logging, runtime config support, and a `fatal` mode built for developers who care about correctness. Whether you're building CLI tools, SDKs, or full-stack apps — Relinka helps you log with intention.

## Why Relinka

- 🧙 **Drop-in replacement** for `node:console`, `consola`, or your internal logger
- 💬 **12 log levels**: `info`, `warn`, `success`, `error`, `verbose`, `fatal`, `log`, `step`, `box`, `message`, `internal`, `null`
- 🎨 **Beautiful terminal output** with automatic color handling and Unicode support
- 📁 **Smart file logging** with buffering, rotation, cleanup, and date-based naming
- 🧠 **Structured formatting** for objects, errors, and stack traces
- ⚙️ **Runtime configuration** via `.config/relinka.ts` or `relinka.config.ts`
- 🚨 **Fatal logging** that halts execution and triggers debugger in development
- 🧩 **Dual syntax support** - both function calls (`relinka("info", "Hello world")`) and method chaining (`relinka.info("Hello world")`)
- ⚡ **Performance optimized** with intelligent buffering and async support
- 🛎️ **Dler-ready** - if you use `dler build`, all `internal`-level logs will be removed from the built dist

## Quick Start

### 1. Install

```bash
bun add @reliverse/relinka
```

### 2. Basic Usage

```ts
import { relinka, relinkaConfig, relinkaShutdown } from "@reliverse/relinka";

async function main() {
  // Load configuration (required at start)
  await relinkaConfig();
  
  // Log with different levels
  relinka("info", "Application started");
  relinka("success", "Configuration loaded successfully");
  relinka("warn", "This is a warning");
  relinka("error", "Something went wrong");
  
  // Use method syntax (also supported)
  relinka.info("Another info message");
  relinka.success("Another success message");
  
  // Clean shutdown (required at end)
  await relinkaShutdown();
}

main();
```

## Log Levels

Relinka supports 12 different log levels, each with customizable symbols and colors:

| Level | Symbol | Description |
|-------|--------|-------------|
| `info` | ◈ | General information |
| `success` | ✓ | Success messages |
| `warn` | ⚠ | Warnings |
| `error` | ✖ | Non-fatal errors |
| `fatal` | ‼ | Fatal errors + error throwing |
| `verbose` | ✱ | Debug information |
| `log` | │ | General logging |
| `step` | → | Progress steps |
| `box` | ■ | Boxed messages |
| `message` | 🞠 | General messages |
| `internal` | ⚙ | Internal system logs |
| `null` | (none) | No symbol or spacing |

## API Reference

### Core Functions

#### `relinka(level, message, ...args)`

Main logging function with dual syntax support.

```ts
// Function syntax
relinka("info", "Hello world");
relinka("error", "Something broke", { error: "details" });

// Method syntax
relinka.info("Hello world");
relinka.error("Something broke", { error: "details" });
```

#### `relinkaAsync(level, message, ...args)`

Async version that waits for configuration to load.

```ts
await relinkaAsync("info", "Async message");
await relinkaAsync("success", "Operation completed");
```

#### `relinkaConfig(options?)`

Load configuration with optional fresh log file support.

```ts
// Basic config loading
await relinkaConfig();

// With fresh log file (clears existing log file)
await relinkaConfig({ supportFreshLogFile: true });
```

#### `relinkaShutdown()`

Flush all buffers and clean up resources. **Always call this at the end of your program.**

```ts
await relinkaShutdown();
```

### Utility Functions

#### `log`, `logger`

Aliases for the main `relinka` function.

```ts
import { log, logger } from "@reliverse/relinka";

log("info", "Using alias");
logger.success("Another alias");
```

#### `message(msg, ...args)`

Convenience function for general messages.

```ts
import { message } from "@reliverse/relinka";
message("This is a general message");
```

#### `step(msg, ...args)`

Convenience function for progress steps.

```ts
import { step } from "@reliverse/relinka";
step("Step 1: Initialize");
step("Step 2: Load config");
```

## Configuration

Create a configuration file to customize Relinka's behavior:

### File Locations (in order of priority)

1. `relinka.config.ts` (project root) - **highest priority**
2. `.config/relinka.ts` - **lower priority**

### Configuration Example

```ts
import { defineConfig } from "@reliverse/relinka";

export default defineConfig({
  // Enable verbose logging
  verbose: false,

  // Timestamp configuration
  timestamp: {
    enabled: true,
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  },

  // File logging
  saveLogsToFile: true,
  logFile: {
    outputPath: "logs/app.log",
    nameWithDate: "append-before", // "disable" | "append-before" | "append-after"
    freshLogFile: true, // Clear log file on each run
  },

  // Log rotation
  dirs: {
    maxLogFiles: 10, // Keep only the 10 most recent log files
  },

  // Performance tuning
  bufferSize: 4096, // 4KB buffer before flushing
  maxBufferAge: 5000, // 5 seconds max buffer age
  cleanupInterval: 10000, // 10 seconds between cleanups

  // Customize log levels
  levels: {
    success: {
      symbol: "✓",
      fallbackSymbol: "[OK]",
      color: "greenBright",
      spacing: 3,
    },
    info: {
      symbol: "◈",
      fallbackSymbol: "[i]",
      color: "cyanBright",
      spacing: 3,
    },
    // ... customize other levels
  },
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `verbose` | `boolean` | `false` | Enable verbose logging |
| `saveLogsToFile` | `boolean` | `false` | Save logs to file |
| `disableColors` | `boolean` | `false` | Disable color output |
| `timestamp.enabled` | `boolean` | `false` | Add timestamps to logs |
| `timestamp.format` | `string` | `"YYYY-MM-DD HH:mm:ss.SSS"` | Timestamp format |
| `logFile.outputPath` | `string` | `"logs.log"` | Log file path |
| `logFile.nameWithDate` | `string` | `"disable"` | Date handling in filename |
| `logFile.freshLogFile` | `boolean` | `true` | Clear log file on startup |
| `dirs.maxLogFiles` | `number` | `0` | Maximum log files to keep |
| `bufferSize` | `number` | `4096` | Buffer size in bytes |
| `maxBufferAge` | `number` | `5000` | Max buffer age in ms |
| `cleanupInterval` | `number` | `10000` | Cleanup interval in ms |

## File Logging

### File Naming Patterns

- **Default**: `logs.log`
- **With subdirectory**: `logs/app.log`
- **With date prefix**: `2025-01-15-logs.log`
- **With date suffix**: `logs-2025-01-15.log`
- **Combined**: `logs/2025-01-15-app.log`

### Automatic Cleanup

When `maxLogFiles` is set, Relinka automatically:

- Keeps only the N most recent log files
- Deletes older files during cleanup
- Runs cleanup periodically and on shutdown

## Advanced Usage

### Fatal Logging

Fatal logs throw errors and halt execution:

```ts
// This will throw an error and trigger debugger in development
relinka("fatal", "Critical system failure");
// or
relinka.fatal("Critical system failure");
```

### Box Formatting

Create visually appealing boxed messages:

```ts
relinka("box", "This message will be displayed in a box");
relinka.box("This also works with method syntax");
```

### Async Context

Use `relinkaAsync` when you need to ensure configuration is loaded:

```ts
await relinkaAsync("info", "This waits for config to load");
```

### Clear Terminal

Clear the terminal output:

```ts
relinka("clear", "");
// or
relinka.clear();
```

### Empty Lines

Add blank lines to output:

```ts
relinka("info", "");
```

## Best Practices

### 1. Always Initialize and Shutdown

```ts
async function main() {
  await relinkaConfig(); // At the start
  
  // Your application logic
  relinka("info", "App running");
  
  await relinkaShutdown(); // At the end
}
```

### 2. Use Appropriate Log Levels

```ts
relinka("info", "User logged in"); // General info
relinka("success", "Payment processed"); // Success events
relinka("warn", "High memory usage"); // Warnings
relinka("error", "Database connection failed"); // Recoverable errors
relinka("fatal", "Critical system failure"); // Unrecoverable errors
```

### 3. Leverage Verbose Logging

```ts
relinka("verbose", "Debug information"); // Only shown when verbose=true
```

### 4. Structure Complex Data

```ts
relinka("error", "API request failed", {
  endpoint: "/api/users",
  statusCode: 500,
  error: error.message
});
```

## Performance Features

- **Intelligent Buffering**: Logs are buffered and flushed efficiently
- **Async File Operations**: Non-blocking file writes
- **Memory Management**: Automatic cleanup of old log files
- **Unicode Detection**: Automatic fallback for non-Unicode terminals

## FAQ

### Why does my terminal hang after logging?

→ You forgot to call `await relinkaShutdown()` at the end of your program. This is required to flush buffers.

### Why isn't my configuration loading?

→ Make sure you call `await relinkaConfig()` at the start of your application.

### Does `fatal` always throw?

→ Yes, `fatal` logs always throw errors and halt execution. In development mode, they also trigger the debugger.

### How do I disable colors?

→ Set `disableColors: true` in your configuration or use `NO_COLOR=1` environment variable.

### Can I use Relinka in both sync and async contexts?

→ Yes! Use `relinka()` for sync operations and `relinkaAsync()` when you need to use some advanced features (like typing text streaming animation).

### What's the difference between `log` and `message` levels?

→ `log` uses a pipe symbol (│) and is for general logging, while `message` uses a different symbol (🞠) and is for general messages.

## Ecosystem

Relinka works great with other Reliverse tools:

- **CLI Development**: [`@reliverse/prompts`](https://npmjs.com/@reliverse/prompts)
- **Bundling**: [`@reliverse/dler`](https://npmjs.com/@reliverse/dler)

## Roadmap

- [x] File logging with rotation
- [x] Timestamp support
- [x] Date-based file naming
- [x] Automatic cleanup
- [x] Fatal logging with debugger
- [x] Runtime configuration
- [x] Dual syntax support
- [ ] Plugin system
- [ ] Custom formatters
- [ ] CLI interface for log management
- [ ] WebSocket streaming
- [ ] Structured logging (JSON)

## Contributing

We welcome contributions! Please see our [contributing guide](CONTRIBUTING.md) for details.

## License

💖 MIT © 2025 [blefnk Nazar Kornienko](https://github.com/blefnk)

## Acknowledgments

Relinka is inspired by these excellent logging libraries:

- [unjs/consola](https://github.com/unjs/consola) - Console logging for Node.js
- [winston](https://github.com/winstonjs/winston) - Multi-transport logging
- [pino](https://github.com/pinojs/pino) - Fast Node.js logger
- [node-bunyan](https://github.com/trentm/node-bunyan) - JSON logging
