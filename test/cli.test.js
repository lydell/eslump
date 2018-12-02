"use strict";

process.env.FORCE_COLOR = "0";

const fs = require("fs");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const run = require("../src/cli-program");
const mock = require("./fixtures/mock");

function loop(n, result) {
  const generator = result.loop();
  const values = [];
  for (let i = n; i > 0; i--) {
    values.push(generator.next().value);
  }
  return values;
}

beforeEach(() => {
  mock.mockReset();
  rimraf.sync("test-output");
});

test("--help", () => {
  expect(run(["--help"])).toEqual({
    code: 0,
    stdout: expect.any(String),
  });
});

test("--version", () => {
  expect(run(["--version"])).toEqual({
    code: 0,
    stdout: expect.stringMatching(/^\d+\.\d+\.\d+$/),
  });
});

test("unknown flag", () => {
  expect(run(["--nope"])).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Invalid option '--nope' - perhaps you meant '-r'?",
}
`);
});

test("wrong amount of arguments", () => {
  expect(run(["test.js"])).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Expected 0 or 2 arguments, but 1 given.",
}
`);
  expect(run(["test.js", "test-output", "extra"])).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Expected 0 or 2 arguments, but 3 given.",
}
`);
});

test("invalid --reproduce", () => {
  expect(run(["--reproduce"])).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "The --reproduce flag cannot be used without arguments.",
}
`);
});

test("random JS as stdout", () => {
  expect(run([])).toMatchInlineSnapshot(
    {
      stdout: expect.any(String),
    },
    `
Object {
  "code": 0,
  "stdout": Any<String>,
}
`
  );
});

test("missing test file", () => {
  expect(run(["test.js", "test-output"])).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Cannot find \\"test.js\\"",
}
`);
});

test("throwing test file", () => {
  expect(run(["test/fixtures/throws.js", "test-output"]))
    .toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Error when loading \\"test/fixtures/throws.js\\":
Error: startup error
<stack trace>",
}
`);
});

test("bad require in test file", () => {
  expect(run(["test/fixtures/bad-require.js", "test-output"]))
    .toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Error when loading \\"test/fixtures/bad-require.js\\":
Error: Cannot find module './nope' from 'bad-require.js'
<stack trace>",
}
`);
});

test("forgotten export", () => {
  expect(run(["test/fixtures/forgotten-export.js", "test-output"]))
    .toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Expected \`module.exports\` in \\"test/fixtures/forgotten-export.js\\" to be a function, but got: [object Object]",
}
`);
});

test("missing reproduction files", () => {
  expect(run(["test/fixtures/simple.js", "test-output", "--reproduce"]))
    .toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Failed to read \\"test-output/random.js\\" for reproduction:
ENOENT: no such file or directory, open 'test-output/random.js'",
}
`);
});

test("bad reproduction data file", () => {
  expect(
    run([
      "test/fixtures/simple.js",
      "test/fixtures/repro-bad-data",
      "--reproduce",
    ])
  ).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Failed to read \\"test/fixtures/repro-bad-data/reproductionData.json\\" for reproduction:
EISDIR: illegal operation on a directory, read",
}
`);
});

test("bad reproduction json", () => {
  expect(
    run([
      "test/fixtures/simple.js",
      "test/fixtures/repro-bad-json",
      "--reproduce",
    ])
  ).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Failed to parse JSON in \\"test/fixtures/repro-bad-json/reproductionData.json\\":
Unexpected token i in JSON at position 0",
}
`);
});

test("simple loop", () => {
  expect(loop(3, run(["test/fixtures/simple.js", "test-output"])))
    .toMatchInlineSnapshot(`
Array [
  Object {
    "message": "Attempt 1: Success",
  },
  Object {
    "message": "Attempt 2: Success",
  },
  Object {
    "message": "Attempt 3: Success",
  },
]
`);
});

test("test file success", () => {
  expect(loop(1, run(["test/fixtures/mock.js", "test-output"])))
    .toMatchInlineSnapshot(`
Array [
  Object {
    "message": "Attempt 1: Success",
  },
]
`);
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock.mock.calls[0]).toHaveLength(1);
  expect(mock.mock.calls[0][0]).toMatchInlineSnapshot(
    {
      code: expect.any(String),
    },
    `
Object {
  "code": Any<String>,
  "reproductionData": undefined,
  "sourceType": "module",
}
`
  );
});

test("--source-type script", () => {
  loop(
    1,
    run(["test/fixtures/mock.js", "test-output", "--source-type", "script"])
  );
  expect(mock.mock.calls[0][0]).toMatchInlineSnapshot(
    {
      code: expect.any(String),
    },
    `
Object {
  "code": Any<String>,
  "reproductionData": undefined,
  "sourceType": "script",
}
`
  );
});

test("test file throws an error", () => {
  mock
    .mockImplementationOnce(() => undefined)
    .mockImplementationOnce(() => {
      throw new Error("unexpected error");
    });
  expect(loop(3, run(["test/fixtures/mock.js", "test-output"])))
    .toMatchInlineSnapshot(`
Array [
  Object {
    "message": "Attempt 1: Success",
  },
  Object {
    "code": 1,
    "message": "Attempt 2: The test function threw an unexpected error:
Error: unexpected error
<stack trace>",
  },
  undefined,
]
`);
  expect(fs.readdirSync("test-output")).toMatchInlineSnapshot(`
Array [
  "random.backup.js",
  "random.js",
]
`);
});

test("fails to write thrown error output", () => {
  mkdirp.sync("test-output/random.js");
  mock.mockImplementationOnce(() => {
    throw new Error("unexpected error");
  });
  expect(loop(2, run(["test/fixtures/mock.js", "test-output"])))
    .toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function threw an unexpected error:
Error: unexpected error
<stack trace>

Failed to write write \\"test-output/random.js\\":
EISDIR: illegal operation on a directory, open 'test-output/random.js'",
  },
  undefined,
]
`);
});

test("test file returns an error", () => {
  mock
    .mockImplementationOnce(() => undefined)
    .mockImplementationOnce(() => ({
      error: new Error("test failed"),
    }));
  expect(loop(3, run(["test/fixtures/mock.js", "test-output"])))
    .toMatchInlineSnapshot(`
Array [
  Object {
    "message": "Attempt 1: Success",
  },
  Object {
    "code": 1,
    "message": "Attempt 2: The test function returned an error:
Error: test failed
<stack trace>",
  },
  undefined,
]
`);
  expect(fs.readdirSync("test-output")).toMatchInlineSnapshot(`
Array [
  "random.backup.js",
  "random.js",
]
`);
});

test("test file returns an error with extra data", () => {
  mock
    .mockImplementationOnce(() => undefined)
    .mockImplementationOnce(() => ({
      error: new Error("test failed"),
      reproductionData: { one: "1", two: 2 },
      artifacts: {
        "one.js": "1",
        "ast.json": "{}",
      },
    }));
  expect(loop(3, run(["test/fixtures/mock.js", "test-output"])))
    .toMatchInlineSnapshot(`
Array [
  Object {
    "message": "Attempt 1: Success",
  },
  Object {
    "code": 1,
    "message": "Attempt 2: The test function returned an error:
Error: test failed
<stack trace>",
  },
  undefined,
]
`);
  expect(fs.readdirSync("test-output")).toMatchInlineSnapshot(`
Array [
  "ast.json",
  "one.js",
  "random.backup.js",
  "random.js",
  "reproductionData.json",
]
`);
});

test("fails to write returned error output", () => {
  mkdirp.sync("test-output/random.js");
  mock.mockImplementationOnce(() => ({
    error: new Error("test failed"),
  }));
  expect(loop(2, run(["test/fixtures/mock.js", "test-output"])))
    .toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function returned an error:
Error: test failed
<stack trace>

Failed to write write \\"test-output/random.js\\":
EISDIR: illegal operation on a directory, open 'test-output/random.js'",
  },
  undefined,
]
`);
});

test("fails to mkdirp error output", () => {
  fs.writeFileSync("test-output", "annoying file");
  mock.mockImplementationOnce(() => ({
    error: new Error("test failed"),
  }));
  const result = loop(2, run(["test/fixtures/mock.js", "test-output"]));
  expect(result).toHaveLength(2);
  result[0].message = result[0].message.replace(
    /(EEXIST)[\s\S]*/,
    "$1: file already exists"
  );
  expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function returned an error:
Error: test failed
<stack trace>

Failed to \`mkdir -p\` \\"test-output\\":
EEXIST: file already exists",
  },
  undefined,
]
`);
});

test("fails to json stringify reproduction data", () => {
  const circular = {};
  circular.circular = circular;
  mock.mockImplementationOnce(() => ({
    error: new Error("test failed"),
    reproductionData: circular,
  }));
  expect(loop(2, run(["test/fixtures/mock.js", "test-output"])))
    .toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function returned an error:
Error: test failed
<stack trace>

Failed to run \`JSON.stringify\` on the returned reproductionData:

reproductionData:

  [object Object]

Error:

  Converting circular structure to JSON",
  },
  undefined,
]
`);
});

test("--reproduce", () => {
  mock.mockImplementationOnce(() => ({
    error: new Error("reproduced"),
  }));
  expect(
    loop(
      2,
      run(["test/fixtures/mock.js", "test/fixtures/repro", "--reproduce"])
    )
  ).toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function returned an error:
Error: reproduced
<stack trace>",
  },
  undefined,
]
`);
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock.mock.calls[0]).toHaveLength(1);
  expect(mock.mock.calls[0][0]).toMatchInlineSnapshot(`
Object {
  "code": "// eslint-disable-next-line
1 + 2;
",
  "reproductionData": undefined,
  "sourceType": "module",
}
`);
});

test("--reproduce with reproduction data", () => {
  mock.mockImplementationOnce(() => ({
    error: new Error("reproduced"),
  }));
  expect(
    loop(
      2,
      run(["test/fixtures/mock.js", "test/fixtures/repro-data", "--reproduce"])
    )
  ).toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function returned an error:
Error: reproduced
<stack trace>",
  },
  undefined,
]
`);
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock.mock.calls[0]).toHaveLength(1);
  expect(mock.mock.calls[0][0]).toMatchInlineSnapshot(`
Object {
  "code": "// eslint-disable-next-line
1 + 2;
",
  "reproductionData": Object {
    "one": 1,
    "two": "two",
  },
  "sourceType": "module",
}
`);
});

test("--reproduce but no error", () => {
  expect(
    loop(
      2,
      run(["test/fixtures/mock.js", "test/fixtures/repro", "--reproduce"])
    )
  ).toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Failed to reproduce the error; the test function succeeded.",
  },
  undefined,
]
`);
});

describe("parse errors", () => {
  test("acorn", () => {
    expect(
      loop(
        1,
        run(["examples/acorn.js", "test/fixtures/repro-parse-error", "-r"])
      )
    ).toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function returned an error:
SyntaxError: Unexpected token (4:14)
<stack trace>
  2 | 
  3 | function add(a, b) {
> 4 |   return a ++ b;
    |               ^
  5 | }
  6 | ",
  },
]
`);
  });

  test("babel-parser", () => {
    expect(
      loop(
        1,
        run(["examples/cherow.js", "test/fixtures/repro-parse-error", "-r"])
      )
    ).toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function returned an error:
SyntaxError: Line 4, column 14: Unexpected token 'identifier'
<stack trace>
  2 | 
  3 | function add(a, b) {
> 4 |   return a ++ b;
    |               ^
  5 | }
  6 | ",
  },
]
`);
  });

  test("cherow", () => {
    expect(
      loop(
        1,
        run(["examples/cherow.js", "test/fixtures/repro-parse-error", "-r"])
      )
    ).toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function returned an error:
SyntaxError: Line 4, column 14: Unexpected token 'identifier'
<stack trace>
  2 | 
  3 | function add(a, b) {
> 4 |   return a ++ b;
    |               ^
  5 | }
  6 | ",
  },
]
`);
  });

  test("espree", () => {
    expect(
      loop(
        1,
        run(["examples/espree.js", "test/fixtures/repro-parse-error", "-r"])
      )
    ).toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function returned an error:
SyntaxError: Unexpected token b
<stack trace>
  2 | 
  3 | function add(a, b) {
> 4 |   return a ++ b;
    |               ^
  5 | }
  6 | ",
  },
]
`);
  });

  test("esprima", () => {
    expect(
      loop(
        1,
        run(["examples/esprima.js", "test/fixtures/repro-parse-error", "-r"])
      )
    ).toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function returned an error:
Error: Line 4: Unexpected identifier
<stack trace>
  2 | 
  3 | function add(a, b) {
> 4 |   return a ++ b;
    |               ^
  5 | }
  6 | ",
  },
]
`);
  });

  test("flow", () => {
    expect(
      loop(
        1,
        run(["examples/flow.js", "test/fixtures/repro-parse-error", "-r"])
      )
    ).toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function returned an error:
SyntaxError: Unexpected identifier (4:14)
<stack trace>
  2 | 
  3 | function add(a, b) {
> 4 |   return a ++ b;
    |               ^
  5 | }
  6 | ",
  },
]
`);
  });

  test("shift-parser", () => {
    expect(
      loop(
        1,
        run([
          "examples/shift-parser.js",
          "test/fixtures/repro-parse-error",
          "-r",
        ])
      )
    ).toMatchInlineSnapshot(`
Array [
  Object {
    "code": 1,
    "message": "Attempt 1: The test function returned an error:
Error: [4:15]: Unexpected identifier
<stack trace>
  2 | 
  3 | function add(a, b) {
> 4 |   return a ++ b;
    |               ^
  5 | }
  6 | ",
  },
]
`);
  });
});
