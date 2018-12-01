"use strict";

const baseRules = require("eslint-config-lydell");

module.exports = {
  root: true,
  plugins: ["import", "prettier"],
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
};
