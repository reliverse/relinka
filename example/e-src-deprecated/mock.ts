import { relinkaInstanceDeprecated } from "deprecated/components/relinka-deprecated/mod.js";

// @ts-expect-error TODO: fix ts
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

relinkaInstanceDeprecated.info("before");

// @ts-expect-error TODO: fix ts
relinkaInstanceDeprecated.mockTypes(mockFn);

const tagged = relinkaInstanceDeprecated.withTag("newTag");

relinkaInstanceDeprecated.log("log is not mocked!");

relinkaInstanceDeprecated.info("Dont see me");
tagged.info("Dont see me too");
