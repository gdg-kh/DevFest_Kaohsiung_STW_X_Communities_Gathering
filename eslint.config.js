import js from '@eslint/js';
import globals from 'globals';
import html from 'eslint-plugin-html';
import prettier from 'eslint-config-prettier';

export default [
  // Global ignores
  {
    ignores: ['node_modules/**', 'dist/**', '*.min.js'],
  },

  // Base JavaScript configuration
  js.configs.recommended,

  // Browser environment configuration
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // Best Practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'warn',

      // Code Style (defer to Prettier for most formatting)
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],

      // ES6+
      'arrow-spacing': 'error',
      'no-duplicate-imports': 'error',
      'object-shorthand': 'warn',
      'prefer-arrow-callback': 'warn',
    },
  },

  // Node.js scripts (ESM) configuration
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'warn',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'arrow-spacing': 'error',
      'no-duplicate-imports': 'error',
      'object-shorthand': 'warn',
      'prefer-arrow-callback': 'warn',
    },
  },

  // HTML files configuration
  {
    files: ['**/*.html'],
    plugins: {
      html,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // Prettier integration (must be last)
  prettier,
];
