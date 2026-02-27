// Flat ESLint configuration for apps/web (Next.js 15 + TypeScript)
// ESLint v9+ format — see https://eslint.org/docs/latest/use/configure/migration-guide
const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');

// Try to load Next.js plugin — available via `eslint-config-next` dep
let nextPlugin;
try {
  nextPlugin = require('@next/eslint-plugin-next');
} catch {
  nextPlugin = null;
}

module.exports = [
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/coverage/**',
    ],
  },

  // ESLint recommended baseline
  js.configs.recommended,

  // TypeScript & React/Next.js source files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        jsxPragma: null, // React 17+ new JSX transform
      },
      globals: {
        // Node.js (used in Next.js server components / next.config.ts)
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'writable',
        Buffer: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        // Browser / fetch globals
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      ...(nextPlugin ? { '@next/next': nextPlugin } : {}),
    },
    rules: {
      // TypeScript recommended rules
      ...tsPlugin.configs['recommended'].rules,

      // Disable no-undef for TypeScript files — TypeScript itself catches this
      // and it incorrectly flags TS interface names (e.g. RequestInit, ReactNode)
      'no-undef': 'off',

      // Unused vars
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],

      // Next.js rules (only if plugin loaded)
      ...(nextPlugin ? nextPlugin.configs.recommended.rules : {}),
      ...(nextPlugin ? nextPlugin.configs['core-web-vitals'].rules : {}),
    },
  },

  // Test files — add Jest/Vitest globals
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly', // Vitest
        jest: 'readonly',
      },
    },
  },

  // Prettier must be last
  prettierConfig,
];
