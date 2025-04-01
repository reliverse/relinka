import type { RelinkaOptions } from "~/libs/core/core-types.js";

import { createRelinkaDeprecated } from "~/libs/core/core-impl/deprecated/components/relinka-deprecated/relinka.js";
import { relinkaInstanceDeprecated } from "~/main.js";

import { randomSentence } from "./sentence.js";

export function reporterDemo(
  opts: Partial<RelinkaOptions & { fancy: boolean }>,
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
