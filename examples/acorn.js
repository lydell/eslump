"use strict";

const acorn = require("acorn");
const testParser = require("./parser");

const parse = (input, options) =>
  acorn.parse(input, { ...options, ecmaVersion: "latest" });

module.exports = testParser(parse);
