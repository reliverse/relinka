import { relinka } from "./utils/index.js";

function mockFn(type) {
  if (type === "info") {
    return function () {
      // @ts-expect-error TODO: fix ts
      this.log("(mocked fn with info tag)");
    };
  }
}

relinka.info("before");

relinka.mockTypes(mockFn);

const tagged = relinka.withTag("newTag");

relinka.log("log is not mocked!");

relinka.info("Dont see me");
tagged.info("Dont see me too");
