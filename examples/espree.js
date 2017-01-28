const espree = require("espree");
const testParser = require("./parser");

function parse(code, { sourceType }) {
  return espree.parse(code, { sourceType, ecmaVersion: 7 });
}

module.exports = testParser(parse);
