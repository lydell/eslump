"use strict";

const shiftParser = require("shift-parser");
const testParser = require("./parser");

function parse(code, generatorOptions) {
  const parseFunction = generatorOptions.sourceType === "module"
    ? shiftParser.parseModule
    : shiftParser.parseScript;
  return parseFunction(code, { earlyErrors: false });
}

function getType(generatorOptions) {
  return generatorOptions.sourceType === "module" ? "Module" : "Script";
}

module.exports = testParser(parse, getType);
