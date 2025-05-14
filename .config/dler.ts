import { defineConfig } from "@reliverse/relidler-cfg";

/**
 * Reliverse Bundler Configuration
 * Hover over a field to see more details
 * @see https://github.com/reliverse/dler
 */
export default defineConfig({
  // Bump configuration
  bumpDisable: false,
  bumpFilter: ["package.json", "reliverse.ts"],
  bumpMode: "autoPatch",

  // Common configuration
  commonPubPause: false,
  commonPubRegistry: "npm-jsr",
  commonVerbose: false,

  // Core configuration
  coreDeclarations: true,
  coreEntryFile: "mod.ts",
  coreEntrySrcDir: "src",
  coreIsCLI: false,

  // JSR-only config
  distJsrAllowDirty: true,
  distJsrBuilder: "jsr",
  distJsrCopyRootFiles: ["README.md", "LICENSE"],
  distJsrDirName: "dist-jsr",
  distJsrDryRun: false,
  distJsrGenTsconfig: false,
  distJsrOutFilesExt: "ts",
  distJsrSlowTypes: true,

  // NPM-only config
  distNpmBuilder: "mkdist",
  distNpmCopyRootFiles: ["README.md", "LICENSE"],
  distNpmDirName: "dist-npm",
  distNpmOutFilesExt: "js",

  // Libraries Dler Plugin
  // Publish specific dirs as separate packages
  // This feature is experimental at the moment
  // Please commit your changes before using it
  libsActMode: "main-project-only", // TODO: change to "main-and-libs" when separate packages will be implemented
  libsDirDist: "dist-libs",
  libsDirSrc: "src/libs",
  libsList: {
    // TODO: Uncomment when relinka-web will be implemented
    // "@reliverse/relinka-web": {
    //   libDeclarations: true,
    //   libDescription:
    //     "@reliverse/relinka-web is a modern, minimal browser logging library that actually feels right. It's not just pretty output — it's a system: smart formatting, browser-ready logging.",
    //   libDirName: "web",
    //   libMainFile: "web/web-mod.ts",
    //   libPkgKeepDeps: true,
    //   libTranspileMinify: true,
    // },
    // TODO: Move code from the src/* to the src/libs/core/*
    // "@reliverse/relinka-core": {
    //   libDeclarations: true,
    //   libDescription:
    //     "@reliverse/relinka is a modern, minimal logging library that actually feels right. It's not just pretty output — it's a system: smart formatting, file-safe logging, runtime config support, and a fatal mode built for developers who care about correctness.",
    //   libDirName: "core",
    //   libMainFile: "core/core-mod.ts",
    //   libPkgKeepDeps: true,
    //   libTranspileMinify: true,
    // },
  },

  // Logger setup
  logsFileName: "logs/relinka.log", // TODO: fix dler's implementation, e.g. "logs/relinka.log" doesn't work here
  logsFreshFile: true,

  // Dependency filtering
  rmDepsMode: "patterns-and-devdeps",
  rmDepsPatterns: [
    "@types",
    "biome",
    "eslint",
    "knip",
    "prettier",
    "typescript",
    "@reliverse/config",
  ],

  // Build setup
  transpileEsbuild: "es2023",
  transpileFormat: "esm",
  transpileMinify: true,
  transpilePublicPath: "/",
  transpileSourcemap: "none",
  transpileSplitting: false,
  transpileStub: false,
  transpileTarget: "node",
  transpileWatch: false,
});
