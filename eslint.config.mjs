// eslint.config.mjs
import js from "@eslint/js";
import pluginTs from "@typescript-eslint/eslint-plugin";
import parserTs from "@typescript-eslint/parser";
import pluginImport from "eslint-plugin-import";
import pluginUnusedImports from "eslint-plugin-unused-imports";

export default [
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/*.test-helpers.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        fetch: 'readonly',
        global: 'readonly'
      },
    },
    rules: {
      // Disable all or selected rules here
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
      'import/order': 'off',
    },
  },
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        fetch: 'readonly',
        process: 'readonly',
        global: 'readonly',
        URL: 'readonly',
        Request: 'readonly',
        RequestInit: 'readonly',
        Response: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      "@typescript-eslint": pluginTs,
      import: pluginImport,
      "unused-imports": pluginUnusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "unused-imports/no-unused-imports": "warn",
      "import/order": ["warn", { alphabetize: { order: "asc" } }],
    }
  },
];
