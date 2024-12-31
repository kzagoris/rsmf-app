module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    quotes: ["error", "double"],
    "quote-props": ["error", "as-needed"],
    "max-len": ["error", { code: 120 }],
    "object-curly-spacing": ["error", "always"],
    "linebreak-style": "off",
    "require-jsdoc": "off",
    "import/no-unresolved": 0,
    semi: ["error", "never"],
    indent: ["error", 2],
  },
}
