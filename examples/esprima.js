const esprima = require("esprima");
const testParser = require("./parser");

module.exports = testParser(esprima.parse);
