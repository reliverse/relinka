import { relinkaInstanceDeprecated } from "~/libs/core/core-impl/deprecated/components/relinka-deprecated/mod.js";

function waitFor(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function spam({ count, delay }) {
  for (let i = 0; i < count; i++) {
    await waitFor(delay);
    relinkaInstanceDeprecated.log(`Spam (Count: ${count} Delay: ${delay} ms)`);
  }
}

await (async () => {
  await spam({ count: 2, delay: 10 });
  await spam({ count: 20, delay: 10 });
  await spam({ count: 20, delay: 0 });
  await spam({ count: 80, delay: 10 });
})();
