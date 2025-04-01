import type { RelinkaOptions } from "~/deprecated/types/mod.js";

import relinkaInstance, {
  createRelinka,
} from "~/deprecated/components/relinka/mod.js";

import { randomSentence } from "./sentence.js";

export function reporterDemo(
  opts: Partial<RelinkaOptions & { fancy: boolean }>,
) {
  const relinka = createRelinka({
    ...opts,
  });

  for (const type of Object.keys(relinkaInstance.options.types).sort()) {
    relinka[type](randomSentence());
  }

  relinkaInstance.info("JSON", {
    name: "Cat",
    color: "#454545",
  });

  relinkaInstance.error(new Error(randomSentence()));

  const tagged = relinkaInstance.withTag("reliverse").withTag("cli");

  for (const type of Object.keys(relinkaInstance.options.types).sort()) {
    tagged[type](randomSentence());
  }
}

export const relinkaExample = createRelinka();
