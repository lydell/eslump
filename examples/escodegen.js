"use strict";

const escodegen = require("escodegen");
const esprima = require("esprima");
const testGenerator = require("./generator");
const random = require("../src/random");

function generate(code, { sourceType, options }) {
  const ast = esprima.parse(code, {
    sourceType,
    comments: true,
  });
  return escodegen.generate(ast, options);
}

function generateRandomOptions() {
  return {
    format: {
      indent: {
        style: random.string(random.int(10), random.whitespace),
        base: random.int(10),
        adjustMultilineComment: random.bool(),
      },
      newline: random.lineTerminator(),
      space: random.string(random.int(4), random.whitespace),
      json: random.bool(),
      renumber: random.bool(),
      hexadecimal: random.bool(),
      quotes: random.item(["single", "double", "auto"]),
      escapeless: random.bool(),
      compact: random.bool(),
      parentheses: random.bool(),
      semicolons: random.bool(),
      safeConcatenation: random.bool(),
      preserveBlankLines: random.bool(),
    },
    comment: random.bool(),
  };
}

module.exports = testGenerator(generate, generateRandomOptions);
