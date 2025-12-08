import js from '@eslint/js'
import vitestPlugin from '@vitest/eslint-plugin'
import prettierConfig from 'eslint-config-prettier/flat'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,

    {
        name: 'global-ignores',
        ignores: [
            '**/*.snap',
            '**/dist/',
            '**/.yalc/',
            '**/build/',
            '**/temp/',
            '**/.temp/',
            '**/.tmp/',
            '**/.yarn/',
            '**/coverage/',
        ],
    },
    {
        name: `${js.meta.name}/recommended`,
        ...js.configs.recommended,
    },
    vitestPlugin.configs.recommended,
    {
        name: 'eslint-plugin-react/jsx-runtime',
        ...reactPlugin.configs.flat['jsx-runtime'],
    },
    reactHooksPlugin.configs['recommended-latest'],
    {
        name: 'main',
        linterOptions: {
            reportUnusedDisableDirectives: 2,
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        settings: {
            vitest: {
                typecheck: true,
            },
        },
        rules: {
            'no-undef': [0],
            '@typescript-eslint/consistent-type-definitions': [2, 'type'],
            '@typescript-eslint/consistent-type-imports': [
                2,
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                    disallowTypeAnnotations: true,
                },
            ],
            'no-restricted-imports': [
                2,
                {
                    paths: [
                        {
                            name: 'react-redux',
                            importNames: ['useSelector', 'useStore', 'useDispatch'],
                            message:
                                'Please use pre-typed versions from `src/store/hooks.ts` instead.',
                        },
                    ],
                },
            ],
        },
    },
    {
        name: 'allow-react-redux-in-typed-hooks',
        files: ['src/store/hooks.ts'],
        rules: {
            'no-restricted-imports': 0,
        },
    },

    prettierConfig,
)
