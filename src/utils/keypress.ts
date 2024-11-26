/* eslint-disable no-control-regex */
import type * as SafeBuffer from "safe-buffer";
import type { Readable } from "stream";
import type * as NodeStream from "stream";

import type { Keypress } from "~/types/keypress.js";

import { StringDecoder } from "./decoder.js";

// Regular expressions for parsing ANSI escape codes
// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
const metaKeyCodeRe = /^(?:\u001b)([a-zA-Z0-9])$/;
const functionKeyCodeRe =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
  /^(?:\u001b+)(O|N|\[|\[\[)(?:(\d+)(?:;(\d+))?([~^$])|(?:1;)?(\d+)?([a-zA-Z]))/;

/**
 * Parses a string input into a Keypress object or an array of Keypress objects.
 * @param s - The input string or buffer.
 * @param enc - The encoding (defaults to 'utf-8').
 * @returns A Keypress object or an array of Keypress objects.
 */
const parse = (
  s: string | Buffer,
  enc?: BufferEncoding,
): Keypress | Keypress[] => {
  let parts: RegExpExecArray | null;
  const key: Keypress = {
    name: undefined,
    ctrl: false,
    meta: false,
    shift: false,
    sequence: s.toString(enc || "utf-8"),
    raw: "",
  };

  if (Buffer.isBuffer(s)) {
    if (s[0] > 127 && s[1] === undefined) {
      s[0] -= 128;
      s = Buffer.from("\u001b" + s.toString(enc || "utf-8"));
    } else {
      s = s.toString(enc || "utf-8");
    }
  }

  const input = typeof s === "string" ? s : s.toString(enc || "utf-8");

  if (input === "\r") {
    key.name = "return";
  } else if (input === "\n") {
    key.name = "enter"; // enter key
  } else if (input === "\t") {
    key.name = "tab";
  } else if (
    input === "\b" ||
    input === "\x7f" ||
    input === "\u001b\x7f" ||
    input === "\u001b\b"
  ) {
    key.name = "backspace";
    key.meta = input.startsWith("\u001b");
  } else if (input === "\u001b" || input === "\u001b\u001b") {
    key.name = "escape";
    key.meta = input.length === 2;
  } else if (input === " " || input === "\u001b ") {
    key.name = "space";
    key.meta = input.length === 2;
  } else if (input <= "\u001a") {
    // ctrl+letter
    key.name = String.fromCharCode(input.charCodeAt(0) + "a".charCodeAt(0) - 1);
    key.ctrl = true;
  } else if (input.length === 1 && input >= "a" && input <= "z") {
    // lowercase letter
    key.name = input;
  } else if (input.length === 1 && input >= "A" && input <= "Z") {
    // shift+letter
    key.name = input.toLowerCase();
    key.shift = true;
  } else if ((parts = metaKeyCodeRe.exec(input))) {
    // meta+character key
    key.name = parts[1].toLowerCase();
    key.meta = true;
    key.shift = /^[A-Z]$/.test(parts[1]);
  } else if ((parts = functionKeyCodeRe.exec(input))) {
    // ansi escape sequence
    const code =
      (parts[1] || "") + (parts[2] || "") + (parts[4] || "") + (parts[6] || "");
    const modifier = parseInt(parts[3] || parts[5] || "1", 10) - 1 || 0;

    // Parse the key modifier
    key.ctrl = !!(modifier & 4);
    key.meta = !!(modifier & 10);
    key.shift = !!(modifier & 1);
    key.code = code;

    // Parse the key itself
    switch (code) {
      /* xterm/gnome ESC O letter */
      case "OP":
        key.name = "f1";
        break;
      case "OQ":
        key.name = "f2";
        break;
      case "OR":
        key.name = "f3";
        break;
      case "OS":
        key.name = "f4";
        break;

      /* xterm/rxvt ESC [ number ~ */
      case "[11~":
        key.name = "f1";
        break;
      case "[12~":
        key.name = "f2";
        break;
      case "[13~":
        key.name = "f3";
        break;
      case "[14~":
        key.name = "f4";
        break;

      /* from Cygwin and used in libuv */
      case "[[A":
        key.name = "f1";
        break;
      case "[[B":
        key.name = "f2";
        break;
      case "[[C":
        key.name = "f3";
        break;
      case "[[D":
        key.name = "f4";
        break;
      case "[[E":
        key.name = "f5";
        break;

      /* common */
      case "[15~":
        key.name = "f5";
        break;
      case "[17~":
        key.name = "f6";
        break;
      case "[18~":
        key.name = "f7";
        break;
      case "[19~":
        key.name = "f8";
        break;
      case "[20~":
        key.name = "f9";
        break;
      case "[21~":
        key.name = "f10";
        break;
      case "[23~":
        key.name = "f11";
        break;
      case "[24~":
        key.name = "f12";
        break;

      /* xterm ESC [ letter */
      case "[A":
        key.name = "up";
        break;
      case "[B":
        key.name = "down";
        break;
      case "[C":
        key.name = "right";
        break;
      case "[D":
        key.name = "left";
        break;
      case "[E":
        key.name = "clear";
        break;
      case "[F":
        key.name = "end";
        break;
      case "[H":
        key.name = "home";
        break;

      /* xterm/gnome ESC O letter */
      case "OA":
        key.name = "up";
        break;
      case "OB":
        key.name = "down";
        break;
      case "OC":
        key.name = "right";
        break;
      case "OD":
        key.name = "left";
        break;
      case "OE":
        key.name = "clear";
        break;
      case "OF":
        key.name = "end";
        break;
      case "OH":
        key.name = "home";
        break;

      /* xterm/rxvt ESC [ number ~ */
      case "[1~":
        key.name = "home";
        break;
      case "[2~":
        key.name = "insert";
        break;
      case "[3~":
        key.name = "delete";
        break;
      case "[4~":
        key.name = "end";
        break;
      case "[5~":
        key.name = "pageup";
        break;
      case "[6~":
        key.name = "pagedown";
        break;

      /* putty */
      case "[[5~":
        key.name = "pageup";
        break;
      case "[[6~":
        key.name = "pagedown";
        break;

      /* rxvt */
      case "[7~":
        key.name = "home";
        break;
      case "[8~":
        key.name = "end";
        break;

      /* rxvt keys with modifiers */
      case "[a":
        key.name = "up";
        key.shift = true;
        break;
      case "[b":
        key.name = "down";
        key.shift = true;
        break;
      case "[c":
        key.name = "right";
        key.shift = true;
        break;
      case "[d":
        key.name = "left";
        key.shift = true;
        break;
      case "[e":
        key.name = "clear";
        key.shift = true;
        break;

      case "[2$":
        key.name = "insert";
        key.shift = true;
        break;
      case "[3$":
        key.name = "delete";
        key.shift = true;
        break;
      case "[5$":
        key.name = "pageup";
        key.shift = true;
        break;
      case "[6$":
        key.name = "pagedown";
        key.shift = true;
        break;
      case "[7$":
        key.name = "home";
        key.shift = true;
        break;
      case "[8$":
        key.name = "end";
        key.shift = true;
        break;

      case "Oa":
        key.name = "up";
        key.ctrl = true;
        break;
      case "Ob":
        key.name = "down";
        key.ctrl = true;
        break;
      case "Oc":
        key.name = "right";
        key.ctrl = true;
        break;
      case "Od":
        key.name = "left";
        key.ctrl = true;
        break;
      case "Oe":
        key.name = "clear";
        key.ctrl = true;
        break;

      case "[2^":
        key.name = "insert";
        key.ctrl = true;
        break;
      case "[3^":
        key.name = "delete";
        key.ctrl = true;
        break;
      case "[5^":
        key.name = "pageup";
        key.ctrl = true;
        break;
      case "[6^":
        key.name = "pagedown";
        key.ctrl = true;
        break;
      case "[7^":
        key.name = "home";
        key.ctrl = true;
        break;
      case "[8^":
        key.name = "end";
        key.ctrl = true;
        break;

      /* misc. */
      case "[Z":
        key.name = "tab";
        key.shift = true;
        break;
      default:
        key.name = "undefined";
        break;
    }
  } else if (input.length > 1 && !input.startsWith("\u001b")) {
    // Got a longer-than-one string of characters.
    // Probably a paste, since it wasn't a control sequence.
    return Array.from(input)
      .map((c) => parse(c, enc))
      .flat();
  }

  key.raw = input;
  return key;
};

/**
 * Listen for keypress events on a given stream
 * @param stream - The input stream (e.g., process.stdin)
 * @param callback - The callback to execute on keypress
 * @returns A function to remove the keypress listener
 */
const listenForKeys = (
  stream: Readable,
  callback: (key: Keypress) => void,
): (() => void) => {
  if (!stream || typeof (stream as any).isRaw !== "boolean") {
    throw new Error("Invalid stream passed.");
  }
  if (typeof callback !== "function") {
    throw new Error("Invalid callback passed.");
  }

  const decoder = new StringDecoder("utf8");
  const onData = (raw: SafeBuffer.Buffer) => {
    const data = decoder.write(raw);
    const keys = parse(data, "utf8");

    if (Array.isArray(keys)) {
      keys.forEach((key) => callback(key));
    } else {
      callback(keys);
    }
  };

  const oldRawMode = (stream as any).isRaw;
  (stream as any).setRawMode(true);
  stream.on("data", onData);
  stream.resume();

  const stopListening = () => {
    (stream as any).setRawMode(oldRawMode);
    stream.pause();
    stream.removeListener("data", onData);
  };
  return stopListening;
};

// Attach the parse function for external access if needed
listenForKeys.parse = parse;

export default listenForKeys;
