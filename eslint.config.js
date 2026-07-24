import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// eslint-config-next 15.1 ships eslintrc-style configs only, so they have to be
// bridged into flat config. Without this the Next.js plugin never loads and
// rules like next/no-img-element and next/no-html-link-for-pages never run.
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

export default defineConfig([
  // next.config.js sets distDir: 'dist'.
  globalIgnores(['dist', '.next', 'next-env.d.ts']),

  ...compat.extends('next/core-web-vitals'),

  {
    rules: {
      // next.config.js sets output: 'export'. A static export ships no
      // /_next/image optimizer endpoint, so <Image> emits a srcSet pointing at
      // URLs that 404 in production. Plain <img> is the correct choice here and
      // this rule's remedy is unavailable — leaving it on invites a "fix" that
      // silently breaks images on the live site.
      '@next/next/no-img-element': 'off',
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strict,
      ...tseslint.configs.stylistic,
      reactHooks.configs.flat.recommended,
    ],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          // The App Router requires these to be exported from the same file as
          // the page/layout component; they are not a Fast Refresh hazard.
          allowExportNames: [
            'metadata',
            'generateMetadata',
            'viewport',
            'generateViewport',
            'generateStaticParams',
            'dynamic',
            'revalidate',
            'fetchCache',
            'runtime',
          ],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    },
    languageOptions: {
      ecmaVersion: 2020,
      // Server components, route handlers and next.config run under Node.
      globals: { ...globals.browser, ...globals.node },
    },
  },
])
