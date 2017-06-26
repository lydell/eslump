### Version 1.6.0 (2017-06-26)

- Added: Node.js 4 support. Thanks to Teddy Katz (@not-an-aardvark)!
- Added: eslump can now explicitly be used as an npm module, exposing the
  `generateRandomJS` function.


### Version 1.5.1 (2017-03-26)

- Fixed: Random comments can now be inserted at the end of sequences of
  whitespace.


### Version 1.5.0 (2017-03-25)

- Added: Newlines are sometimes printed instead of semicolons.
- Added: Expressions are sometimes wrapped in (unnecessary) parentheses.
- Changed: The `--comments` option now only deals with comments.
- Added: The `--whitespace` option for randomizing whitespace.


### Version 1.4.0 (2017-02-06)

- Improved: The probability of blank lines when using the `--comments` flag is
  now greater.


### Version 1.3.1 (2017-02-04)

- Fixed: A somewhat rare error message is now indented properly.


### Version 1.3.0 (2017-02-04)

- Improved: Artifacts are now written to disk when using the `--reproduce` flag.
  This makes it easier to narrow down errors.


### Version 1.2.0 (2017-02-03)

- Improved: The `--comments` option:
  - It is now much more robust.
  - `/**/` comments can now contain newlines.
  - Any sequence of whitespace is now randomized and possibly filled with
    comments.


### Version 1.1.1 (2017-01-30)

- Fixed: Added missing files to the npm package.


### Version 1.1.0 (2017-01-30)

- Added: The `--comments` option for inserting random comments in the random JS.


### Version 1.0.0 (2017-01-28)

- Initial release.
