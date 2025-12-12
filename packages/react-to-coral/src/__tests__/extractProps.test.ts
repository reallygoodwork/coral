import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import type * as t from '@babel/types'

import { extractProps } from '../extractProps'

const getParamFromFunction = (functionCode: string): t.Node | null => {
  const ast = parse(functionCode, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })

  let param: t.Node | null = null
  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.node.params.length > 0) {
        // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
        param = (path.node.params[0] as any) || null
      }
    },
    ArrowFunctionExpression(path) {
      if (path.node.params.length > 0) {
        // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between @babel/traverse and @babel/types versions
        param = (path.node.params[0] as any) || null
      }
    },
  })

  return param
}

describe('extractProps', () => {
  it('should return undefined for no parameters', () => {
    const result = extractProps(null)
    expect(result).toBeUndefined()
  })

  it('should extract props from object destructuring', () => {
    const functionCode = 'const Component = ({ title, count }) => {}'
    const param = getParamFromFunction(functionCode)

    const result = extractProps(param)

    expect(result).toBeDefined()
    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('count')
    expect(result?.title).toEqual({ value: 'title', type: 'any', optional: false })
    expect(result?.count).toEqual({ value: 'count', type: 'any', optional: false })
  })

  it('should extract props with TypeScript types', () => {
    const functionCode =
      'const Component = ({ title, count }: { title: string; count: number }) => {}'
    const param = getParamFromFunction(functionCode)

    const result = extractProps(param)

    expect(result).toBeDefined()
    expect((result?.title as { type: string })?.type).toBe('string')
    expect((result?.count as { type: string })?.type).toBe('number')
  })

  it('should handle rest parameters', () => {
    const functionCode = 'const Component = ({ title, ...rest }) => {}'
    const param = getParamFromFunction(functionCode)

    const result = extractProps(param)

    expect(result).toBeDefined()
    expect(result).toHaveProperty('title')
    expect('...rest' in (result || {})).toBe(true)
    expect(result?.['...rest']).toEqual({ value: '...rest', type: 'any' })
  })

  it('should handle identifier parameters', () => {
    const functionCode = 'const Component = (props) => {}'
    const param = getParamFromFunction(functionCode)

    const result = extractProps(param)

    expect(result).toBeDefined()
    expect(result).toHaveProperty('props')
    expect(result?.props).toEqual({ value: 'props', type: 'any', optional: false })
  })

  it('should handle typed identifier parameters', () => {
    const functionCode = 'const Component = (props: ComponentProps) => {}'
    const param = getParamFromFunction(functionCode)

    const result = extractProps(param)

    expect(result).toBeDefined()
    expect(result).toHaveProperty('props')
    expect((result?.props as { value: string })?.value).toBe('props')
  })

  it('should return undefined for empty object pattern', () => {
    const functionCode = 'const Component = ({}) => {}'
    const param = getParamFromFunction(functionCode)

    const result = extractProps(param)

    expect(result).toBeUndefined()
  })

  it('should handle complex TypeScript types', () => {
    const functionCode = `
      const Component = ({
        title,
        items,
        onClick
      }: {
        title: string;
        items: string[];
        onClick: () => void
      }) => {}
    `
    const param = getParamFromFunction(functionCode)

    const result = extractProps(param)

    expect(result).toBeDefined()
    expect((result?.title as { type: string })?.type).toBe('string')
    expect((result?.items as { type: string })?.type).toBe('string[]')
    // Function types can be "() => void" or similar, not just "function"
    expect((result?.onClick as { type: string })?.type).toMatch(/=>|function/)
  })
})
