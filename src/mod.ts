export type {
  RelinkaSpecialDirsConfig,
  RelinkaDirsConfig,
  LogLevelConfig,
  LogLevelsConfig,
  LogLevel,
  RelinkaConfig,
  LogFileInfo,
} from "./impl.js";
export {
  relinkaConfig,
  relinkaShutdown,
  flushAllLogBuffers,
  shouldNeverHappen,
  truncateString,
  casesHandled,
  relinka,
  relinkaAsync,
  defineConfig,
} from "./impl.js";
