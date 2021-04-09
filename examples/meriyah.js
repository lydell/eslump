"use strict";

const meriyah = require("meriyah");
const testParser = require("./parser");

function parse(code, { sourceType }) {
  return meriyah.parse(code, { module: sourceType === "module" });
}

module.exports = testParser(parse);
