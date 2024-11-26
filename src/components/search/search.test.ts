import { describe, it, expect, expectTypeOf } from "vitest";

import { search, Separator } from "~/components/prompts/index.js";
import { render } from "~/testing/index.js";

// Array of all countries names as string
const PROVINCES = [
  { name: "Alberta", value: "AB" },
  { name: "British Columbia", value: "BC" },
  { name: "Manitoba", value: "MB" },
  { name: "New Brunswick", value: "NB" },
  { name: "Newfoundland and Labrador", value: "NL" },
  { name: "Nova Scotia", value: "NS" },
  { name: "Ontario", value: "ON" },
  { name: "Prince Edward Island", value: "PE" },
  { name: "Quebec", value: "QC" },
  { name: "Saskatchewan", value: "SK" },
  { name: "Northwest Territories", value: "NT" },
  { name: "Nunavut", value: "NU" },
  { name: "Yukon", value: "YT" },
];

function getListSearch(
  choices: readonly (
    | Separator
    | { value: string; name?: string; disabled?: boolean | string }
  )[],
) {
  return (term = "") => {
    if (!term) {
      return choices;
    }

    return choices.filter((choice) => {
      return (
        Separator.isSeparator(choice) ||
        (choice.name ?? choice.value)
          .toLocaleLowerCase()
          .includes(term.toLocaleLowerCase())
      );
    });
  };
}

describe("search prompt", () => {
  it("allows to search", async () => {
    // @ts-expect-error - TODO: fix ts
    const { answer, events, getScreen } = await render(search, {
      message: "Select a Canadian province",
      source: getListSearch(PROVINCES),
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province 
      ❯ Alberta
        British Columbia
        Manitoba
        New Brunswick
        Newfoundland and Labrador
        Nova Scotia
        Ontario
      (Use arrow keys to reveal more choices)"
    `);

    events.type("New");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province New
      ❯ New Brunswick
        Newfoundland and Labrador
      (Use arrow keys)"
    `);

    events.keypress("enter");
    await expect(answer).resolves.toEqual("NB");
    expect(getScreen()).toMatchInlineSnapshot(
      `"✔ Select a Canadian province New Brunswick"`,
    );
  });

  it("works with string results", async () => {
    const choices = [
      "Stark",
      "Lannister",
      "Targaryen",
      "Baratheon",
      "Greyjoy",
      "Martell",
      "Tyrell",
      "Arryn",
      "Tully",
    ];

    // @ts-expect-error - TODO: fix ts
    const { answer, events, getScreen } = await render(search, {
      message: "Select a family",
      source: (term = "") => {
        return choices.filter((choice) => choice.includes(term));
      },
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a family 
      ❯ Stark
        Lannister
        Targaryen
        Baratheon
        Greyjoy
        Martell
        Tyrell
      (Use arrow keys to reveal more choices)"
    `);

    events.keypress("down");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a family 
        Stark
      ❯ Lannister
        Targaryen
        Baratheon
        Greyjoy
        Martell
        Tyrell"
    `);

    events.type("Targ");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a family Targ
      ❯ Targaryen"
    `);

    events.keypress("enter");
    await expect(answer).resolves.toEqual("Targaryen");
  });

  it("allows to search and navigate the list", async () => {
    // @ts-expect-error - TODO: fix ts
    const { answer, events, getScreen } = await render(search, {
      message: "Select a Canadian province",
      source: getListSearch(PROVINCES),
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province 
      ❯ Alberta
        British Columbia
        Manitoba
        New Brunswick
        Newfoundland and Labrador
        Nova Scotia
        Ontario
      (Use arrow keys to reveal more choices)"
    `);

    events.type("N");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province N
      ❯ Manitoba
        New Brunswick
        Newfoundland and Labrador
        Nova Scotia
        Ontario
        Prince Edward Island
        Saskatchewan
      (Use arrow keys to reveal more choices)"
    `);

    events.keypress("down");
    events.keypress("down");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province N
        Manitoba
        New Brunswick
      ❯ Newfoundland and Labrador
        Nova Scotia
        Ontario
        Prince Edward Island
        Saskatchewan"
    `);

    events.keypress("enter");
    await expect(answer).resolves.toEqual("NL");
    expect(getScreen()).toMatchInlineSnapshot(
      `"✔ Select a Canadian province Newfoundland and Labrador"`,
    );
  });

  it("controls bounds of the list when navigating", async () => {
    // @ts-expect-error - TODO: fix ts
    const { answer, events, getScreen } = await render(search, {
      message: "Select a Canadian province",
      source: getListSearch(PROVINCES),
    });

    events.type("New");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province New
      ❯ New Brunswick
        Newfoundland and Labrador
      (Use arrow keys)"
    `);

    events.keypress("up");
    events.keypress("up");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province New
      ❯ New Brunswick
        Newfoundland and Labrador
      (Use arrow keys)"
    `);
    events.keypress("down");
    events.keypress("down");
    events.keypress("down");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province New
        New Brunswick
      ❯ Newfoundland and Labrador"
    `);

    events.keypress("up");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province New
      ❯ New Brunswick
        Newfoundland and Labrador"
    `);

    events.keypress("enter");
    await expect(answer).resolves.toEqual("NB");
    expect(getScreen()).toMatchInlineSnapshot(
      `"✔ Select a Canadian province New Brunswick"`,
    );
  });

  it("handles search errors", async () => {
    const { answer, events, getScreen } = await render(search, {
      message: "Select a Canadian province",
      source: (term: string | void) => {
        if (!term) {
          return Promise.resolve([]);
        }

        throw new Error("You're being rate limited");
      },
    });

    expect(getScreen()).toMatchInlineSnapshot(`"? Select a Canadian province"`);

    events.type("New");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province New
      > You're being rate limited"
    `);

    answer.cancel();
    await expect(answer).rejects.toThrow();
  });

  it("handles empty results", async () => {
    const { answer, events, getScreen } = await render(search, {
      message: "Select a Canadian province",
      source: () => [],
    });

    expect(getScreen()).toMatchInlineSnapshot(`"? Select a Canadian province"`);

    events.type("N");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province N
      > No results found"
    `);

    events.keypress("backspace");
    expect(getScreen()).toMatchInlineSnapshot(`"? Select a Canadian province"`);

    answer.cancel();
    await expect(answer).rejects.toThrow();
  });

  it("handles separators & disabled choices", async () => {
    const choices = [
      new Separator("~ Americas ~"),
      { value: "Canada" },
      { value: "United States" },
      { value: "Mexico" },
      new Separator("~ Europe ~"),
      { value: "France", disabled: "Cannot be selected during the Olympics" },
      { value: "Germany", disabled: true },
      { value: "Spain" },
    ];

    // @ts-expect-error - TODO: fix ts
    const { answer, events, getScreen } = await render(search, {
      message: "Select a country",
      source: getListSearch(choices),
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a country 
       ~ Americas ~
      ❯ Canada
        United States
        Mexico
       ~ Europe ~
      - France Cannot be selected during the Olympics
      - Germany (disabled)"
    `);

    events.type("France");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a country France
       ~ Europe ~
      - France Cannot be selected during the Olympics"
    `);

    // This event will be ignored;
    events.keypress("enter");

    Array.from({ length: "France".length }).forEach(() =>
      events.keypress("backspace"),
    );
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a country 
       ~ Americas ~
      ❯ Canada
        United States
        Mexico
       ~ Europe ~
      - France Cannot be selected during the Olympics
      - Germany (disabled)"
    `);

    events.type("United");
    await Promise.resolve();
    events.keypress("enter");

    await expect(answer).resolves.toEqual("United States");
    expect(getScreen()).toMatchInlineSnapshot(
      `"✔ Select a country United States"`,
    );
  });

  it("handles choices with descriptions", async () => {
    const choices = [
      { value: "Stark", description: "Winter is coming" },
      { value: "Lannister", description: "Hear me roar" },
      { value: "Targaryen", description: "Fire and blood" },
    ];

    // @ts-expect-error - TODO: fix ts
    const { answer, events, getScreen } = await render(search, {
      message: "Select a family",
      source: getListSearch(choices),
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a family 
      ❯ Stark
        Lannister
        Targaryen
      (Use arrow keys)
      Winter is coming"
    `);

    events.keypress("down");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a family 
        Stark
      ❯ Lannister
        Targaryen
      Hear me roar"
    `);

    events.type("Targ");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a family Targ
      ❯ Targaryen
      Fire and blood"
    `);

    events.keypress("enter");
    await expect(answer).resolves.toEqual("Targaryen");
  });

  it("allows default parameters to be used as source function parameters", async () => {
    // @ts-expect-error - TODO: fix ts
    const { answer } = await render(search, {
      message: "Select a family",
      source: (term = "") => {
        expectTypeOf(term).toEqualTypeOf<string>();
        return [];
      },
    });

    answer.cancel();
    await expect(answer).rejects.toThrow();
  });

  it("Autocomplete with tab", async () => {
    // @ts-expect-error - TODO: fix ts
    const { answer, events, getScreen } = await render(search, {
      message: "Select a Canadian province",
      source: getListSearch(PROVINCES),
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province 
      ❯ Alberta
        British Columbia
        Manitoba
        New Brunswick
        Newfoundland and Labrador
        Nova Scotia
        Ontario
      (Use arrow keys to reveal more choices)"
    `);

    events.type("New");

    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province New
      ❯ New Brunswick
        Newfoundland and Labrador
      (Use arrow keys)"
    `);

    events.keypress("tab");
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province New Brunswick
      ❯ New Brunswick
        Newfoundland and Labrador
      (Use arrow keys)"
    `);

    events.keypress("enter");
    await expect(answer).resolves.toEqual("NB");
  });

  it("Autocomplete when pressing enter fail validation", async () => {
    const FOLDERS = ["src", "dist"];
    const FILES = ["src/index.mts", "dist/index.js"];

    // @ts-expect-error - TODO: fix ts
    const { answer, events, getScreen } = await render(search, {
      message: "Select a file",
      source: (term?: string) => {
        if (term && FOLDERS.includes(term)) {
          return FILES.filter((file) => file.includes(term)).map((file) => ({
            name: file,
            value: file,
          }));
        }

        return FOLDERS.filter((folder) => !term || folder.includes(term)).map(
          (file) => ({
            name: file,
            value: file,
          }),
        );
      },
      validate: (value: string) => {
        return FILES.includes(value) ? true : "Invalid file";
      },
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a file 
      ❯ src
        dist
      (Use arrow keys)"
    `);

    events.type("di");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a file di
      ❯ dist"
    `);

    events.keypress("enter");
    await Promise.resolve();
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a file dist
      ❯ dist/index.js"
    `);

    events.keypress("enter");
    await expect(answer).resolves.toEqual("dist/index.js");
  });

  it("handles validation errors", async () => {
    // @ts-expect-error - TODO: fix ts
    const { answer, events, getScreen } = await render(search, {
      message: "Select a Canadian province",
      source: getListSearch(PROVINCES),
      validate: (value: string) => {
        if (value === "NB") {
          return "New Brunswick is unavailable at the moment.";
        }
        if (value === "AB") {
          return false;
        } // Test default error
        return true;
      },
    });

    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province 
      ❯ Alberta
        British Columbia
        Manitoba
        New Brunswick
        Newfoundland and Labrador
        Nova Scotia
        Ontario
      (Use arrow keys to reveal more choices)"
    `);

    events.keypress("enter");
    await Promise.resolve();
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province Alberta
      ❯ Alberta"
    `);

    events.keypress("enter");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province Alberta
      > You must provide a valid value"
    `);

    events.keypress({ name: "backspace", ctrl: true });
    events.type("New Brun");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province New Brun
      ❯ New Brunswick"
    `);

    events.keypress("enter");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province New Brunswick
      ❯ New Brunswick"
    `);

    events.keypress("enter");
    await Promise.resolve();
    expect(getScreen()).toMatchInlineSnapshot(`
      "? Select a Canadian province New Brunswick
      > New Brunswick is unavailable at the moment."
    `);

    events.keypress({ name: "backspace", ctrl: true });
    events.type("Quebec");
    await Promise.resolve();
    events.keypress("enter");
    await expect(answer).resolves.toEqual("QC");
  });
});
