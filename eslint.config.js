import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import { configs as astroConfigs } from 'eslint-plugin-astro'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**', 'eslint.config.js'],
  },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  /**
   * Import hygiene for source files. Astro virtual modules (e.g. `astro:content`)
   * are resolved by Astro/Vite, not Node/TypeScript, so we exclude them from
   * import/no-unresolved.
   */
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': {
        node: true,
        typescript: true,
      },
    },
    rules: {
      ...importPlugin.configs.recommended.rules,

      'import/no-unresolved': ['error', { ignore: ['^astro:'] }],

      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  /**
   * Astro: recommended rules and parsing for .astro files.
   */
  ...astroConfigs.recommended,

  /**
   * Accessibility checks for Astro templates.
   */
  {
    files: ['**/*.astro'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },

  /**
   * TypeScript: type-aware recommended rules for .ts/.tsx.
   */
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      ...tseslint.configs['recommended-type-checked'].rules,

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
    },
  },

  /**
   * Test files: enable Vitest globals.
   */
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: { ...globals.vitest },
    },
  },

  /**
   * Ensure ESLint does not conflict with Prettier. Keep this configuration last.
   */
  eslintConfigPrettier,
]
