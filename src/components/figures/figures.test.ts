import { vi, it, expect, afterAll } from "vitest";

afterAll(() => {
  vi.unstubAllEnvs();
});

it("falls back to ascii figures when unicode is not supported", async () => {
  const { default: unicodeFigures } = await import(
    "~/components/figures/index.js"
  );
  vi.resetModules().stubEnv("TERM", "linux");
  const { default: asciiFigures } = await import(
    "~/components/figures/index.js"
  );

  expect(asciiFigures.checkboxOn).not.toEqual(unicodeFigures.checkboxOn);

  expect(unicodeFigures).toMatchInlineSnapshot(`
    {
      "almostEqual": "≈",
      "arrowDown": "↓",
      "arrowLeft": "←",
      "arrowLeftRight": "↔",
      "arrowRight": "→",
      "arrowUp": "↑",
      "arrowUpDown": "↕",
      "bullet": "●",
      "checkboxCircleOff": "Ⓘ",
      "checkboxCircleOn": "ⓧ",
      "checkboxOff": "☐",
      "checkboxOn": "☒",
      "circle": "◯",
      "circleCircle": "ⓞ",
      "circleCross": "ⓧ",
      "circleDotted": "◌",
      "circleDouble": "◎",
      "circleFilled": "◉",
      "circlePipe": "Ⓘ",
      "circleQuestionMark": "(?)",
      "cross": "✘",
      "dot": "․",
      "ellipsis": "…",
      "fiveEighths": "⅝",
      "fiveSixths": "⅚",
      "fourFifths": "⅘",
      "greaterOrEqual": "≥",
      "hamburger": "☰",
      "heart": "♥",
      "home": "⌂",
      "identical": "≡",
      "infinity": "∞",
      "info": "ℹ",
      "lessOrEqual": "≤",
      "line": "─",
      "lineBackslash": "╲",
      "lineBold": "━",
      "lineCross": "╳",
      "lineDashed0": "┄",
      "lineDashed1": "┅",
      "lineDashed10": "╼",
      "lineDashed11": "╾",
      "lineDashed12": "−",
      "lineDashed13": "–",
      "lineDashed14": "‐",
      "lineDashed15": "⁃",
      "lineDashed2": "┈",
      "lineDashed3": "┉",
      "lineDashed4": "╌",
      "lineDashed5": "╍",
      "lineDashed6": "╴",
      "lineDashed7": "╶",
      "lineDashed8": "╸",
      "lineDashed9": "╺",
      "lineDouble": "═",
      "lineDownBoldLeft": "┒",
      "lineDownBoldLeftBold": "┓",
      "lineDownBoldLeftBoldRight": "┱",
      "lineDownBoldLeftBoldRightBold": "┳",
      "lineDownBoldLeftRight": "┰",
      "lineDownBoldLeftRightBold": "┲",
      "lineDownBoldRight": "┎",
      "lineDownBoldRightBold": "┏",
      "lineDownDoubleLeft": "╖",
      "lineDownDoubleLeftDouble": "╗",
      "lineDownDoubleLeftDoubleRightDouble": "╦",
      "lineDownDoubleLeftRight": "╥",
      "lineDownDoubleRight": "╓",
      "lineDownDoubleRightDouble": "╔",
      "lineDownLeft": "┐",
      "lineDownLeftArc": "╮",
      "lineDownLeftBold": "┑",
      "lineDownLeftBoldRight": "┭",
      "lineDownLeftBoldRightBold": "┯",
      "lineDownLeftDouble": "╕",
      "lineDownLeftDoubleRightDouble": "╤",
      "lineDownLeftRight": "┬",
      "lineDownLeftRightBold": "┮",
      "lineDownRight": "┌",
      "lineDownRightArc": "╭",
      "lineDownRightBold": "┍",
      "lineDownRightDouble": "╒",
      "lineSlash": "╱",
      "lineUpBoldDownBoldLeft": "┨",
      "lineUpBoldDownBoldLeftBold": "┫",
      "lineUpBoldDownBoldLeftBoldRight": "╉",
      "lineUpBoldDownBoldLeftBoldRightBold": "╋",
      "lineUpBoldDownBoldLeftRight": "╂",
      "lineUpBoldDownBoldLeftRightBold": "╊",
      "lineUpBoldDownBoldRight": "┠",
      "lineUpBoldDownBoldRightBold": "┣",
      "lineUpBoldDownLeft": "┦",
      "lineUpBoldDownLeftBold": "┩",
      "lineUpBoldDownLeftBoldRight": "╃",
      "lineUpBoldDownLeftBoldRightBold": "╇",
      "lineUpBoldDownLeftRight": "╀",
      "lineUpBoldDownLeftRightBold": "╄",
      "lineUpBoldDownRight": "┞",
      "lineUpBoldDownRightBold": "┡",
      "lineUpBoldLeft": "┚",
      "lineUpBoldLeftBold": "┛",
      "lineUpBoldLeftBoldRight": "┹",
      "lineUpBoldLeftBoldRightBold": "┻",
      "lineUpBoldLeftRight": "┸",
      "lineUpBoldLeftRightBold": "┺",
      "lineUpBoldRight": "┖",
      "lineUpBoldRightBold": "┗",
      "lineUpDoubleDownDoubleLeft": "╢",
      "lineUpDoubleDownDoubleLeftDouble": "╣",
      "lineUpDoubleDownDoubleLeftDoubleRightDouble": "╬",
      "lineUpDoubleDownDoubleLeftRight": "╫",
      "lineUpDoubleDownDoubleRight": "╟",
      "lineUpDoubleDownDoubleRightDouble": "╠",
      "lineUpDoubleLeft": "╜",
      "lineUpDoubleLeftDouble": "╝",
      "lineUpDoubleLeftDoubleRightDouble": "╩",
      "lineUpDoubleLeftRight": "╨",
      "lineUpDoubleRight": "╙",
      "lineUpDoubleRightDouble": "╚",
      "lineUpDownBoldLeft": "┧",
      "lineUpDownBoldLeftBold": "┪",
      "lineUpDownBoldLeftBoldRight": "╅",
      "lineUpDownBoldLeftBoldRightBold": "╈",
      "lineUpDownBoldLeftRight": "╁",
      "lineUpDownBoldLeftRightBold": "╆",
      "lineUpDownBoldRight": "┟",
      "lineUpDownBoldRightBold": "┢",
      "lineUpDownLeft": "┤",
      "lineUpDownLeftBold": "┥",
      "lineUpDownLeftBoldRight": "┽",
      "lineUpDownLeftBoldRightBold": "┿",
      "lineUpDownLeftDouble": "╡",
      "lineUpDownLeftDoubleRightDouble": "╪",
      "lineUpDownLeftRight": "┼",
      "lineUpDownLeftRightBold": "┾",
      "lineUpDownRight": "├",
      "lineUpDownRightBold": "┝",
      "lineUpDownRightDouble": "╞",
      "lineUpLeft": "┘",
      "lineUpLeftArc": "╯",
      "lineUpLeftBold": "┙",
      "lineUpLeftBoldRight": "┵",
      "lineUpLeftBoldRightBold": "┷",
      "lineUpLeftDouble": "╛",
      "lineUpLeftDoubleRightDouble": "╧",
      "lineUpLeftRight": "┴",
      "lineUpLeftRightBold": "┶",
      "lineUpRight": "└",
      "lineUpRightArc": "╰",
      "lineUpRightBold": "┕",
      "lineUpRightDouble": "╘",
      "lineVertical": "│",
      "lineVerticalBold": "┃",
      "lineVerticalDashed0": "┆",
      "lineVerticalDashed1": "┇",
      "lineVerticalDashed10": "╽",
      "lineVerticalDashed11": "╿",
      "lineVerticalDashed2": "┊",
      "lineVerticalDashed3": "┋",
      "lineVerticalDashed4": "╎",
      "lineVerticalDashed5": "╏",
      "lineVerticalDashed6": "╵",
      "lineVerticalDashed7": "╷",
      "lineVerticalDashed8": "╹",
      "lineVerticalDashed9": "╻",
      "lineVerticalDouble": "║",
      "lozenge": "◆",
      "lozengeOutline": "◇",
      "musicNote": "♪",
      "musicNoteBeamed": "♫",
      "mustache": "෴",
      "nodejs": "⬢",
      "notEqual": "≠",
      "oneEighth": "⅛",
      "oneFifth": "⅕",
      "oneHalf": "½",
      "oneNinth": "⅑",
      "oneQuarter": "¼",
      "oneSeventh": "⅐",
      "oneSixth": "⅙",
      "oneTenth": "⅒",
      "oneThird": "⅓",
      "play": "▶",
      "pointer": "❯",
      "pointerSmall": "›",
      "questionMarkPrefix": "(?)",
      "radioOff": "◯",
      "radioOn": "◉",
      "sevenEighths": "⅞",
      "smiley": "㋡",
      "square": "█",
      "squareBottom": "▄",
      "squareCenter": "■",
      "squareDarkShade": "▓",
      "squareLeft": "▌",
      "squareLightShade": "░",
      "squareMediumShade": "▒",
      "squareRight": "▐",
      "squareSmall": "◻",
      "squareSmallFilled": "◼",
      "squareTop": "▀",
      "star": "★",
      "subscriptEight": "₈",
      "subscriptFive": "₅",
      "subscriptFour": "₄",
      "subscriptNine": "₉",
      "subscriptOne": "₁",
      "subscriptSeven": "₇",
      "subscriptSix": "₆",
      "subscriptThree": "₃",
      "subscriptTwo": "₂",
      "subscriptZero": "₀",
      "threeEighths": "⅜",
      "threeFifths": "⅗",
      "threeQuarters": "¾",
      "tick": "✔",
      "triangleDown": "▼",
      "triangleDownSmall": "▾",
      "triangleLeft": "◀",
      "triangleLeftSmall": "◂",
      "triangleRight": "▶",
      "triangleRightSmall": "▸",
      "triangleUp": "▲",
      "triangleUpOutline": "△",
      "triangleUpSmall": "▴",
      "twoFifths": "⅖",
      "twoThirds": "⅔",
      "warning": "⚠",
    }
  `);

  expect(asciiFigures).toMatchInlineSnapshot(`
    {
      "almostEqual": "≈",
      "arrowDown": "↓",
      "arrowLeft": "←",
      "arrowLeftRight": "↔",
      "arrowRight": "→",
      "arrowUp": "↑",
      "arrowUpDown": "↕",
      "bullet": "●",
      "checkboxCircleOff": "( )",
      "checkboxCircleOn": "(×)",
      "checkboxOff": "[ ]",
      "checkboxOn": "[×]",
      "circle": "( )",
      "circleCircle": "(○)",
      "circleCross": "(×)",
      "circleDotted": "( )",
      "circleDouble": "( )",
      "circleFilled": "(*)",
      "circlePipe": "(│)",
      "circleQuestionMark": "(?)",
      "cross": "×",
      "dot": "․",
      "ellipsis": "…",
      "fiveEighths": "⅝",
      "fiveSixths": "⅚",
      "fourFifths": "⅘",
      "greaterOrEqual": "≥",
      "hamburger": "≡",
      "heart": "♥",
      "home": "⌂",
      "identical": "≡",
      "infinity": "∞",
      "info": "i",
      "lessOrEqual": "≤",
      "line": "─",
      "lineBackslash": "╲",
      "lineBold": "━",
      "lineCross": "╳",
      "lineDashed0": "┄",
      "lineDashed1": "┅",
      "lineDashed10": "╼",
      "lineDashed11": "╾",
      "lineDashed12": "−",
      "lineDashed13": "–",
      "lineDashed14": "‐",
      "lineDashed15": "⁃",
      "lineDashed2": "┈",
      "lineDashed3": "┉",
      "lineDashed4": "╌",
      "lineDashed5": "╍",
      "lineDashed6": "╴",
      "lineDashed7": "╶",
      "lineDashed8": "╸",
      "lineDashed9": "╺",
      "lineDouble": "═",
      "lineDownBoldLeft": "┒",
      "lineDownBoldLeftBold": "┓",
      "lineDownBoldLeftBoldRight": "┱",
      "lineDownBoldLeftBoldRightBold": "┳",
      "lineDownBoldLeftRight": "┰",
      "lineDownBoldLeftRightBold": "┲",
      "lineDownBoldRight": "┎",
      "lineDownBoldRightBold": "┏",
      "lineDownDoubleLeft": "╖",
      "lineDownDoubleLeftDouble": "╗",
      "lineDownDoubleLeftDoubleRightDouble": "╦",
      "lineDownDoubleLeftRight": "╥",
      "lineDownDoubleRight": "╓",
      "lineDownDoubleRightDouble": "╔",
      "lineDownLeft": "┐",
      "lineDownLeftArc": "╮",
      "lineDownLeftBold": "┑",
      "lineDownLeftBoldRight": "┭",
      "lineDownLeftBoldRightBold": "┯",
      "lineDownLeftDouble": "╕",
      "lineDownLeftDoubleRightDouble": "╤",
      "lineDownLeftRight": "┬",
      "lineDownLeftRightBold": "┮",
      "lineDownRight": "┌",
      "lineDownRightArc": "╭",
      "lineDownRightBold": "┍",
      "lineDownRightDouble": "╒",
      "lineSlash": "╱",
      "lineUpBoldDownBoldLeft": "┨",
      "lineUpBoldDownBoldLeftBold": "┫",
      "lineUpBoldDownBoldLeftBoldRight": "╉",
      "lineUpBoldDownBoldLeftBoldRightBold": "╋",
      "lineUpBoldDownBoldLeftRight": "╂",
      "lineUpBoldDownBoldLeftRightBold": "╊",
      "lineUpBoldDownBoldRight": "┠",
      "lineUpBoldDownBoldRightBold": "┣",
      "lineUpBoldDownLeft": "┦",
      "lineUpBoldDownLeftBold": "┩",
      "lineUpBoldDownLeftBoldRight": "╃",
      "lineUpBoldDownLeftBoldRightBold": "╇",
      "lineUpBoldDownLeftRight": "╀",
      "lineUpBoldDownLeftRightBold": "╄",
      "lineUpBoldDownRight": "┞",
      "lineUpBoldDownRightBold": "┡",
      "lineUpBoldLeft": "┚",
      "lineUpBoldLeftBold": "┛",
      "lineUpBoldLeftBoldRight": "┹",
      "lineUpBoldLeftBoldRightBold": "┻",
      "lineUpBoldLeftRight": "┸",
      "lineUpBoldLeftRightBold": "┺",
      "lineUpBoldRight": "┖",
      "lineUpBoldRightBold": "┗",
      "lineUpDoubleDownDoubleLeft": "╢",
      "lineUpDoubleDownDoubleLeftDouble": "╣",
      "lineUpDoubleDownDoubleLeftDoubleRightDouble": "╬",
      "lineUpDoubleDownDoubleLeftRight": "╫",
      "lineUpDoubleDownDoubleRight": "╟",
      "lineUpDoubleDownDoubleRightDouble": "╠",
      "lineUpDoubleLeft": "╜",
      "lineUpDoubleLeftDouble": "╝",
      "lineUpDoubleLeftDoubleRightDouble": "╩",
      "lineUpDoubleLeftRight": "╨",
      "lineUpDoubleRight": "╙",
      "lineUpDoubleRightDouble": "╚",
      "lineUpDownBoldLeft": "┧",
      "lineUpDownBoldLeftBold": "┪",
      "lineUpDownBoldLeftBoldRight": "╅",
      "lineUpDownBoldLeftBoldRightBold": "╈",
      "lineUpDownBoldLeftRight": "╁",
      "lineUpDownBoldLeftRightBold": "╆",
      "lineUpDownBoldRight": "┟",
      "lineUpDownBoldRightBold": "┢",
      "lineUpDownLeft": "┤",
      "lineUpDownLeftBold": "┥",
      "lineUpDownLeftBoldRight": "┽",
      "lineUpDownLeftBoldRightBold": "┿",
      "lineUpDownLeftDouble": "╡",
      "lineUpDownLeftDoubleRightDouble": "╪",
      "lineUpDownLeftRight": "┼",
      "lineUpDownLeftRightBold": "┾",
      "lineUpDownRight": "├",
      "lineUpDownRightBold": "┝",
      "lineUpDownRightDouble": "╞",
      "lineUpLeft": "┘",
      "lineUpLeftArc": "╯",
      "lineUpLeftBold": "┙",
      "lineUpLeftBoldRight": "┵",
      "lineUpLeftBoldRightBold": "┷",
      "lineUpLeftDouble": "╛",
      "lineUpLeftDoubleRightDouble": "╧",
      "lineUpLeftRight": "┴",
      "lineUpLeftRightBold": "┶",
      "lineUpRight": "└",
      "lineUpRightArc": "╰",
      "lineUpRightBold": "┕",
      "lineUpRightDouble": "╘",
      "lineVertical": "│",
      "lineVerticalBold": "┃",
      "lineVerticalDashed0": "┆",
      "lineVerticalDashed1": "┇",
      "lineVerticalDashed10": "╽",
      "lineVerticalDashed11": "╿",
      "lineVerticalDashed2": "┊",
      "lineVerticalDashed3": "┋",
      "lineVerticalDashed4": "╎",
      "lineVerticalDashed5": "╏",
      "lineVerticalDashed6": "╵",
      "lineVerticalDashed7": "╷",
      "lineVerticalDashed8": "╹",
      "lineVerticalDashed9": "╻",
      "lineVerticalDouble": "║",
      "lozenge": "♦",
      "lozengeOutline": "◊",
      "musicNote": "♪",
      "musicNoteBeamed": "♫",
      "mustache": "┌─┐",
      "nodejs": "♦",
      "notEqual": "≠",
      "oneEighth": "⅛",
      "oneFifth": "⅕",
      "oneHalf": "½",
      "oneNinth": "1/9",
      "oneQuarter": "¼",
      "oneSeventh": "1/7",
      "oneSixth": "⅙",
      "oneTenth": "1/10",
      "oneThird": "⅓",
      "play": "►",
      "pointer": ">",
      "pointerSmall": "›",
      "questionMarkPrefix": "(?)",
      "radioOff": "( )",
      "radioOn": "(*)",
      "sevenEighths": "⅞",
      "smiley": "☺",
      "square": "█",
      "squareBottom": "▄",
      "squareCenter": "■",
      "squareDarkShade": "▓",
      "squareLeft": "▌",
      "squareLightShade": "░",
      "squareMediumShade": "▒",
      "squareRight": "▐",
      "squareSmall": "□",
      "squareSmallFilled": "■",
      "squareTop": "▀",
      "star": "✶",
      "subscriptEight": "₈",
      "subscriptFive": "₅",
      "subscriptFour": "₄",
      "subscriptNine": "₉",
      "subscriptOne": "₁",
      "subscriptSeven": "₇",
      "subscriptSix": "₆",
      "subscriptThree": "₃",
      "subscriptTwo": "₂",
      "subscriptZero": "₀",
      "threeEighths": "⅜",
      "threeFifths": "⅗",
      "threeQuarters": "¾",
      "tick": "√",
      "triangleDown": "▼",
      "triangleDownSmall": "▾",
      "triangleLeft": "◄",
      "triangleLeftSmall": "◂",
      "triangleRight": "►",
      "triangleRightSmall": "▸",
      "triangleUp": "▲",
      "triangleUpOutline": "∆",
      "triangleUpSmall": "▴",
      "twoFifths": "⅖",
      "twoThirds": "⅔",
      "warning": "‼",
    }
  `);
});
