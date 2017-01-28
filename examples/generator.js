const expect = require("unexpected");

module.exports = (generate, generateRandomOptions) => (
  { code, sourceType, reproductionData = {} }
) => {
  const { options = generateRandomOptions({ sourceType }) } = reproductionData;
  const artifacts = {};

  function makeErrorData(error) {
    return { error, reproductionData: { options }, artifacts };
  }

  let generatedCode1;
  try {
    generatedCode1 = generate(code, options);
  } catch (error) {
    // Ignore parse errors: We’re testing the printer here, not the parsers.
    if (
      String(error).includes("SyntaxError") ||
        error && typeof error.column === "number"
    ) {
      return;
    }
    return makeErrorData(error);
  }
  artifacts["generated1.js"] = generatedCode1;

  let generatedCode2;
  try {
    generatedCode2 = generate(generatedCode1, options);
  } catch (error) {
    return makeErrorData(error);
  }
  artifacts["generated2.js"] = generatedCode2;

  try {
    expect(generatedCode1, "to equal", generatedCode2);
  } catch (error) {
    return makeErrorData(error);
  }
};
