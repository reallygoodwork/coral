import type { LoadedPackage } from '@reallygoodwork/coral-core'
import type { CoralRootNode } from '@reallygoodwork/coral-core'
import { generatePackage } from '../generatePackage'

describe('Package Generation', () => {
  it('should generate multiple component files', async () => {
    const mockPackage: LoadedPackage = {
      config: {
        name: '@test/design-system',
        version: '1.0.0',
        coral: { specVersion: '1.0.0' },
        components: { entry: './components/index.json' },
      },
      components: new Map<string, CoralRootNode>([
        [
          'Button',
          {
            name: 'Button',
            elementType: 'button',
            componentProperties: {
              label: { type: 'string', value: 'label' },
            },
          },
        ],
        [
          'Icon',
          {
            name: 'Icon',
            elementType: 'svg',
            componentProperties: {
              name: { type: 'string', value: 'name' },
            },
          },
        ],
      ]),
      componentIndex: null,
      tokenIndex: null,
      tokens: new Map(),
      basePath: '/test',
    }

    const result = await generatePackage(mockPackage, {
      componentFormat: 'arrow',
      styleFormat: 'inline',
      includeTypes: true,
    })

    expect(result.components).toHaveLength(2)
    expect(result.components.find((f) => f.path === 'Button.tsx')).toBeDefined()
    expect(result.components.find((f) => f.path === 'Icon.tsx')).toBeDefined()
    expect(result.index).toBeDefined()
    expect(result.index?.path).toBe('index.ts')
  })

  it('should generate index file with exports', async () => {
    const mockPackage: LoadedPackage = {
      config: {
        name: '@test/design-system',
        version: '1.0.0',
        coral: { specVersion: '1.0.0' },
        components: { entry: './components/index.json' },
      },
      components: new Map<string, CoralRootNode>([
        [
          'Button',
          {
            name: 'Button',
            elementType: 'button',
          },
        ],
      ]),
      componentIndex: null,
      tokenIndex: null,
      tokens: new Map(),
      basePath: '/test',
    }

    const result = await generatePackage(mockPackage, {
      includeTypes: true,
    })

    expect(result.index?.content).toContain("export { Button } from './Button'")
    expect(result.index?.content).toContain('export type { ButtonProps }')
  })

  it('should respect file naming convention from config', async () => {
    const mockPackage: LoadedPackage = {
      config: {
        name: '@test/design-system',
        version: '1.0.0',
        coral: { specVersion: '1.0.0' },
        components: { entry: './components/index.json' },
        exports: {
          react: {
            outDir: './dist',
            fileCase: 'kebab-case',
          },
        },
      },
      components: new Map<string, CoralRootNode>([
        [
          'IconButton',
          {
            name: 'IconButton',
            elementType: 'button',
          },
        ],
      ]),
      componentIndex: null,
      tokenIndex: null,
      tokens: new Map(),
      basePath: '/test',
    }

    const result = await generatePackage(mockPackage, {
      includeTypes: true,
    })

    expect(result.components[0].path).toBe('icon-button.tsx')
  })

  it('should generate components in dependency order', async () => {
    const mockPackage: LoadedPackage = {
      config: {
        name: '@test/design-system',
        version: '1.0.0',
        coral: { specVersion: '1.0.0' },
        components: { entry: './components/index.json' },
      },
      components: new Map<string, CoralRootNode>([
        [
          'Card',
          {
            name: 'Card',
            elementType: 'div',
            children: [
              {
                id: 'btn-1',
                name: 'CardButton',
                type: 'COMPONENT_INSTANCE',
                elementType: 'button',
                $component: {
                  ref: './button.coral.json',
                },
              },
            ],
          },
        ],
        [
          'Button',
          {
            name: 'Button',
            elementType: 'button',
          },
        ],
      ]),
      componentIndex: null,
      tokenIndex: null,
      tokens: new Map(),
      basePath: '/test',
    }

    const result = await generatePackage(mockPackage)

    // Button should come before Card since Card depends on Button
    const buttonIndex = result.components.findIndex((f) => f.path === 'Button.tsx')
    const cardIndex = result.components.findIndex((f) => f.path === 'Card.tsx')

    expect(buttonIndex).toBeLessThan(cardIndex)
  })
})
