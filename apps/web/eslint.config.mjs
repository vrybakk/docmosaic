import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        files: ['src/components/pdf-editor/PDFDocument.tsx'],
        rules: {
            'jsx-a11y/alt-text': 'off',
        },
    },
    {
        files: ['src/test/**/*.ts', 'src/test/**/*.tsx'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
];

export default eslintConfig;
