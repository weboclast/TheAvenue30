import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import { version as reactVersion } from 'react'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // eslint-plugin-react's `'detect'` calls an API ESLint 10 removed, so the
  // version is read here instead. Drop this once the plugin supports ESLint 10.
  { settings: { react: { version: reactVersion } } },
  // Override default ignores of eslint-config-next.
  // .agents/ holds agent skills (reference templates, not app code), and
  // .claude/ symlinks into it.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', '.agents/**', '.claude/**']),
])

export default eslintConfig
