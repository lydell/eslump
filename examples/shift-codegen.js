"use strict";

const shiftCodegen = require("shift-codegen");
const shiftParser = require("shift-parser");
const testGenerator = require("./generator");
const random = require("../random");

function generate(code, generatorOptions) {
  const parseFunction = generatorOptions.sourceType === "module"
    ? shiftParser.parseModule
    : shiftParser.parseScript;
  const ast = parseFunction(code, { earlyErrors: false });

  const generator = generatorOptions.options.minimal
    ? shiftCodegen.MinimalCodeGen
    : shiftCodegen.FormattedCodeGen;

  return shiftCodegen.default(ast, new generator());
}

function generateRandomOptions() {
  return { minimal: random.bool() };
}

module.exports = testGenerator(generate, generateRandomOptions);
