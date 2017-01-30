const shiftCodegen = require("shift-codegen");
const { parseModule, parseScript } = require("shift-parser");
const testGenerator = require("./generator");
const random = require("../random");

function generate(code, { sourceType, options }) {
  const parseFunction = sourceType === "module" ? parseModule : parseScript;
  const ast = parseFunction(code, { earlyErrors: false });

  const generator = options.minimal
    ? shiftCodegen.MinimalCodeGen
    : shiftCodegen.FormattedCodeGen;

  return shiftCodegen.default(ast, new generator());
}

function generateRandomOptions() {
  return { minimal: random.bool() };
}

module.exports = testGenerator(generate, generateRandomOptions);
