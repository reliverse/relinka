import { expect, test, describe, beforeEach } from "bun:test";

import {
  re,
  colorize,
  getColor,
  setColorLevel,
  configure,
  rgb,
  colorSupport,
} from "./relico.js";

describe("relico", () => {
  // Reset color level before each test
  beforeEach(() => {
    setColorLevel(3); // Set to full color support for testing
  });

  describe("basic color functions", () => {
    test("re.red adds red color codes", () => {
      expect(re.red("test")).toContain("\x1b[");
      expect(re.red("test")).toContain("m");
    });

    test("re.blue adds blue color codes", () => {
      expect(re.blue("test")).toContain("\x1b[");
      expect(re.blue("test")).toContain("m");
    });

    test("multiple colors can be nested", () => {
      const result = re.red(re.bold("test"));
      expect(result).toContain("\x1b[1m"); // bold
      expect(result).toContain("\x1b[31m"); // red
    });
  });

  describe("color support levels", () => {
    test("level 0 disables all colors", () => {
      setColorLevel(0);
      expect(re.red("test")).toBe("test");
      expect(re.blue("test")).toBe("test");
      expect(re.bold("test")).toBe("test");
    });

    test("level 3 enables full colors", () => {
      setColorLevel(3);
      expect(re.red("test")).not.toBe("test");
      expect(re.blue("test")).not.toBe("test");
    });
  });

  describe("colorize function", () => {
    test("colorize works with valid color names", () => {
      expect(colorize("red", "test")).toBe(re.red("test"));
      expect(colorize("blue", "test")).toBe(re.blue("test"));
    });

    test("colorize falls back to reset for invalid colors", () => {
      expect(colorize("invalidColor", "test")).toBe(re.reset("test"));
    });
  });

  describe("getColor function", () => {
    test("getColor returns color function for valid names", () => {
      const redFn = getColor("red");
      expect(redFn("test")).toBe(re.red("test"));
    });

    test("getColor returns reset function for invalid names", () => {
      const invalidFn = getColor("invalidColor");
      expect(invalidFn("test")).toBe(re.reset("test"));
    });
  });

  describe("rgb function", () => {
    test("rgb creates custom color with level 3", () => {
      setColorLevel(3);
      const customColor = rgb(255, 100, 50);
      expect(customColor("test")).toContain("38;2;255;100;50");
    });

    test("rgb returns identity function with level < 3", () => {
      setColorLevel(2);
      const customColor = rgb(255, 100, 50);
      expect(customColor("test")).toBe("test");
    });
  });

  describe("configuration", () => {
    test("configure accepts valid config", () => {
      configure({ colorLevel: 2 });
      expect(re.red("test")).not.toBe("test");
    });

    test("configure handles invalid config gracefully", () => {
      setColorLevel(3); // Ensure we start with color support
      const beforeConfig = re.red("test");
      configure({ colorLevel: 999 }); // Invalid level
      const afterConfig = re.red("test");
      expect(afterConfig).toBe("test"); // Should fall back to no colors (level 0)
      expect(afterConfig).not.toBe(beforeConfig); // Should be different from before
    });
  });

  describe("color support info", () => {
    test("colorSupport provides correct information", () => {
      expect(colorSupport).toHaveProperty("isColorSupported");
      expect(colorSupport).toHaveProperty("isForced");
      expect(colorSupport).toHaveProperty("isDisabled");
      expect(colorSupport).toHaveProperty("terminalName");
    });
  });
});
