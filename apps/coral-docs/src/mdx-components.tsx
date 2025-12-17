import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    pre: ({ ref: _ref, ...props }) => (
      // @ts-expect-error - React 19 type compatibility
      <CodeBlock {...props}>
        {/* @ts-expect-error - React 19 type compatibility */}
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    ...components,
  } as MDXComponents
}
