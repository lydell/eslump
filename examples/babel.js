const babelGenerate = require("babel-generator");
const babylon = require("babylon");
const testGenerator = require("./generator");
const random = require("../random");

function generate(code, { sourceType, options }) {
  const ast = babylon.parse(code, { sourceType });
  return babelGenerate.default(ast, options, code);
}

function generateRandomOptions() {
  return {
    retainLines: random.bool(),
    retainFunctionParens: random.bool(),
    comments: random.bool(),
    compact: random.item([undefined, true, false, "auto"]),
    minified: random.bool(),
    concise: random.bool(),
    quotes: random.item([undefined, "single", "double"]),
    jsonCompatibleStrings: random.bool()
  };
}

module.exports = testGenerator(generate, generateRandomOptions);
