import { createRelinka } from "~/main.js";

const relinka = createRelinka({
  reporters: [
    {
      log: (logObj) => {
        console.log(JSON.stringify(logObj));
      },
    },
  ],
});

relinka.log("foo bar");
