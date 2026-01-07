import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock'
import { TypeTable } from 'fumadocs-ui/components/type-table'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import * as Twoslash from 'fumadocs-twoslash/ui';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    TypeTable,
    ...Twoslash,
    ...components,
  } as MDXComponents
}
