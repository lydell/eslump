const prettier = require("prettier");
const testGenerator = require("./generator");
const random = require("../random");

function generate(code, { options }) {
  return prettier.format(code, options);
}

function generateRandomOptions({ sourceType }) {
  return {
    bracketSpacing: random.bool(),
    jsxBracketSameLine: random.bool(),
    parser: sourceType === "module" ? random.item(["babylon", "flow"]) : "flow",
    printWidth: random.int(200),
    semi: random.bool(),
    singleQuote: random.bool(),
    tabWidth: random.int(12),
    trailingComma: random.item(["none", "es5", "all"]),
    useTabs: random.bool()
  };
}

module.exports = testGenerator(generate, generateRandomOptions);
