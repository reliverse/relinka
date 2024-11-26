import type { PromptOptions } from "~/types/general.js";

import { animateText } from "~/components/visual/animate/animate.js";
import { msg } from "~/utils/messages.js";

export async function endPrompt({
  title,
  titleColor = "cyanBright",
  
  titleTypography = "bold",
  titleVariant,
  titleAnimation,
  titleAnimationDelay,
  border = true,
  borderColor = "viceGradient",
}: PromptOptions): Promise<void> {
  if (titleAnimation) {
    await animateText({
      title,
      anim: titleAnimation,
      delay: titleAnimationDelay,
      type: "M_END",
      titleColor,
      titleTypography,
      border,
      borderColor,
    });
  } else {
    msg({
      type: "M_END",
      title,
      titleColor,
      titleTypography,
      titleVariant,
      border,
      borderColor,
    });
  }
}
