import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.next/**',
      'apps/legacy-php-site/**',
      'data/legacy/**',
      'apps/interactive-map/qgis/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['apps/{cms,game}/**/*.{js,mjs,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin
    },
    settings: {
      next: {
        rootDir: ['apps/cms/', 'apps/game/']
      }
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error'
    }
  },
  {
    files: ['apps/*/next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off'
    }
  },
  {
    files: ['apps/server/src/**/*.test.ts', 'packages/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  }
);
