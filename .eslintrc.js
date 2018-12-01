"use strict";

const baseRules = require("eslint-config-lydell");

module.exports = {
  root: true,
  plugins: ["import", "jest", "prettier"],
  parserOptions: {
    sourceType: "script",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    es6: true,
    node: true,
  },
  rules: Object.assign({}, baseRules({ import: true }), {
    "prettier/prettier": "error",
  }),
  overrides: [
    {
      files: ["*.test.js"],
      env: { jest: true },
      rules: baseRules({ builtin: false, jest: true }),
    },
  ],
};
