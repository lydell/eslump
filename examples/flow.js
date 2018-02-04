"use strict";

const flow = require("flow-parser");
const testParser = require("./parser");

function parse(code) {
  const ast = flow.parse(code);

  if (ast.errors.length > 0) {
    const message = ast.errors
      .map(
        messageInfo =>
          `${messageInfo.message} (${messageInfo.loc.start.line}:${
            messageInfo.loc.start.column
          })`
      )
      .join("\n");
    const error = new SyntaxError(message);
    error.loc = ast.errors[0].loc.start;
    throw error;
  }

  return ast;
}

module.exports = testParser(parse);
