"use strict";

const expect = require("unexpected");

module.exports = (generate, generateRandomOptions) => ({
  code,
  sourceType,
  reproductionData = undefined,
}) => {
  const isReproduction = reproductionData != null;
  const options =
    reproductionData != null
      ? reproductionData.options
      : generateRandomOptions({ sourceType });
  const generateData = { sourceType, options };
  const artifacts = {};

  function makeErrorData(error) {
    return { error, reproductionData: { options }, artifacts };
  }

  let generatedCode1 = undefined;
  try {
    generatedCode1 = generate(code, generateData);
  } catch (error) {
    // Ignore parse errors: We’re testing the printer here, not the parsers.
    if (
      !isReproduction &&
      (String(error).includes("SyntaxError") ||
        (error && typeof error.column === "number"))
    ) {
      return undefined;
    }
    return makeErrorData(error);
  }
  artifacts["generated1.js"] = generatedCode1;

  let generatedCode2 = undefined;
  try {
    generatedCode2 = generate(generatedCode1, generateData);
  } catch (error) {
    return makeErrorData(error);
  }
  artifacts["generated2.js"] = generatedCode2;

  try {
    expect(generatedCode1, "to equal", generatedCode2);
  } catch (error) {
    return makeErrorData(error);
  }

  return undefined;
};
