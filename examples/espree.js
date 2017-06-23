"use strict";

const espree = require("espree");
const testParser = require("./parser");

function parse(code, options) {
  return espree.parse(code, { sourceType: options.sourceType, ecmaVersion: 7 });
}

module.exports = testParser(parse);
