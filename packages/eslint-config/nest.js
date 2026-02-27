/**
 * ESLint configuration for NestJS apps.
 */
module.exports = {
  extends: ["./index.js"],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    // NestJS uses decorators and class-based patterns
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",

    // Allow any for decorator metadata
    "@typescript-eslint/no-explicit-any": "warn",
  },
};
