import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

// O ESLint 10 já reconhece variáveis usadas em JSX (<Componente />), então o
// plugin eslint-plugin-react deixou de ser necessário para o no-unused-vars.
export default [
  { ignores: ['build/**', 'coverage/**', 'node_modules/**', 'public/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, process: 'readonly' },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/__tests__/**/*.{js,jsx}', 'src/**/*.test.{js,jsx}', 'src/setupTests.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.vitest } },
  },
  {
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
];
