import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.{ts,tsx}'],
        ...react.configs.flat.recommended,
        languageOptions: {
            ...react.configs.flat.recommended.languageOptions,
            ecmaVersion: 2022,
            sourceType: 'module',
        },
        settings: {
            react: { version: 'detect' },
        },
        plugins: {
            ...react.configs.flat.recommended.plugins,
            'react-hooks': reactHooks,
        },
        rules: {
            ...react.configs.flat.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },
    prettier,
    {
        files: ['src/**/*.test.{ts,tsx}', 'src/test-setup.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
];
