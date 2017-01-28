module.exports = {
  extends: "eslint:recommended",
  plugins: ["prettier"],
  parserOptions: { ecmaVersion: 2015, sourceType: "script" },
  env: { es6: true, node: true },
  rules: { "prettier/prettier": "error" }
};
