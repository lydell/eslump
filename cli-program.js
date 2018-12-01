"use strict";

const babelCodeFrame = require("@babel/code-frame");
const fs = require("fs");
const mkdirp = require("mkdirp");
const optionator = require("optionator");
const path = require("path");
const generateRandomJS = require("./codegen");

const program = optionator({
  prepend: `
Usage: eslump [options]
   or: eslump TEST_FILE OUTPUT_DIR [options]

Options:
  `.trim(),
  append: `
When no arguments are provided, random JavaScript is printed to stdout.
Otherwise, TEST_FILE is executed until an error occurs, or you kill the
program. When an error occurs, the error is printed to stdout and files
are written to OUTPUT_DIR:

  - random.js contains the random JavaScript that caused the error.
  - random.backup.js is a backup of random.js.
  - reproductionData.json contains additional data defined by TEST_FILE
    needed to reproduce the error caused by random.js, if any.
  - Other files, if any, are defined by TEST_FILE.

OUTPUT_DIR is created as with \`mkdir -p\` if non-existent.

For information on how to write a TEST_FILE, see:
https://github.com/lydell/eslump#test-files

Examples:

  # See how "prettier" pretty-prints random JavaScript.
  $ eslump | prettier

  # Run test.js and save the results in output/.
  $ eslump test.js output/

  # Narrow down the needed JavaScript to produce the error.
  # output/random.backup.js is handy if you go too far.
  $ vim output/random.js

  # Reproduce the narrowed down case.
  $ eslump test.js output/ --reproduce
  `.trim(),
  options: [
    {
      option: "max-depth",
      type: "Number",
      default: "7",
      description: "The maximum depth of the random JavaScript.",
    },
    {
      option: "source-type",
      type: "String",
      enum: ["module", "script"],
      default: "module",
      description: "Parsing mode.",
    },
    {
      option: "whitespace",
      type: "Boolean",
      description: "Randomize the whitespace in the random JavaScript.",
    },
    {
      option: "comments",
      type: "Boolean",
      description: "Insert random comments into the random JavaScript.",
    },
    {
      option: "reproduce",
      alias: "r",
      type: "Boolean",
      description: "Reproduce a previous error using files in OUTPUT_DIR.",
    },
    {
      option: "help",
      alias: "h",
      type: "Boolean",
      description: "Show help",
      overrideRequired: true,
    },
    {
      option: "version",
      alias: "v",
      type: "Boolean",
      description: "Show version",
      overrideRequired: true,
    },
  ],
});

const FILES = {
  random: "random.js",
  randomBackup: "random.backup.js",
  reproductionData: "reproductionData.json",
};

function run(input) {
  let options = undefined;
  try {
    options = program.parse(input, { slice: 0 });
  } catch (error) {
    return { stderr: error.message, code: 1 };
  }

  if (options.help) {
    return { stdout: program.generateHelp(), code: 0 };
  }

  if (options.version) {
    return { stdout: require("./package.json").version, code: 0 };
  }

  const numPositional = options._.length;

  if (!(numPositional === 0 || numPositional === 2)) {
    return {
      stderr: `Expected 0 or 2 arguments, but ${numPositional} given.`,
      code: 1,
    };
  }

  if (numPositional === 0 && options.reproduce !== undefined) {
    return {
      stderr: `The --reproduce flag cannot be used without arguments.`,
      code: 1,
    };
  }

  if (numPositional === 0) {
    return { stdout: generateRandomJS(options), code: 0 };
  }

  const [testFile, outputDir] = options._;

  let testFunction = undefined;
  try {
    testFunction = require(path.resolve(testFile));
  } catch (error) {
    const message =
      error &&
      error.code === "MODULE_NOT_FOUND" &&
      error.message.includes(testFile)
        ? error.message
        : `Error when loading module '${testFile}':\n${printError(error)}`;
    return { stderr: message, code: 1 };
  }

  if (typeof testFunction !== "function") {
    return {
      stderr: `Expected \`require(${JSON.stringify(
        testFile
      )})\` to return a function, but got: ${testFunction}`,
      code: 1,
    };
  }

  let reproductionCode = undefined;
  let reproductionData = undefined;
  if (options.reproduce) {
    const codePath = path.join(outputDir, FILES.random);
    const dataPath = path.join(outputDir, FILES.reproductionData);

    try {
      reproductionCode = fs.readFileSync(codePath, "utf8");
    } catch (error) {
      return {
        stderr: `Failed to read '${codePath}' for reproduction:\n${
          error.message
        }`,
        code: 1,
      };
    }

    let reproductionDataString = undefined;
    try {
      reproductionDataString = fs.readFileSync(dataPath, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") {
        return {
          stderr: `Failed to read '${dataPath}' for reproduction:\n${
            error.message
          }`,
          code: 1,
        };
      }
    }

    if (typeof reproductionDataString === "string") {
      try {
        reproductionData = JSON.parse(reproductionDataString);
      } catch (error) {
        return {
          stderr: `Failed to parse JSON in '${dataPath}':\n${error.message}`,
          code: 1,
        };
      }
    }
  }

  function* loop() {
    let attemptNum = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const testData = {
        code: options.reproduce ? reproductionCode : generateRandomJS(options),
        sourceType: options.sourceType,
        reproductionData,
      };

      let result = undefined;
      try {
        result = testFunction(testData);
      } catch (error) {
        const mainMessage = `Attempt ${attemptNum}: The test function threw an unexpected error:\n${printError(
          error,
          testData.code
        )}`;
        const extraMessage = writeFiles(outputDir, {
          code: testData.code,
          reproduce: options.reproduce,
        });
        yield {
          message: extraMessage
            ? `${mainMessage}\n\n${extraMessage}`
            : mainMessage,
          code: 1,
        };
        break;
      }

      if (result) {
        const mainMessage = `Attempt ${attemptNum}: The test function returned an error:\n${printError(
          result.error,
          testData.code
        )}`;
        const extraMessage = writeFiles(outputDir, {
          code: testData.code,
          result,
          reproduce: options.reproduce,
        });
        yield {
          message: extraMessage
            ? `${mainMessage}\n\n${extraMessage}`
            : mainMessage,
          code: 1,
        };
        break;
      } else if (options.reproduce) {
        yield {
          message:
            "Failed to reproduce the error; the test function succeeded.",
          code: 1,
        };
        break;
      } else {
        yield { message: `Attempt ${attemptNum}: Success` };
      }

      attemptNum += 1;
    }
  }

  return { loop };
}

function writeFiles(
  outputDir,
  { code = null, result = {}, reproduce = false } = {}
) {
  try {
    mkdirp.sync(outputDir);
  } catch (error) {
    return `Failed to \`mkdir -p\` '${outputDir}':\n${error.message}`;
  }

  const message = [];

  function tryWrite(name, content) {
    const fullPath = path.join(outputDir, name);
    try {
      fs.writeFileSync(fullPath, content);
    } catch (error) {
      message.push(`Failed to write write '${fullPath}':\n${error.message}`);
    }
  }

  let reproductionDataString = undefined;
  if ("reproductionData" in result && !reproduce) {
    try {
      reproductionDataString = JSON.stringify(result.reproductionData, null, 2);
    } catch (error) {
      message.push(
        `Failed to run \`JSON.stringify\` on the returned reproductionData:`,
        "reproductionData:",
        indent(String(result.reproductionData)),
        "Error:",
        indent(error.message)
      );
    }
  }

  if (code !== null && !reproduce) {
    tryWrite(FILES.random, code);
    tryWrite(FILES.randomBackup, code);
  }

  if (reproductionDataString && !reproduce) {
    tryWrite(FILES.reproductionData, reproductionDataString);
  }

  if (result.artifacts) {
    Object.keys(result.artifacts).forEach(name => {
      tryWrite(name, String(result.artifacts[name]));
    });
  }

  return message.length === 0 ? null : message.join("\n\n");
}

function printError(error, code = "") {
  if (code && error) {
    const { line, column } = getLocation(error);
    if (typeof line === "number") {
      const codeFrame = babelCodeFrame.codeFrameColumns(
        code,
        { start: { line, column } },
        { highlightCode: true }
      );
      return `${error.stack}\n${codeFrame}`;
    }
  }

  return error && error.stack ? error.stack : String(error);
}

function getLocation(error) {
  // Acorn and @babel/parser has `.loc.line` (1-indexed) and `.loc.column`
  // (0-indexed). The Flow example is adjusted to this format.
  // Espree and Esprima has `.lineNumber` (1-indexed) and `.column` (1-indexed).
  // Shift-parser has `.line` (1-indexed) and `.column` (1-indexed).

  const line =
    error.loc && typeof error.loc.line === "number"
      ? error.loc.line
      : typeof error.lineNumber === "number"
      ? error.lineNumber
      : typeof error.line === "number"
      ? error.line
      : undefined;

  const column =
    error.loc && typeof error.loc.column === "number"
      ? error.loc.column + 1
      : typeof error.column === "number"
      ? error.column
      : undefined;

  return { line, column };
}

function indent(string) {
  return string.replace(/^/gm, "  ");
}

module.exports = run;
