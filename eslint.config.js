import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    // domain/ は UI・ブラウザAPI 非依存 (design.md §3)
    files: ['src/domain/**/*.ts'],
    languageOptions: {
      globals: {},
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'domain/ は React に依存しない' },
            { name: 'react-dom', message: 'domain/ は React に依存しない' },
            { name: 'recharts', message: 'domain/ は UI ライブラリに依存しない' },
          ],
          patterns: ['../components/*', '../state/*', '../styles/*'],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'domain/ はブラウザAPIを使わない' },
        { name: 'document', message: 'domain/ はブラウザAPIを使わない' },
        { name: 'navigator', message: 'domain/ はブラウザAPIを使わない' },
        { name: 'location', message: 'domain/ はブラウザAPIを使わない' },
        { name: 'history', message: 'domain/ はブラウザAPIを使わない' },
        { name: 'localStorage', message: 'domain/ はブラウザAPIを使わない' },
      ],
    },
  },
);
