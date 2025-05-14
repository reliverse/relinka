import type { RelinkaOptionsDeprecated } from "~/deprecated/types.js";

import { createRelinkaDeprecated } from "~/deprecated/components/relinka-deprecated/relinka.js";
import { relinkaInstanceDeprecated } from "~/mod.js";

import { randomSentence } from "./sentence.js";

export function reporterDemo(
  opts: Partial<RelinkaOptionsDeprecated & { fancy: boolean }>,
) {
  const relinka = createRelinkaDeprecated({
    ...opts,
  });

  for (const type of Object.keys(
    relinkaInstanceDeprecated.options.types,
  ).sort()) {
    relinka[type](randomSentence());
  }

  relinkaInstanceDeprecated.info("JSON", {
    name: "Cat",
    color: "#454545",
  });

  relinkaInstanceDeprecated.error(new Error(randomSentence()));

  const tagged = relinkaInstanceDeprecated.withTag("reliverse").withTag("cli");

  for (const type of Object.keys(
    relinkaInstanceDeprecated.options.types,
  ).sort()) {
    tagged[type](randomSentence());
  }
}
