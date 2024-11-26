# @reliverse/relinka

[**Docs**](.github/DOCS.md) | [**npmjs.com**](https://npmjs.com/package/@reliverse/relinka) | [**GitHub**](https://github.com/reliverse/relinka)

<p align="left">
  <a href="https://npmjs.org/package/@reliverse/relinka">
    <img src="https://img.shields.io/npm/v/@reliverse/relinka.svg" alt="version" />
  </a>
  <!-- <a href="https://github.com/reliverse/relinka/actions/workflows/test.yml">
    <img src="https://github.com/reliverse/relinka/actions/workflows/test.yml/badge.svg" alt="test" />
  </a> -->
  <a href="https://npmjs.org/package/@reliverse/relinka">
    <img src="https://img.shields.io/npm/dm/@reliverse/relinka.svg" alt="downloads" />
  </a>
  <!-- <a href="https://licenses.dev/npm/@reliverse/relinka">
    <img src="https://licenses.dev/b/npm/@reliverse/relinka" alt="licenses" />
  </a> -->
  <!---
   <a href="https://packagephobia.now.sh/result?p=@reliverse/relinka">
    <img src="https://packagephobia.now.sh/badge?p=@reliverse/relinka" alt="install size" />
  </a>
  --->
</p>

@reliverse/relinka is a powerful logger for your terminal.

@reliverse/relinka is a full-featured alternative to winston, unjs consola, pino, and similar libraries.

## Installation

Install with your preferred package manager:

```sh
bun add @reliverse/relinka # Replace 'bun' with npm, pnpm, or yarn if desired (deno and jsr support coming soon)
```

## Screenshot

[![CLI Example](./example.png)](./example.png)

## Key Features

- **Type Safety**: Built with TypeScript, ensuring strong typing to prevent runtime errors.
- **Schema Validation**: Validates user inputs using schemas for enhanced reliability.
- **Flexible Prompt Types**: Supports a range of prompt types, including text, password, number, select, and multiselect.
- **Crash Resilience**: Designed to handle cancellations and errors gracefully, ensuring stability.

## Prompt Types

Each type has its own validation and display logic. More types are planned for future releases.

- **Text**: Collects text input.
- **Password**: Hidden input for secure password entries.
- **Number**: Numeric input with optional validation.
- **Confirm**: Simple Yes/No prompt.
- **Select**: Dropdown selection for multiple choices.
- **Multiselect**: Allows users to select multiple items from a list.

## Input Validation

All prompts support custom validation logic, providing immediate feedback to users.

## Contributing

@reliverse/relinka is a work in progress. We welcome feedback and contributions to help make it the best library it can be. Thank you!

Here is how to install the library for development:

```sh
git clone https://github.com/reliverse/relinka.git
cd relinka
bun i
```

## Playground

Run `bun dev` to launch the [examples/run-example.ts](./examples/run-example.ts) CLI, where you can dive into and explore any of the examples listed below. Experiment with @reliverse/relinka by running examples locally or reviewing the linked code:

1. **[1-main-example.ts](./examples/1-main-example.ts)**: A comprehensive example of a CLI application featuring a well styled UI config. This example showcases all available prompt components, with code organized into separate functions and files for better readability and clarity.
2. **[2-mono-example.ts](./examples/2-mono-example.ts)**: A quiz game example inspired by Fireship's [video](https://youtube.com/watch?v=_oHByo8tiEY). It demonstrates the dynamic capabilities of @reliverse/relinka by using a prompt() that includes all prompt components, so you don't need to import each component separately.
3. **[3-basic-example.ts](./examples/3-basic-example.ts)**: A simple example highlighting the core functionalities of @reliverse/relinka. The entire implementation is contained within a single file for easy understanding.

## Prompts Library Comparison

> **Note:** This table contains approximate and placeholder values. More detailed assessments will be provided as libraries continue to evolve.

**Icon Legend:**

- 🟡: Not yet verified
- 🟢: Fully supported
- 🔵: Partially supported
- 🔴: Not supported

| **Feature**                                                | **@reliverse/relinka**                             | **@inquirer/prompts** | **@enquirer/enquirer** | **@clack/prompts** | **@terkelg/prompts** | **@cronvel/terminal-kit** | **@unjs/citty** | **@unjs/consola** |
| ---------------------------------------------------------- | -------------------------------------------------- | --------------------- | ---------------------- | ------------------ | -------------------- | ------------------------- | --------------- | ----------------- |
| **Full Node.js Modules Support**                           | 🟢 Native ES module package                        | 🟡                    | 🟡                     | 🟡                 | 🔴 CJS-only          | 🔴 CJS-only               | 🟡              | 🟡                |
| **Works both in node, bun, and deno environments**         | 🔵 node+bun (deno support is coming soon)          | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟢              | 🟢                |
| **Codebase typesafety with intellisense**                  | 🔵                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Runtime typesafety with schema validation**              | 🟢 TypeBox & Custom                                | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Usage Examples**                                         | 🟢                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Mono Component**                                         | 🟢 Mono (All-In-One) & Separate                    | 🟡                    | 🟡                     | 🟡                 | 🔵 Mono-only         | 🟡                        | 🟡              | 🟡                |
| **Start Component**                                        | 🟢                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Text Component**                                         | 🟢                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Customization**                                          | 🟢 Colors, typography, variants, borders, and more | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Visual Components: Separator, Animated Text, ASCII Art** | 🟢 Includes 6 animations and 290 ASCII fonts       | 🔵 Separator only     | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Password Component**                                     | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Number Component**                                       | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Confirm Component**                                      | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Select Component**                                       | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Multiselect Component**                                  | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Search/Autocomplete Component**                          | 🔵                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Spinner & Progressbar Components**                       | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟢                        | 🟡              | 🟡                |
| **Image Component**                                        | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟢                        | 🟡              | 🟡                |
| **Custom Validation**                                      | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Error Handling**                                         | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Ease of Setup**                                          | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Crash Resilience**                                       | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **General DX**                                             | 🔵 Clean and understandable TypeScript code        | 🟡                    | 🟡                     | 🟡                 | 🔴 JS-only           | 🔴 JS-only                | 🟡              | 🟡                |
| **DX: Classes**                                            | 🟢 Minimal number of classes as possible           | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Documentation**                                          | 🔵                                                 | 🟡                    | 🟡                     | 🟡                 | 🔵                   | 🟢                        | 🟡              | 🟡                |
| **Designed With UX/DX in Mind**                            | 🟢                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟡              | 🟡                |
| **Fast and lightweight argument parser**                   | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟢              | 🟡                |
| **Smart value parsing with typecast**                      | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟢              | 🟡                |
| **Boolean shortcuts and unknown flag handling**            | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟢              | 🟡                |
| **Nested sub-commands**                                    | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟢              | 🟡                |
| **Lazy and Async commands**                                | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟢              | 🟡                |
| **Pluggable and composable API**                           | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟢              | 🟡                |
| **Auto generated usage and help**                          | 🟡                                                 | 🟡                    | 🟡                     | 🟡                 | 🟡                   | 🟡                        | 🟢              | 🟡                |

**Related Links**: [ESM/CJS](https://dev.to/iggredible/what-the-heck-are-cjs-amd-umd-and-esm-ikm), ["Pure ESM package"](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c), [Clean code](https://github.com/ryanmcdermott/clean-code-javascript#readme), ["UX patterns for CLI tools"](https://lucasfcosta.com/2022/06/01/ux-patterns-cli-tools.html), [DX (Developer Experience)](https://github.blog/enterprise-software/collaboration/developer-experience-what-is-it-and-why-should-you-care), [TypeBox](https://github.com/sinclairzx81/typebox#readme), ["ANSI Escape Sequences"](https://gist.github.com/ConnerWill/d4b6c776b509add763e17f9f113fd25b)

## Wrap-Up

@reliverse/relinka is a versatile library designed to accelerate CLI development by providing customizable prompt components. Integrated into the [Reliverse CLI](https://github.com/blefnk/reliverse#readme), @reliverse/relinka enables you to create a unique design aligned with your CLI app’s aesthetics, similar to how @shadcn/ui supports customizable web UI components. Quickly get started by copying configurations from the [Reliverse Docs](https://docs.reliverse.org/relinka) and using components that fit your project, making it faster to bring your CLI app to life. You’re free to customize each component as desired, with default designs provided to ensure an attractive interface from the start.

**Example Configuration:**

```typescript
const basicConfig = {
  titleColor: "cyanBright",
  titleTypography: "bold",
  borderColor: "viceGradient",
} satisfies OptionalPromptOptions;

const extendedConfig = {
  ...basicConfig,
  contentTypography: "italic",
  contentColor: "dim",
} satisfies OptionalPromptOptions;

const username = await textPrompt({
  id: "username",
  title: "We're glad you're testing our library!",
  content: "Let's get to know each other!\nWhat's your username?",
  schema: schema.properties.username,
  ...extendedConfig,
});
```

## Learn More

- [Temporary Relinka Docs](.github/DOCS.md)
- [Reliverse Docs](https://docs.reliverse.org)

## Special Thanks

This project wouldn’t exist without the amazing work of the huge number of contributors to the list of projects below. Many of the @reliverse/relinka prompts are based on the incredible work of:

[@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js#readme) | [terkelg/prompts](https://github.com/terkelg/prompts#readme) | [@clack/prompts](https://github.com/bombshell-dev/clack#readme) | [create-t3-app](https://github.com/t3-oss/create-t3-app#readme) | [create-astro](https://github.com/withastro/astro/tree/main/packages/create-astro#readme) | [cronvel/terminal-kit](https://github.com/cronvel/terminal-kit#readme) | [unjs/consola](https://github.com/unjs/consola#readme) | [nodejs/string_decoder](https://github.com/nodejs/string_decoder) | [TooTallNate/keypress](https://github.com/TooTallNate/keypress) | [derhuerst](https://github.com/derhuerst)

## License

[MIT](./LICENSE.md) © [Nazarii Korniienko](https://github.com/blefnk)
