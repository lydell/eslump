"use strict";

const babelGenerate = require("@babel/generator");
const babelParser = require("@babel/parser");
const testGenerator = require("./generator");
const random = require("../random");

function generate(code, options) {
  const ast = babelParser.parse(code, { sourceType: options.sourceType });
  return babelGenerate.default(ast, options.options, code).code;
}

function generateRandomOptions() {
  return {
    retainLines: random.bool(),
    retainFunctionParens: random.bool(),
    comments: random.bool(),
    compact: random.item([undefined, true, false, "auto"]),
    minified: random.bool(),
    concise: random.bool(),
    jsonCompatibleStrings: random.bool()
  };
}

module.exports = testGenerator(generate, generateRandomOptions);
