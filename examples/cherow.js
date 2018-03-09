"use strict";

const cherow = require("cherow");
const testParser = require("./parser");

function parse(code, generatorOptions) {
  const parseFunction =
    generatorOptions.sourceType === "module"
      ? cherow.parseModule
      : cherow.parseScript;
  return parseFunction(code);
}

module.exports = testParser(parse);
