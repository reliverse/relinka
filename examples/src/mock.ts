import { relinkaInstance } from "~/main.js";

function mockFn(type) {
  if (type === "info") {
    return function () {
      // @ts-expect-error TODO: fix ts
      this.log("(mocked fn with info tag)");
      return true;
    };
  }
  return undefined;
}

relinkaInstance.info("before");

relinkaInstance.mockTypes(mockFn);

const tagged = relinkaInstance.withTag("newTag");

relinkaInstance.log("log is not mocked!");

relinkaInstance.info("Dont see me");
tagged.info("Dont see me too");
