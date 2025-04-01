export type {
  LogLevelDeprecated,
  LogTypeDeprecated,
} from "./core-impl/deprecated/components/levels/levels.js";
export {
  LogLevelsDeprecated,
  LogTypesDeprecated,
} from "./core-impl/deprecated/components/levels/levels.js";
export {
  createRelinkaBaseDeprecated,
  relinkaBasicDeprecated,
} from "./core-impl/deprecated/components/modes/basic.js";
export {
  createRelinkaBrowserDeprecatedDeprecated,
  relinkaBrowserDeprecated,
} from "./core-impl/deprecated/components/modes/browser.js";
export { relinkaDeprecated } from "./core-impl/deprecated/components/relinka-deprecated/logger.js";
export {
  createRelinkaSharedDeprecated,
  relinkaInstanceDeprecated,
} from "./core-impl/deprecated/components/relinka-deprecated/mod.js";
export type {
  LogFn,
  RelinkaInstanceDeprecated,
} from "./core-impl/deprecated/components/relinka-deprecated/relinka.js";
export {
  RelinkaInterface,
  createRelinkaDeprecated,
} from "./core-impl/deprecated/components/relinka-deprecated/relinka.js";
export { BasicReporter } from "./core-impl/deprecated/components/reporters/basic.js";
export { BrowserReporter } from "./core-impl/deprecated/components/reporters/browser.js";
export {
  TYPE_COLOR_MAP,
  LEVEL_COLOR_MAP,
  FancyReporter,
} from "./core-impl/deprecated/components/reporters/fancy.js";
export type {
  RelinkaOptions,
  FormatOptions,
  InputLogObject,
  LogObject,
  RelinkaReporter,
} from "./core-types.js";
export type {
  BoxBorderStyle,
  BoxStyle,
  BoxOpts,
} from "./core-impl/deprecated/utils/box.js";
export { box } from "./core-impl/deprecated/utils/box.js";
export type {
  ColorName,
  ColorFunction,
} from "./core-impl/deprecated/utils/deprecatedColors.js";
export {
  colors,
  getColor,
  colorize,
} from "./core-impl/deprecated/utils/deprecatedColors.js";
export { parseStack } from "./core-impl/deprecated/utils/error.js";
export {
  compileFormat,
  formatString,
} from "./core-impl/deprecated/utils/format.js";
export { isPlainObject, isLogObj } from "./core-impl/deprecated/utils/log.js";
export { writeStream } from "./core-impl/deprecated/utils/stream.js";
export {
  stripAnsi,
  centerAlign,
  rightAlign,
  leftAlign,
  align,
} from "./core-impl/deprecated/utils/string.js";
export type {
  TreeItemObject,
  TreeItem,
  TreeOptions,
} from "./core-impl/deprecated/utils/tree.js";
export { formatTree } from "./core-impl/deprecated/utils/tree.js";
