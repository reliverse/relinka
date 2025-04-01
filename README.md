# Relidler: Reliverse Bundler

[💖 GitHub Sponsors](https://github.com/sponsors/blefnk) • [💬 Discord](https://discord.gg/Pb8uKbwpsJ) • [✨ Repo](https://github.com/reliverse/relinka-logger) • [📦 NPM](https://npmjs.com/@reliverse/relinka) • [📚 Docs](https://docs.reliverse.org)

**@reliverse/relinka** is your next powerful logger, which allows you to style your terminal or browser console like never before.

## Features

- 😘 Drop-in replacement for `consola`
- ⚡ `relinka` works via CLI and SDK
- 📦 Automated NPM/JSR publishing
- ✅ Ensures reliable JS/TS builds
- 🔄 Handles automatic version bumps
- 🔧 Eliminates `package.json` headaches
- 🎯 Optimized for speed and modern workflows
- 🛠️ Converts TypeScript aliases to relative paths
- ✨ Packed with powerful features under the hood
- 📝 Highly configurable flow via a configuration file
- 🔌 Plugin system with one built-in plugin included

## Getting Started

Ensure [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org), and a package manager ([bun](https://bun.sh)/[pnpm](https://pnpm.io)/[yarn](https://yarnpkg.com)/[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)) are installed. Then follow these steps:

### Example Playground

Want to test Relinka before integrating it into your project? Clone the repo and launch the example:

```sh
git clone https://github.com/reliverse/relinka-logger.git
cd relinka-logger
bun i
bun dev # bun examples/e-main.ts
```

### Relidler Usage

1. **Install globally**:

    ```sh
    bun i -g @reliverse/relidler
    ```

    **Or update as needed**:

    ```sh
    bun -g update --latest
    ```

2. **Prepare your project**:

    a. **Configure `.gitignore`**:

    ```sh
    echo "*.log" >> .gitignore
    echo "dist-npm" >> .gitignore
    echo "dist-jsr" >> .gitignore
    echo "dist-libs" >> .gitignore
    ```

    b. **Install config intellisense**:

    ```sh
    bun add -D @reliverse/relidler-cfg
    ```

    c. **Initialize `relidler.cfg.ts`**:

    ```sh
    relidler
    ```

    - The `relidler.cfg.ts` file is created automatically on the first run.
    - **It's recommended to customize this file according to your needs.**
    - Supported names: `relidler.cfg.ts` • `relidler.config.ts` • `build.pub.ts` • `build.cfg.ts`.

3. **Run and enjoy**:

    ```sh
    relidler
    ```

## Plugins & SDK

Relidler includes a plugin system, with the following official built-in plugin already available:

- **`libraries-relidler-plugin`**: Builds and publishes specified subdirectories of your main project as separate packages.

### API (for advanced users)

The SDK allows you to create new Relidler plugins and even extend your own CLI functionality.

```sh
bun add -D @reliverse/relidler-sdk
```

## TODO

- [x] ~~Implement stable `regular` build and publish~~
- [ ] Implement stable `library` build and publish
- [ ] Allow to minify dist with comments preserved
- [ ] Achieve full drop-in replacement for `unbuild`
- [ ] Support auto migration from `build.config.ts`
- [ ] Allow plugins to extend Relidler's `defineConfig`
- [ ] Support configuration via `reliverse.{ts,jsonc}`
- [ ] Make config file optional with sensible defaults

## Related

Kudos to the following project that made Relinka possible:

- [unjs/consola](https://github.com/unjs/consola#readme)

## License

🩷 [MIT](./LICENSE) © [blefnk Nazar Kornienko](https://github.com/blefnk)
