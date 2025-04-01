import type { RelinkaOptionsDeprecated } from "~/libs/relinka/relinka-types.js";

import { createRelinkaDeprecated } from "~/libs/relinka/relinka-impl/deprecated/components/relinka-deprecated/relinka.js";
import { relinkaInstanceDeprecated } from "~/main.js";

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
