"use strict";

const { generateRandomJS } = require("..");

describe("generateRandomJS", () => {
  test("it works", () => {
    expect(typeof generateRandomJS()).toBe("string");
  });
});
