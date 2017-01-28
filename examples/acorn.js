const acorn = require("acorn");
const testParser = require("./parser");

module.exports = testParser(acorn.parse);
