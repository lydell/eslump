module.exports = {
  extends: "eslint:recommended",
  plugins: ["prettier"],
  env: {
    es6: true,
    node: true
  },
  rules: {
    "prettier/prettier": "error"
  }
};
