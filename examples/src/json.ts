import { createRelinka } from "~/deprecated/components/relinka/mod.js";

const relinkaWrapper = createRelinka({
  reporters: [
    {
      log: (logObj) => {
        console.log(JSON.stringify(logObj));
      },
    },
  ],
});

relinkaWrapper.log("foo bar");
