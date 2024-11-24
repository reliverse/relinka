// @ts-nocheck

import tree from "tree-kit";
import xterm256 from "./xterm-256color.js";

// @ts-nocheck
const esc = tree.extend(null, Object.create(xterm256.esc), {
  // Not supported...
  setClipboardLL: { na: true },
  requestClipboard: { na: true },

  // Cursor styles

  // Cursor styles not supported
  blockCursor: { on: "", na: true },
  blinkingBlockCursor: { on: "", na: true },
  underlineCursor: { on: "", na: true },
  blinkingUnderlineCursor: { on: "", na: true },
  beamCursor: { on: "", na: true },
  blinkingBeamCursor: { on: "", na: true },
});

const keymap = Object.create(xterm256.keymap);
const handler = Object.create(xterm256.handler);

export default {
  esc: esc,
  keymap: keymap,
  handler: handler,
  support: {
    deltaEscapeSequence: true,
    "256colors": false,
    "24bitsColors": false, // DEPRECATED
    trueColor: false,
  },
  colorRegister: require("../colorScheme/xfce.json"),
};
