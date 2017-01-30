const prettier = require("prettier");
const testGenerator = require("./generator");
const random = require("../random");

function generate(code, { options }) {
  return prettier.format(code, options);
}

function generateRandomOptions({ sourceType }) {
  return {
    printWidth: random.int(200),
    tabWidth: random.int(12),
    singleQuote: random.bool(),
    trailingComma: random.bool(),
    bracketSpacing: random.bool(),
    parser: sourceType === "module" ? random.item(["babylon", "flow"]) : "flow"
  };
}

module.exports = testGenerator(generate, generateRandomOptions);
