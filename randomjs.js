const arrayShuffle = require("array-shuffle");
const shiftCodegen = require("shift-codegen");
const shiftFuzzer = require("shift-fuzzer");
const random = require("./random");

function generateRandomJS(options = {}) {
  const fuzzer = options.sourceType === "script"
    ? shiftFuzzer.fuzzScript
    : shiftFuzzer.fuzzModule;

  const generator = random.item([
    shiftCodegen.MinimalCodeGen,
    shiftCodegen.FormattedCodeGen
  ]);

  const randomAST = fuzzer(new shiftFuzzer.FuzzerState({
    maxDepth: options.maxDepth
  }));

  const randomJS = shiftCodegen.default(randomAST, new generator());

  return options.comments ? insertRandomComments(randomJS) : randomJS;
}

// A single-line comment can be inserted at the end of any line, and a
// multi-line comment can be inserted in any sequence of whitespace (almost, see
// below). If we happen to be inside a multi-line string, that doesn’t matter.
// The code will be valid anyway, and it might actually be a good test to insert
// what looks like comments into strings.
function insertRandomComments(jsString) {
  return insertRandomMultiLineComments(
    insertRandomSingleLineComments(jsString)
  );
}

function insertRandomSingleLineComments(jsString) {
  const lines = jsString.split(/^/m);
  const numSingleLineComments = random.int(lines.length);
  const indices = lines.map((line, index) => index);
  const shuffledIndices = arrayShuffle(indices);
  const indicesToChange = new Set(
    shuffledIndices.slice(0, numSingleLineComments)
  );

  const linesWithComments = lines.map(
    (line, index) => indicesToChange.has(index)
      ? line.replace(
          // If there’s a backslash before the newline, it might be an escaped
          // newline in a string. If so, we can’t add text here.
          /(^|[^\\])$/m,
          match => `${match}${random.singleLineComment()}`
        )
      : line
  );

  return linesWithComments.join("");
}

function insertRandomMultiLineComments(jsString) {
  // Even index → non-whitespace.
  // Odd index → whitespace.
  const segments = jsString.split(/(\s+)/);

  const indices = segments.map((segment, index) => index);
  const oddIndices = indices.filter(isOdd);
  const numMultiLineComments = random.int(oddIndices.length);
  const shuffledOddIndices = arrayShuffle(oddIndices);
  const indicesToChange = new Set(
    shuffledOddIndices.slice(0, numMultiLineComments)
  );

  return segments.reduce(
    (resultString, segment, index) =>
      isOdd(index) && indicesToChange.has(index)
        ? insertRandomMultiLineComment(resultString, segment)
        : `${resultString}${segment}`,
    ""
  );
}

function insertRandomMultiLineComment(resultString, whitespace) {
  // Skip adding a comment if the last line contains a slash, since we might be
  // in the middle of a regex, where a comment could end the regex or make it
  // invalid. Also skip adding a comment if the last line ends with a backslash,
  // because of the same reasons as for single-line comments.
  if (/\/.*$|\\$/.test(resultString)) {
    return `${resultString}${whitespace}`;
  }

  const index = random.int(whitespace.length);
  const before = whitespace.slice(0, index);
  const after = whitespace.slice(index);
  const comment = random.multiLineComment();

  return `${resultString}${before}${comment}${after}`;
}

function isOdd(number) {
  return number % 2 === 1;
}

module.exports = generateRandomJS;
