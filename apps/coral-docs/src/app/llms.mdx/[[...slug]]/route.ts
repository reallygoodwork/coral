import { getLLMText } from '@/lib/get-llm-text';
import { source } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/llms.mdx/[[...slug]]'>,
) {
  const { slug } = await params;
  // Remove 'docs' prefix if present (for backward compatibility)
  const cleanSlug = slug?.[0] === 'docs' ? slug.slice(1) : slug;
  const page = source.getPage(cleanSlug);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}