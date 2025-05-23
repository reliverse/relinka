import { createRelinkaDeprecated } from "deprecated/components/relinka-deprecated/relinka.js";

const relinkaWrapper = createRelinkaDeprecated({
  reporters: [
    {
      log: (logObj) => {
        console.log(JSON.stringify(logObj));
      },
    },
  ],
});

relinkaWrapper.log("foo bar");
