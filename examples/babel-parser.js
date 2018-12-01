"use strict";

const babelParser = require("@babel/parser");
const testParser = require("./parser");

module.exports = testParser(babelParser.parse, () => "File");
