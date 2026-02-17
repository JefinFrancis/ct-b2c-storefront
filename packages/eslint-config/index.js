/**
 * Base ESLint configuration for the monorepo.
 * Extended by app-specific configs.
 */
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  rules: {
    // TypeScript handles these
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],

    // Allow explicit any in some cases (prefer unknown)
    "@typescript-eslint/no-explicit-any": "warn",

    // Require explicit return types on module boundaries
    "@typescript-eslint/explicit-module-boundary-types": "off",

    // Allow empty functions (useful for no-op callbacks)
    "@typescript-eslint/no-empty-function": "off",

    // Consistent type imports
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" },
    ],
  },
  ignorePatterns: ["node_modules/", "dist/", ".next/", ".turbo/", "coverage/"],
};
