import readline from "node:readline";

export function resetCursorAndClear(
  stream: NodeJS.WritableStream,
  x: number,
  y?: number,
  callback?: () => void,
) {
  readline.cursorTo(stream, x, y, callback);
  readline.clearScreenDown(stream, callback);
}

export function moveCursorAndClear(
  stream: NodeJS.WritableStream,
  dx: number,
  dy: number,
  callback?: () => void,
) {
  readline.moveCursor(stream, dx, dy, callback);
  readline.clearScreenDown(stream, callback);
}
