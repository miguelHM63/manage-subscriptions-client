import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsEslint from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import vitest from '@vitest/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tsRecommendedRules = tsEslint.configs.recommended.rules;
const tsTypeCheckedRules = tsEslint.configs['recommended-requiring-type-checking'].rules;
const reactRecommendedRules = reactPlugin.configs.recommended.rules;
const reactHooksRecommendedRules = reactHooks.configs.recommended.rules;

const browserGlobals = globals.browser;
const nodeGlobals = globals.node;

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    ignores: ['dist', 'node_modules', 'coverage', 'build', 'out', 'public'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
      },
    },

    plugins: {
      '@typescript-eslint': tsEslint,
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    rules: {
      ...tsRecommendedRules,
      ...tsTypeCheckedRules,
      ...reactRecommendedRules,
      ...reactHooksRecommendedRules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-var-requires': ['error'],
      '@typescript-eslint/no-unnecessary-type-assertion': ['warn'],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },

    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          project: './tsconfig.eslint.json',
          alwaysTryTypes: true,
        },
      },
    },
  },
  {
    files: ['test/**', 'tests/**', 'src/**/*.test.{ts,tsx,js,jsx}'],
    plugins: {
      vitest,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...vitest.environments.env.globals,
        ...browserGlobals,
        ...nodeGlobals,
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'vitest/expect-expect': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['vite.config.ts', 'vite.config.js', '*.config.{ts,js}'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: false },
      },
      globals: {
        ...nodeGlobals,
        ...browserGlobals,
      },
    },

    plugins: {
      '@typescript-eslint': tsEslint,
    },

    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-undef': 'off',
    },
  },
];
