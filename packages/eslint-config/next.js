/**
 * ESLint configuration for Next.js apps.
 */
module.exports = {
  extends: [
    "./index.js",
    "next/core-web-vitals",
  ],
  env: {
    browser: true,
    node: true,
  },
  rules: {
    // Next.js specific
    "@next/next/no-html-link-for-pages": "error",

    // React specific
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
  },
};
