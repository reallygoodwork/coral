import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LLMCopyButton, ViewOptions } from '@/components/page-actions'
import { getPageImage, source } from '@/lib/source'
import { getMDXComponents } from '@/mdx-components'

export default async function Page(props: PageProps<'/[[...slug]]'>) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()
  const owner = 'reallygoodwork'
  const repo = 'coral'

  const MDX = page.data.body
  const components = getMDXComponents({
    a: createRelativeLink(source, page),
  })

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <h1 className="text-[1.75em] font-semibold">{page.data.title}</h1>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pt-2 pb-6">
        <LLMCopyButton markdownUrl={`/llms.mdx${page.url}.mdx`} />
        <ViewOptions
          markdownUrl={`/llms.mdx${page.url}.mdx`}
          githubUrl={`https://github.com/${owner}/${repo}/tree/main/apps/coral-docs/content/docs/${page.path}`}
        />
      </div>
      <div className="prose flex-1 text-fd-foreground/90">
      <MDX components={components} />
      </div>
      {/* <DocsBody>
        <MDX components={components} />
      </DocsBody> */}
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(
  props: PageProps<'/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  }
}
