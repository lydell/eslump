const { parseModule, parseScript } = require("shift-parser");
const testParser = require("./parser");

function parse(code, { sourceType }) {
  const parseFunction = sourceType === "module" ? parseModule : parseScript;
  return parseFunction(code, { earlyErrors: false });
}

function getType({ sourceType }) {
  return sourceType === "module" ? "Module" : "Script";
}

module.exports = testParser(parse, getType);
