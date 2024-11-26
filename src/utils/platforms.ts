import process from "node:process";

const platforms = {
  linux: process.platform !== "win32",
  win32: process.platform === "win32",
};

const terminals = {
  linuxConsoleKernel: process.env.TERM !== "linux",
  windowsTerminal: Boolean(process.env.WT_SESSION),
  terminusSublimeOld: Boolean(process.env.TERMINUS_SUBLIME),
  cmderTerminal: process.env.ConEmuTask === "{cmd::Cmder}",
  terminusSublimeNew: process.env.TERM_PROGRAM === "Terminus-Sublime",
  visualStudioCode: process.env.TERM_PROGRAM === "vscode",
  xterm256color: process.env.TERM === "xterm-256color",
  alacrittyTerminal: process.env.TERM === "alacritty",
  jetbrainsJediTerm: process.env.TERMINAL_EMULATOR === "JetBrains-JediTerm",
};

export function isUnicodeSupported() {
  if (platforms.linux) {
    return terminals.linuxConsoleKernel;
  }
  return (
    terminals.windowsTerminal ||
    terminals.terminusSublimeOld ||
    terminals.cmderTerminal ||
    terminals.terminusSublimeNew ||
    terminals.visualStudioCode ||
    terminals.xterm256color ||
    terminals.alacrittyTerminal ||
    terminals.jetbrainsJediTerm
  );
}
