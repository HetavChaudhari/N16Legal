import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Allow unused imports of components/constants (e.g. `React`) and unused catch params
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', caughtErrors: 'none' }],
      // fetch-on-mount (async setState after await) is idiomatic; this rule flags it too eagerly
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // Context files intentionally export both a context and its provider component
    files: ['**/context/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
