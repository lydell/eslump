const { FormattedCodeGen } = require("shift-codegen");
const { TokenStream } = require("shift-codegen/dist/token_stream");
const shiftFuzzer = require("shift-fuzzer");
const shiftReducer = require("shift-reducer");
const random = require("./random");

const NO_NEWLINE = "}[)";
const WHITESPACE = /^\s+$/;

class CustomTokenStream extends TokenStream {
  constructor({ comments = false } = {}) {
    super();
    this._comments = comments;
    this._probability = Math.random();
  }

  put(tokenString, isRegExp) {
    const newTokenString = WHITESPACE.test(tokenString) ||
      tokenString === NO_NEWLINE
      ? this._comments && Math.random() <= this._probability
          ? random.insignificantJS(random.int(5), {
              allowNewlines: tokenString !== NO_NEWLINE
            }) || " "
          : tokenString === NO_NEWLINE ? " " : tokenString
      : tokenString;

    super.put(newTokenString, isRegExp);
  }
}

class CustomFormattedCodeGen extends FormattedCodeGen {
  sep(separator) {
    switch (separator.type) {
      case "BEFORE_ARROW":
      case "BEFORE_POSTFIX":
      case "BEFORE_JUMP_LABEL":
      case "RETURN":
      case "THROW":
      case "YIELD":
        return this.t(NO_NEWLINE);
      default:
        return super.sep(separator);
    }
  }
}

function codeGen(ast, { comments = false } = {}) {
  const generator = new CustomFormattedCodeGen();
  const tokenStream = new CustomTokenStream({ comments });
  const rep = shiftReducer.default(generator, ast);
  rep.emit(tokenStream);
  return tokenStream.result;
}

function generateRandomJS(options = {}) {
  const fuzzer = options.sourceType === "script"
    ? shiftFuzzer.fuzzScript
    : shiftFuzzer.fuzzModule;

  const randomAST = fuzzer(new shiftFuzzer.FuzzerState({
    maxDepth: options.maxDepth
  }));

  return codeGen(randomAST, { comments: options.comments });
}

module.exports = generateRandomJS;
