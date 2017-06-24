module.exports = {
  extends: "eslint:recommended",
  plugins: ["node", "prettier"],
  parserOptions: { ecmaVersion: 2015, sourceType: "script" },
  env: { es6: true, node: true },
  rules: {
    "prettier/prettier": "error",
    "node/no-unsupported-features": "error"
  }
};
