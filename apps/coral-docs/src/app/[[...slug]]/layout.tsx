import { GithubInfo } from 'fumadocs-ui/components/github-info'
import { DocsLayout, type DocsLayoutProps } from 'fumadocs-ui/layouts/docs'
import { baseOptions } from '@/lib/layout.shared'
import { source, transformPageTreeWithHeadings } from '@/lib/source'
import { LinkIcon } from 'lucide-react'

function docsOptions(): DocsLayoutProps {
  return {
    ...baseOptions(),
    tree: transformPageTreeWithHeadings(source.pageTree),
    githubUrl: 'https://github.com/reallygoodwork/coral',

    links: [
      {
        label: 'coralui.com', // `aria-label`
        icon: <LinkIcon />,
        text: 'coralui.com',
        url: 'https://coralui.com',
        secondary: false,
      },
      {
        type: 'custom',
        children: (
          <GithubInfo owner="reallygoodwork" repo="coral" className="lg:-mx-2" />
        ),
      },
    ],
  }
}

export default function Layout({ children }: LayoutProps<'/[[...slug]]'>) {
  const base = baseOptions();
  return <DocsLayout {...docsOptions()} nav={{...base.nav, transparentMode: 'top',}}>{children}</DocsLayout>
}
