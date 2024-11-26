import { MagicRegExpTransformPlugin } from "magic-regexp/transform";
import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  entries: [
    {
      builder: "mkdist",
      outDir: "dist-npm",
      format: "esm",
      input: "src",
      ext: "js",
    },
  ],
  rollup: {
    emitCJS: false,
    esbuild: {
      exclude: ["**/*.test.ts"],
      target: "es2023",
      minify: true,
    },
  },
  hooks: {
    "rollup:options": (_options, config) => {
      if (Array.isArray(config.plugins)) {
        config.plugins.push(MagicRegExpTransformPlugin.rollup());
      }
    },
  },
});
