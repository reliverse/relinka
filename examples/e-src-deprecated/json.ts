import { createRelinkaDeprecated } from "~/main.js";

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
