import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl({
    output: 'standalone',
    outputFileTracingRoot: path.join(__dirname, '../..'),
});
