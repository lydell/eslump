"use strict";

const acorn = require("acorn");
const testParser = require("./parser");

const parse = (input) => acorn.parse(input, { ecmaVersion: 2020 });

module.exports = testParser(parse);
