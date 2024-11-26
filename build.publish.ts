import { execa } from "execa";
import fs from "fs-extra";
import mri from "mri";

import relinka from "~/main.js";

function showHelp() {
  relinka.info(`Usage: bun build.publish.ts [options]

Options:
  no options      Publish to npm registry
  --jsr           Publish to JSR registry
  --dry-run       Perform a dry run of the publish process
  -h, --help      Show help
`);
}

const argv = mri(process.argv.slice(2), {
  alias: {
    h: "help",
  },
  boolean: ["jsr", "dry-run", "help"],
  default: {
    jsr: false,
    "dry-run": false,
    help: false,
  },
});

// If help flag is present, display help and exit
if (argv.help) {
  showHelp();
  process.exit(0);
}

// Handle flags
const validFlags = ["jsr", "dry-run", "help", "h"];
const unknownFlags = Object.keys(argv).filter(
  (key) => !validFlags.includes(key) && key !== "_",
);

if (unknownFlags.length > 0) {
  relinka.error(`❌ Unknown flag(s): ${unknownFlags.join(", ")}`);
  showHelp();
  process.exit(1);
}

async function publishNpm(dryRun: boolean) {
  try {
    if (dryRun) {
      await execa("bun publish --dry-run", { stdio: "inherit" });
    } else {
      await execa("bun build:npm", { stdio: "inherit" });
      await execa("bun publish", { stdio: "inherit" });
    }
    relinka.success("Published to npm successfully.");
  } catch (error) {
    relinka.error("❌ Failed to publish to npm:", error);
    process.exit(1);
  }
}

async function publishJsr(dryRun: boolean) {
  try {
    if (dryRun) {
      await execa(
        "bunx jsr publish --allow-slow-types --allow-dirty --dry-run",
        { stdio: "inherit" },
      );
    } else {
      await execa("bun build:jsr", { stdio: "inherit" });
      await execa("bunx jsr publish --allow-slow-types --allow-dirty", {
        stdio: "inherit",
      });
    }
    relinka.success("Published to JSR successfully.");
  } catch (error) {
    relinka.error("❌ Failed to publish to JSR:", error);
    process.exit(1);
  }
}

async function bumpJsrVersion(disable?: boolean) {
  if (disable) {
    return;
  }
  const pkg = JSON.parse(await fs.readFile("package.json", "utf-8"));
  const jsrConfig = JSON.parse(await fs.readFile("jsr.jsonc", "utf-8"));
  jsrConfig.version = pkg.version;
  await fs.writeFile("jsr.jsonc", JSON.stringify(jsrConfig, null, 2));
}

async function bumpNpmVersion() {
  await execa("bun bumpp", { stdio: "inherit" });
}

async function main() {
  const { jsr, "dry-run": dryRun } = argv;
  if (jsr) {
    await bumpJsrVersion();
    await publishJsr(dryRun);
  } else {
    await bumpNpmVersion();
    await publishNpm(dryRun);
  }
}

main().catch((error) => {
  relinka.error("❌ An unexpected error occurred:", error);
  process.exit(1);
});
