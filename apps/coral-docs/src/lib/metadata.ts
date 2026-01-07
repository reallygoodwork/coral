import type { Metadata } from 'next/types';
import { Page } from './source';

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: 'https://docs.coralui.com',
      // images: '/banner.png',
      siteName: 'Coral UI',
      ...override.openGraph,
    },
    // alternates: {
    //   types: {
    //     'application/rss+xml': [
    //       {
    //         title: 'Coral UI Blog',
    //         url: 'https://docs.coralui.com/blog/rss.xml',
    //       },
    //     ],
    //   },
    //   ...override.alternates,
    // },
  };
}

export function getPageImage(page: Page) {
  const segments = [...page.slugs, 'image.webp'];

  return {
    segments,
    url: `/og/${segments.join('/')}`,
  };
}

export const baseUrl =
  process.env.NODE_ENV === 'development' || !process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL('http://localhost:3000')
    : new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);