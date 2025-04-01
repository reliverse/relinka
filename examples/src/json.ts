import { createRelinkaDeprecated } from "~/libs/core/core-main.js";

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
