import type { Key, ReadLine } from "node:readline";
import type { Readable, Writable } from "node:stream";

import { stdin, stdout } from "node:process";
import readline from "node:readline";
import { WriteStream } from "node:tty";
import { cursor, erase } from "sisteransi";
import wrap from "wrap-ansi";

function diffLines(a: string, b: string) {
  if (a === b) {
    return;
  }

  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const diff: number[] = [];

  for (let i = 0; i < Math.max(aLines.length, bLines.length); i++) {
    if (aLines[i] !== bLines[i]) {
      diff.push(i);
    }
  }

  return diff;
}

const cancel = Symbol("rp:cancel");
export function isCancel(value: unknown): value is symbol {
  return value === cancel;
}

function setRawMode(input: Readable, value: boolean) {
  if ((input as typeof stdin).isTTY) {
    (input as typeof stdin).setRawMode(value);
  }
}

const aliases = new Map([
  ["k", "up"],
  ["j", "down"],
  ["h", "left"],
  ["l", "right"],
]);
const keys = new Set(["up", "down", "left", "right", "space", "enter"]);

export type PromptOptions<Self> = {
  render(this: Omit<Self, "prompt">): string | void;
  placeholder?: string;
  initialValue?: any;
  validate?: ((value: any) => string | void) | undefined;
  input?: Readable;
  output?: Writable;
  debug?: boolean;
};

export type StateDeprecated =
  | "initial"
  | "active"
  | "cancel"
  | "submit"
  | "error";

export function createPrompt(
  {
    render: renderFn,
    input = stdin,
    output = stdout,
    ...opts
  }: PromptOptions<any>,
  trackValue = true,
) {
  const _input = input;
  const _output = output;
  let _rl!: ReadLine;
  const _opts = opts;
  const _track = trackValue;
  let _cursor = 0;
  let state: StateDeprecated = "initial";
  let value: any = _opts.initialValue ?? "";
  let error = "";

  const subscribers = new Map<
    string,
    { cb: (...args: any[]) => any; once?: boolean }[]
  >();

  let _prevFrame = "";

  const self: any = {};

  const _render = () => renderFn.call(self);

  function prompt() {
    const sink = new WriteStream(0);
    sink._write = (chunk, encoding, done) => {
      if (_track) {
        value = _rl.line.replace(/\t/g, "");
        _cursor = _rl.cursor;
        emit("value", value);
      }
      done();
    };
    _input.pipe(sink);

    _rl = readline.createInterface({
      input: _input,
      output: sink,
      tabSize: 2,
      prompt: "",
      escapeCodeTimeout: 50,
    });
    readline.emitKeypressEvents(_input, _rl);
    _rl.prompt();
    if (_opts.initialValue !== undefined && _track) {
      _rl.write(_opts.initialValue);
    }

    _input.on("keypress", onKeypress);
    setRawMode(_input, true);
    _output.on("resize", render);

    render();

    return new Promise<string | symbol>((resolve) => {
      once("submit", () => {
        _output.write(cursor.show);
        _output.off("resize", render);
        setRawMode(_input, false);
        resolve(value);
      });
      once("cancel", () => {
        _output.write(cursor.show);
        _output.off("resize", render);
        setRawMode(_input, false);
        resolve(cancel);
      });
    });
  }

  function on(event: string, cb: (...args: any[]) => any) {
    const arr = subscribers.get(event) ?? [];
    arr.push({ cb });
    subscribers.set(event, arr);
  }

  function once(event: string, cb: (...args: any[]) => any) {
    const arr = subscribers.get(event) ?? [];
    arr.push({ cb, once: true });
    subscribers.set(event, arr);
  }

  function emit(event: string, ...data: any[]) {
    const cbs = subscribers.get(event) ?? [];
    const cleanup: (() => void)[] = [];
    for (const subscriber of cbs) {
      subscriber.cb(...data);
      if (subscriber.once) {
        cleanup.push(() => cbs.splice(cbs.indexOf(subscriber), 1));
      }
    }
    for (const cb of cleanup) {
      cb();
    }
  }

  function unsubscribe() {
    subscribers.clear();
  }

  function onKeypress(char: string, key?: Key) {
    if (state === "error") {
      state = "active";
    }
    if (key?.name && !_track && aliases.has(key.name)) {
      emit("cursor", aliases.get(key.name));
    }
    if (key?.name && keys.has(key.name)) {
      emit("cursor", key.name);
    }
    if (char && (char.toLowerCase() === "y" || char.toLowerCase() === "n")) {
      emit("confirm", char.toLowerCase() === "y");
    }
    if (char === "\t" && _opts.placeholder) {
      if (!value) {
        _rl.write(_opts.placeholder);
        emit("value", _opts.placeholder);
      }
    }
    if (char) {
      emit("key", char.toLowerCase());
    }

    if (key?.name === "return") {
      if (_opts.validate) {
        const problem = _opts.validate(value);
        if (problem) {
          error = problem;
          state = "error";
          _rl.write(value);
        }
      }
      if (state !== "error") {
        state = "submit";
      }
    }
    if (char === "\x03") {
      state = "cancel";
    }
    if (state === "submit" || state === "cancel") {
      emit("finalize");
    }
    render();
    if (state === "submit" || state === "cancel") {
      close();
    }
  }

  function close() {
    _input.unpipe();
    _input.removeListener("keypress", onKeypress);
    _output.write("\n");
    setRawMode(_input, false);
    _rl.close();
    emit(state, value);
    unsubscribe();
  }

  function restoreCursor() {
    const lines =
      wrap(_prevFrame, process.stdout.columns, { hard: true }).split("\n")
        .length - 1;
    _output.write(cursor.move(-999, lines * -1));
  }
  function render() {
    const frame = wrap(_render() || "", process.stdout.columns, {
      hard: true,
    });

    if (frame === _prevFrame) {
      return;
    }

    if (state === "initial") {
      _output.write(cursor.hide);
    } else {
      const diff = diffLines(_prevFrame, frame);
      restoreCursor();

      if (diff && diff.length === 1) {
        const diffLine = diff[0];
        _output.write(cursor.move(0, diffLine));
        _output.write(erase.lines(1));
        const lines = frame.split("\n");
        _output.write(lines[diffLine]);
        _prevFrame = frame;
        _output.write(cursor.move(0, lines.length - diffLine - 1));
        return;
      } else if (diff && diff.length > 1) {
        const diffLine = diff[0];
        _output.write(cursor.move(0, diffLine));
        _output.write(erase.down());
        const lines = frame.split("\n");
        const newLines = lines.slice(diffLine);
        _output.write(newLines.join("\n"));
        _prevFrame = frame;
        return;
      }

      _output.write(erase.down());
    }

    _output.write(frame);

    if (state === "initial") {
      state = "active";
    }

    _prevFrame = frame;
  }

  Object.assign(self, {
    prompt,
    on,
    once,
    emit,
    close,
    render,
    get state() {
      return state;
    },
    set state(val) {
      state = val;
    },
    get value() {
      return value;
    },
    set value(val) {
      value = val;
    },
    get error() {
      return error;
    },
    set error(val) {
      error = val;
    },
    _cursor,
    _track,
    _input,
    _output,
    _rl,
    _opts,
  });

  return self;
}
