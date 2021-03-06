### Version 3.0.0 (2020-04-10)

- Changed: Dropped support for Node.js 6 and Node.js 8.
- Improved: Updated dependencies. Thanks to Stephen Wade (@stephenwade)!

### Version 2.0.0 (2018-12-02)

- Fixed: Test files provided to the CLI are now resolved relative to CWD as expected.
- Changed: Dropped support for Node.js 4.
- Improved: Updated dependencies.
- Improved: Added some tests.

### Version 1.6.2 (2018-04-23)

- Fixed: The dependency range for shift-codegen allowed newer versions, but eslump relies on a non-public part of it which can change at any time – which it did (see [#5]). The shift-codegen version is now updated and the changes for the non-public stuff has been made. The version has also been locked down to avoid this problem in the future. Thanks to Toru Nagashima (@mysticatea)!

### Version 1.6.1 (2018-03-12)

- Fixed: The "Babel code frame" now shows up for parse errors again. (Regression since 1.6.0.)
- Fixed: `random.js` is now created as expected again. (Regression since 1.6.0.)
- Fixed: The examples were upgraded and fixed, and a `cherow` example was added. (Not part of the npm package.)

### Version 1.6.0 (2017-06-26)

- Added: Node.js 4 support. Thanks to Teddy Katz (@not-an-aardvark)!
- Added: eslump can now explicitly be used as an npm module, exposing the `generateRandomJS` function.

### Version 1.5.1 (2017-03-26)

- Fixed: Random comments can now be inserted at the end of sequences of whitespace.

### Version 1.5.0 (2017-03-25)

- Added: Newlines are sometimes printed instead of semicolons.
- Added: Expressions are sometimes wrapped in (unnecessary) parentheses.
- Changed: The `--comments` option now only deals with comments.
- Added: The `--whitespace` option for randomizing whitespace.

### Version 1.4.0 (2017-02-06)

- Improved: The probability of blank lines when using the `--comments` flag is now greater.

### Version 1.3.1 (2017-02-04)

- Fixed: A somewhat rare error message is now indented properly.

### Version 1.3.0 (2017-02-04)

- Improved: Artifacts are now written to disk when using the `--reproduce` flag. This makes it easier to narrow down errors.

### Version 1.2.0 (2017-02-03)

- Improved: The `--comments` option:
  - It is now much more robust.
  - `/**/` comments can now contain newlines.
  - Any sequence of whitespace is now randomized and possibly filled with comments.

### Version 1.1.1 (2017-01-30)

- Fixed: Added missing files to the npm package.

### Version 1.1.0 (2017-01-30)

- Added: The `--comments` option for inserting random comments in the random JS.

### Version 1.0.0 (2017-01-28)

- Initial release.

[#5]: https://github.com/lydell/eslump/issues/5
