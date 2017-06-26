# eslump

Fuzz testing JavaScript parsers and suchlike programs.

> **es :** short for ECMAScript (the JavaScript standard)  
> **lump :** a piece or mass of indefinite size and shape  
> **slump :** the Swedish word for “chance”

Inspired by [esfuzz]. Powered by [shift-fuzzer] and [shift-codegen].

## Installation

eslump is primarily intended to be used as a CLI tool.

`npm install --global eslump`

You can also use parts of it as a Node.js module.

`npm install eslump`

## Usage

### CLI

```
Usage: eslump [options]
   or: eslump TEST_MODULE OUTPUT_DIR [options]

Options:

  --max-depth Number    The maximum depth of the random JavaScript. - default: 7
  --source-type String  Parsing mode. - either: module or script - default: module
  --whitespace          Randomize the whitespace in the random JavaScript.
  --comments            Insert random comments into the random JavaScript.
  -r, --reproduce       Reproduce a previous error using files in OUTPUT_DIR.
  -h, --help            Show help
  -v, --version         Show version

When no arguments are provided, random JavaScript is printed to stdout.
Otherwise, TEST_MODULE is executed until an error occurs, or you kill the
program. When an error occurs, the error is printed to stdout and files
are written to OUTPUT_DIR:

  - random.js contains the random JavaScript that caused the error.
  - random.backup.js is a backup of random.js.
  - reproductionData.json contains additional data defined by TEST_MODULE
    needed to reproduce the error caused by random.js, if any.
  - Other files, if any, are defined by TEST_MODULE.

OUTPUT_DIR is created as with `mkdir -p` if non-existent.

The value of TEST_MODULE is passed directly to the `require` function.

For information on how to write a TEST_MODULE, see:
https://github.com/lydell/eslump#test-files

Examples:

  # See how "prettier" pretty-prints random JavaScript.
  $ eslump | prettier

  # Run ./test.js and save the results in output/.
  $ eslump ./test.js output/

  # Narrow down the needed JavaScript to produce the error.
  # output/random.backup.js is handy if you go too far.
  $ vim output/random.js

  # Reproduce the narrowed down case.
  $ eslump ./test.js output/ --reproduce
```

### Module

### Overview

```js
const {generateRandomJS} = require("eslump");

const randomJSString = generateRandomJS({
  sourceType: "module",
  maxDepth: 7,
  comments: false,
  whitespace: false,
});
```

#### generateRandomJS(options)

Returns a string of random JavaScript code.

If you want, you can pass some options:

Option | Type | Default | Description
-------|------|---------|------------
sourceType | `"module"` or `"script"` | `"module"` | The type of code to generate.
maxDepth | integer | 7 | How deeply nested AST:s to generate.
comments | boolean | false | Whether or not to generate random comments.
whitespace | boolean | false | Whether or not to generate random whitespace.

## Disclaimer

eslump was created from the need of finding edge cases in [Prettier]. It started
out as a bare-bones little script in a branch on my fork of that repo. As I
wanted more and more features, I extracted it and fleshed it out in its own
repo. Then I realized that it might be useful to others, so I put it on GitHub
and made the CLI installable from npm.

Initially, eslump basically just strung together [shift-fuzzer] and
[shift-codegen]. Then, I realized that no random comments were generated, so I
hacked that in (along with random whitespace) since comments are very difficult
to get right in Prettier. Then, random parentheses and semicolons where
requested, so I hacked that in as well.

eslump has successfully found lots of little edge cases in Prettier, so it
evidently works. But there are no tests. (I’ve just gone meta and fuzz-tested it
using itself basically.)

From the beginning eslump was only ever intended to be a CLI tool, but other
people have started to want to use eslump's code generation as an npm module, so
these days it can also be used as a module. If you know what you're doing.

Here are some features I'd like to see from a proper random JS library:

- No hacks.
- Seeded randomness, so things can be reproduced.
- JSX and Flow support.
- Ability to generate code without any early errors.
- Possibly ways to prevent certain syntax constructs from being generated.

## Examples

There are several examples in the [examples](examples) directory.

- Parsers:
  - [acorn]
  - [Babylon]
  - [espree]
  - [esprima]
  - [flow]
  - [shift-parser]

- Code generators:
  - [babel-generator]
  - [escodegen]
  - [Prettier]
  - [shift-codegen]

To run the Babylon example, for instance, follow these steps:

1. Clone this repository.
2. `npm install` or (`yarn`)
3. `eslump ./examples/babylon.js output`

## Test files

```
$ eslump ./test.js output/
```

Test files, `./test.js` in the above example, must follow this pattern:

```js
module.exports = ({
  code, // String.
  sourceType, // String, either "module" or "script".
  reproductionData = {} // undefined or anything that `JSON.parse` can return.
}) => {
  if (testFailedSomehow) {
    return {
      error, // Caught Error object.
      reproductionData, // Optional. Anything that `JSON.stringify` can handle.
      artifacts // Optional. Object mapping file names to string contents.
    }
  }
  // If the test passed, return nothing.
};
```

- The main export is a function, called the _test function._

- The test function accepts a single argument, an object with the following
  properties:

  - code: `String`. Randomly generated JavaScript, or the contents of
    `OUTPUT_DIR/random.js` if using the `--reproduce` flag.

  - sourceType: `String`. Either `"module"` or `"script"`. ES2015 can be parsed
    in one of these modes, and parsers usually have an option for choosing
    between the two.

  - reproductionData: `undefined` or anything that `JSON.parse` can return.
    Normally, it is `undefined`. When using the `--reproduce` flag, this
    property contains the result of running `JSON.parse` on the contents of
    `OUTPUT_DIR/reproductionData.json`. This is used when the test function
    itself generates random data, such as random options for a parser.

    - If the test function is completely deterministic, ignore this property.
    - Otherwise, generate random options if it is `undefined`.
    - In all other cases, use its data to be able to reproduce a previous error.

- The test function returns nothing if the test succeeded. Then, eslump will run
  it again with new random JavaScript code. If the `--reproduce` flag is used,
  the test function will only be run once (and if nothing fails in that run
  something is wrong).

- The test function returns an object with the following properties if the test
  fails:

  - error: `Error`. The caught error. (Technically, this property can have any
    value, since anything can be `throw`n.)

  - reproductionData: Anything that `JSON.stringify` can handle. Optional. If
    the test function isn’t completely deterministic, such as when generating
    random options for a parser, the data needed to reproduce the error in the
    future must be set here. eslump will write this data to
    `OUTPUT_DIR/reproductionData.json`. That file will be read, parsed and
    passed to the test function when using the `--reproduce` flag.

  - artifacts. `Object`. Optional. Sometimes it can be useful to see
    intermediate values in addition to just the random JavaScript when a test
    fails, such as the AST from a parser. Each key-value pair describes a file
    to write:

    - The object keys are file paths relative to `OUTPUT_DIR`. The file will be
      written at `OUTPUT_DIR/key`.
    - The object values are the contents of the file. (The values will be passed
      trough the `String` function before writing.)

    Example:

    ```js
      {
        artifacts: {
          "ast.json": JSON.stringify(ast, null, 2)
        }
      }
    ```

- The test function must not throw errors, so be sure to wrap everything in
  try-catch. (eslump will catch uncaught errors, but it will not have a chance
  to write `OUTPUT_DIR/reproductionData.json` or any artifacts.)

## License

[MIT](LICENSE).

[acorn]: https://github.com/ternjs/acorn
[babel-generator]: https://github.com/babel/babel/tree/master/packages/babel-generator
[Babylon]: https://github.com/babel/babylon
[escodegen]: https://github.com/estools/escodegen
[esfuzz]: https://github.com/estools/esfuzz
[espree]: https://github.com/eslint/espree
[esprima]: https://github.com/jquery/esprima
[flow]: https://github.com/facebook/flow
[Prettier]: https://github.com/prettier/prettier/
[shift-codegen]: https://github.com/shapesecurity/shift-codegen-js
[shift-fuzzer]: https://github.com/shapesecurity/shift-fuzzer-js
[shift-parser]: https://github.com/shapesecurity/shift-parser-js
[typescript]: https://github.com/Microsoft/TypeScript
