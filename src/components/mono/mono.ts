import type { TSchema, Static } from "@sinclair/typebox";

import type { PromptOptions, PromptType } from "~/types/general.js";

import { confirmPrompt } from "~/components/confirm/confirm-main.js";
import { datePrompt } from "~/components/date/date.js";
import { textPrompt } from "~/components/input/text-main.js";
import { multiselectPrompt } from "~/components/multiselect/multi-select-two.js";
import { numMultiSelectPrompt } from "~/components/multiselect/num-multi-select.js";
import { nextStepsPrompt } from "~/components/next-steps/next-steps.js";
import { numberPrompt } from "~/components/number/number-main.js";
import { passwordPrompt } from "~/components/password/password-main.js";
import { numSelectPrompt } from "~/components/select/num-select.js";
import { selectPrompt } from "~/components/select/select-two.js";
import { endPrompt } from "~/components/st-end/end.js";
import { startPrompt } from "~/components/st-end/start.js";

export async function prompt<T extends TSchema>(
  options: PromptOptions<T> & {
    type: PromptType;
  },
): Promise<Record<(typeof options)["id"], Static<T>>> {
  const { type, id, action } = options;
  let value: any;

  switch (type) {
    case "start":
      await startPrompt(options);
      value = null;
      break;
    case "text":
      value = await textPrompt(options);
      break;
    case "number":
      value = await numberPrompt(options);
      break;
    case "confirm":
      value = await confirmPrompt(options);
      break;
    case "numSelect":
      value = await numSelectPrompt(options);
      break;
    // case "select":
    //   value = await selectPrompt(options);
    //   break;
    // case "multiSelect":
    //   value = await multiSelectPrompt(options);
    //   break;
    // case "numMultiSelect":
    //   value = await numMultiSelectPrompt(options);
    //   break;
    case "password":
      value = await passwordPrompt(options);
      break;
    case "date":
      value = await datePrompt({
        ...options,
        dateFormat: "DD/MM/YYYY",
        dateKind: "other",
      });
      break;
    case "nextSteps":
      await nextStepsPrompt(options);
      value = null;
      break;
    case "end":
      await endPrompt(options);
      value = null;
      break;
    default:
      throw new Error(`Unknown prompt type: ${type}`);
  }

  if (action) {
    await action();
  }

  return { [id]: value } as any;
}
