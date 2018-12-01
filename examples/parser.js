"use strict";

const expect = require("unexpected");

module.exports = (parse, getType) => ({ code, sourceType }) => {
  let ast = undefined;
  try {
    ast = parse(code, { sourceType });
  } catch (error) {
    return { error };
  }

  const type = getType ? getType({ sourceType }) : "Program";

  try {
    expect(ast, "to have own property", "type", type);
  } catch (error) {
    return { error, artifacts: { "ast.json": JSON.stringify(ast, null, 2) } };
  }

  return undefined;
};
