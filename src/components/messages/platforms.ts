import { env, isWindows, isLinux, isMacOS } from "std-env";

/**
 * Determines if Unicode is supported in the current terminal.
 * @returns {boolean} True if Unicode is supported, false otherwise.
 */
export function isUnicodeSupported(): boolean {
  if (isLinux) {
    return env["TERM"] !== "linux";
  }
  return (
    env["WT_SESSION"] !== undefined ||
    env["TERMINUS_SUBLIME"] !== undefined ||
    env["ConEmuTask"] === "{cmd::Cmder}" ||
    env["TERM_PROGRAM"] === "Terminus-Sublime" ||
    env["TERM_PROGRAM"] === "vscode" ||
    env["TERM"] === "xterm-256color" ||
    env["TERM"] === "alacritty" ||
    env["TERMINAL_EMULATOR"] === "JetBrains-JediTerm"
  );
}

/**
 * Determines the current terminal name based on environment variables.
 * @returns {string} The name of the current terminal or "Unknown" if it cannot be determined.
 */
export function getCurrentTerminalName(): string {
  const termProgram = env["TERM_PROGRAM"];
  const term = env["TERM"];
  const terminalEmulator = env["TERMINAL_EMULATOR"];

  if (termProgram) {
    switch (termProgram.toLowerCase()) {
      case "vscode":
        return "VSCode Terminal";
      case "terminus-sublime":
        return "Terminus Sublime";
      case "hyper":
        return "Hyper";
      case "iterm.app":
      case "iterm":
        return "iTerm2";
      case "alacritty":
        return "Alacritty";
      case "wezterm":
        return "WezTerm";
      case "terminus":
        return "Terminus";
      default:
        return `TERM_PROGRAM: ${termProgram}`;
    }
  }

  if (terminalEmulator) {
    switch (terminalEmulator.toLowerCase()) {
      case "jetbrains-jediterm":
        return "JetBrains JediTerm";
      case "cmder":
        return "Cmder";
      case "conemu":
        return "ConEmu";
      default:
        return `TERMINAL_EMULATOR: ${terminalEmulator}`;
    }
  }

  if (term) {
    switch (term.toLowerCase()) {
      case "xterm-256color":
        return "Xterm 256 Color";
      case "alacritty":
        return "Alacritty";
      case "xterm":
        return "Xterm";
      case "linux":
        return "Linux Console Kernel";
      default:
        return `TERM: ${term}`;
    }
  }

  // Fallback based on platform if terminal cannot be determined
  if (isWindows) {
    return "Windows Terminal";
  } else if (isMacOS) {
    return "macOS Terminal";
  } else if (isLinux) {
    return "Linux Terminal";
  }

  return "Unknown Terminal";
}
