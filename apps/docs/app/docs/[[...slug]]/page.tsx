import { source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { MarkdownActions } from '@/components/markdown-actions';
import type { Metadata } from 'next';
import { absoluteUrl, createMetadata, ogImageUrl, siteConfig } from '@/lib/metadata';
import { JsonLd, articleSchema, breadcrumbSchema } from '@/components/structured-data';

interface PageRouteProps {
    params: Promise<{ slug?: string[] }>;
}

export default async function Page(props: PageRouteProps) {
    const params = await props.params;
    const page = source.getPage(params.slug);
    if (!page) notFound();

    const MDX = page.data.body;
    const pageUrl = absoluteUrl(page.url);

    return (
        <DocsPage toc={page.data.toc} full={page.data.full}>
            <DocsTitle>{page.data.title}</DocsTitle>
            <DocsDescription>{page.data.description}</DocsDescription>
            <MarkdownActions slug={page.slugs.join('/')} />
            <JsonLd
                data={articleSchema({
                    title: page.data.title,
                    description: page.data.description,
                    url: pageUrl,
                })}
            />
            <JsonLd
                data={breadcrumbSchema([
                    { name: siteConfig.docsName, url: siteConfig.url },
                    { name: page.data.title, url: pageUrl },
                ])}
            />
            <DocsBody>
                <MDX components={getMDXComponents()} />
            </DocsBody>
        </DocsPage>
    );
}

export async function generateStaticParams() {
    return source.generateParams();
}

export async function generateMetadata(props: PageRouteProps): Promise<Metadata> {
    const params = await props.params;
    const page = source.getPage(params.slug);
    if (!page) notFound();

    return createMetadata({
        title: page.data.title,
        description: page.data.description,
        path: page.url,
        type: 'article',
        image: { url: ogImageUrl(page.slugs), width: 1200, height: 630 },
    });
}
