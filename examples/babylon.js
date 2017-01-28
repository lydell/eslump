const babylon = require("babylon");
const testParser = require("./parser");

module.exports = testParser(babylon.parse, () => "File");
