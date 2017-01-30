const arrayShuffle = require("array-shuffle");
const randomInt = require("random-int");
const randomItem = require("random-item");

const letters = "abcdefghijklmnopqrstuvxyz".split("");

// Source: https://github.com/estools/esfuzz/blob/3805af61eb6a6836dad11f5cd21665f242ae6e1e/src/random.coffee#L6-L29
const whitespace = [
  // ES5 7.2
  "\x09", // Horizontal Tab (\t)
  "\x0B", // Vertical Tab (\v)
  "\x0C", // Form Feed (\f)
  "\uFEFF", // Byte Order Mark
  // Unicode category Zs (Separator, space)
  "\x20", // SPACE
  "\xA0", // NO-BREAK SPACE
  "\u1680", // OGHAM SPACE MARK
  "\u180E", // MONGOLIAN VOWEL SEPARATOR
  "\u2000", // EN QUAD
  "\u2001", // EM QUAD
  "\u2002", // EN SPACE
  "\u2003", // EM SPACE
  "\u2004", // THREE-PER-EM SPACE
  "\u2005", // FOUR-PER-EM SPACE
  "\u2006", // SIX-PER-EM SPACE
  "\u2007", // FIGURE SPACE
  "\u2008", // PUNCTUATION SPACE
  "\u2009", // THIN SPACE
  "\u200A", // HAIR SPACE
  "\u202F", // NARROW NO-BREAK SPACE
  "\u205F", // MEDIUM MATHEMATICAL SPACE
  "\u3000" // IDEOGRAPHIC SPACE
];

// Source: https://github.com/estools/esfuzz/blob/3805af61eb6a6836dad11f5cd21665f242ae6e1e/src/random.coffee#L33-L39
const lineTerminators = [
  // ES5 7.3
  "\x0A", // Line Feed (\n)
  "\x0D", // Carriage Return (\r)
  // Unicode category Zl (Separator, line)
  "\u2028", // LINE SEPARATOR
  // Unicode category Zp (Separator, paragraph)
  "\u2029" // PARAGRAPH SEPARATOR
];

function randomArray(length, randomItem) {
  return [...Array(length)].map(() => randomItem());
}

function randomString(length, randomChar) {
  return randomArray(length, randomChar).join("");
}

function randomLineTerminator() {
  return randomItem(lineTerminators);
}

function randomWhitespace() {
  return randomItem(whitespace);
}

function randomSingleLineComment() {
  const length = randomInt(20);
  const contents = arrayShuffle(whitespace.concat(letters))
    .slice(0, length)
    .join("");
  const spaces = randomString(2, randomWhitespace);
  return `${spaces}//${contents}`;
}

function randomMultiLineComment() {
  const length = randomInt(20);
  // Don’t include line terminators in case the comment ends up inside a string.
  const contents = arrayShuffle(whitespace.concat(letters))
    .slice(0, length)
    .join("");
  const spacesBefore = randomString(2, randomWhitespace);
  const spacesAfter = randomString(2, randomWhitespace);
  return `${spacesBefore}/*${contents}*/${spacesAfter}`;
}

module.exports = {
  bool: () => Math.random() < 0.5,
  int: randomInt,
  item: randomItem,
  array: randomArray,
  string: randomString,
  lineTerminator: randomLineTerminator,
  whitespace: randomWhitespace,
  singleLineComment: randomSingleLineComment,
  multiLineComment: randomMultiLineComment
};
