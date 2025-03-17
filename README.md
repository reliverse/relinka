# Reliverse Relidler

[📦 NPM](https://npmjs.com/@reliverse/relidler) • [💬 Discord](https://discord.gg/Pb8uKbwpsJ) • [💖 Patreon](https://patreon.com/blefnk) • [📚 Docs](https://docs.reliverse.org)

**@reliverse/relidler** is a flexible unified bundler and publish tool for TypeScript and JavaScript projects.

## Features

- Works via CLI or as a library
- Automates publishing to NPM and JSR
- Handles version bumps automatically
- Ensures reliable builds for JS/TS projects
- Optimized for speed and modern workflows

## Installation

Ensure [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/en), and [Bun](https://bun.sh) are installed. Then:

### CLI Usage

Install globally:

```sh
bun i -g @reliverse/relidler
```

Generate optional config (recommended):

```sh
bun add -D @reliverse/relidler-cfg
relidler init
```

Run and enjoy:

```sh
relidler
```

### API Usage (for advanced users)

Extend your own CLI functionality via:

```sh
bun add -D @reliverse/relidler-core
# bun • pnpm • npm • yarn
```

## Related

- [unjs/consola](https://github.com/unjs/consola)

## License

🩷 [MIT](./LICENSE.md) © [blefnk Nazar Kornienko](https://github.com/blefnk)
