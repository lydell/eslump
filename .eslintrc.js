"use strict";

module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2018
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    "arrow-body-style": "error",
    curly: "error",
    "dot-notation": "error",
    "no-shadow": "error",
    "no-var": "error",
    "prefer-const": "error",
    "object-shorthand": "error",
    "one-var": ["error", "never"],
    "prefer-arrow-callback": "error",
    "prefer-destructuring": ["error", { array: false, object: true }],
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "prefer-template": "error",
    eqeqeq: ["error", "always", { null: "ignore" }],
    strict: "error",
  },
  overrides: [
    {
      files: ["*.test.js"],
      extends: ["plugin:jest/recommended", "plugin:jest/style"],
      env: { jest: true },
      rules: {
        "jest/valid-title": "off",
      },
    },
  ],
};
