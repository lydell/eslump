#!/usr/bin/env node

"use strict";

const run = require("./cli-program");

const result = run(process.argv.slice(2));

if (result.stderr) {
  process.stderr.write(`${result.stderr}\n`);
}

if (result.stdout) {
  process.stdout.write(`${result.stdout}\n`);
}

if ("code" in result) {
  process.exit(result.code);
}

if (result.loop) {
  for (const iterationResult of result.loop()) {
    process.stderr.clearLine();
    process.stderr.cursorTo(0);
    process.stderr.write(iterationResult.message);

    if ("code" in iterationResult) {
      process.stderr.write("\n");
      process.exit(iterationResult.code);
    }
  }
}

process.stderr.write("\nThe program ended in an unexpected way.");
process.exit(1);
