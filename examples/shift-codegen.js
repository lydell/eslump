"use strict";

const {
  FormattedCodeGen,
  MinimalCodeGen,
  default: codegen,
} = require("shift-codegen");
const shiftParser = require("shift-parser");
const testGenerator = require("./generator");
const random = require("../random");

function generate(code, { sourceType, options }) {
  const parseFunction =
    sourceType === "module" ? shiftParser.parseModule : shiftParser.parseScript;
  const ast = parseFunction(code, { earlyErrors: false });

  const Generator = options.minimal ? MinimalCodeGen : FormattedCodeGen;

  return codegen(ast, new Generator());
}

function generateRandomOptions() {
  return { minimal: random.bool() };
}

module.exports = testGenerator(generate, generateRandomOptions);
