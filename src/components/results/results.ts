import type { Static } from "@sinclair/typebox";

import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

import { msg } from "~/utils/messages.js";

const ResultsSchema = Type.Object({
  username: Type.String(),
});
type ResultsType = Static<typeof ResultsSchema>;

export async function promptsDisplayResults({
  results,
  inline = true,
}: {
  results: ResultsType;
  inline?: boolean;
}): Promise<void> {
  if (!Value.Check(ResultsSchema, results)) {
    throw new Error("Invalid results structure.");
  }

  const title = "Your input results:";

  if (inline) {
    const formattedResults = Object.entries(results)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    msg({
      type: "M_INFO",
      title,
      content: formattedResults,
      titleColor: "cyan",
      contentColor: "dim",
    });
  } else {
    const formattedResults = JSON.stringify(results, null, 2);
    msg({
      type: "M_INFO",
      title,
      content: formattedResults,
      titleColor: "cyan",
      contentColor: "dim",
    });
  }
}
