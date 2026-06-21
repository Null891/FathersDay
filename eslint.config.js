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
      // React Three Fiber's model is to mutate three.js objects (camera,
      // materials, geometry attributes) inside useFrame/useEffect and to seed
      // geometry with Math.random in useMemo. The v7 experimental hooks rules
      // flag all of that as "impure"/"immutable" — false positives here.
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // One-off Node helper script (CommonJS).
    files: ['update-photos.js', 'scripts/**'],
    languageOptions: { globals: globals.node },
  },
])
