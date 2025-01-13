import { describe, test, expect } from "vitest";

import type { RelinkaReporter, LogObject } from "~/types/mod.js";

import { LogLevels, createRelinka } from "~/components/relinka/mod.js";

describe("relinka", () => {
  test("can set level", () => {
    const relinka = createRelinka();
    expect(relinka.level).toBe(1);

    for (let i = 0; i <= 5; i++) {
      relinka.level = i;
      expect(relinka.level).toBe(i);
    }
  });

  test("silent log level does't print logs", async () => {
    const logs: LogObject[] = [];
    const TestReporter: RelinkaReporter = {
      log(logObj) {
        logs.push(logObj);
      },
    };

    const relinka = createRelinka({
      throttle: 100,
      level: LogLevels.silent,
      reporters: [TestReporter],
    });

    for (let i = 0; i < 10; i++) {
      relinka.log("SPAM");
    }

    await wait(200);
    expect(logs.length).toBe(0);
  });

  test("can see spams without ending log", async () => {
    const logs: LogObject[] = [];
    const TestReporter: RelinkaReporter = {
      log(logObj) {
        logs.push(logObj);
      },
    };

    const relinka = createRelinka({
      throttle: 100,
      level: LogLevels.info,
      reporters: [TestReporter],
    });
    for (let i = 0; i < 10; i++) {
      relinka.log("SPAM");
    }
    await wait(300);
    expect(logs.length).toBe(7);
    // 6 + Last one indicating it repeated 4

    expect(logs.at(-1).args).toEqual(["SPAM", "(repeated 4 times)"]);
  });
});

function wait(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}
