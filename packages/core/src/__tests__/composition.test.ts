import {
  buildDependencyGraph,
  extractComponentName,
  findCircularDependencies,
  findComponentInstances,
  isComponentInstance,
  isPropBinding,
  toKebabCase,
  toPascalCase,
  zComponentInstanceSchema,
  zComponentSetSchema,
} from '../structures/composition'

describe('Composition Schema', () => {
  describe('ComponentInstanceSchema', () => {
    it('should validate a minimal component instance', () => {
      const instance = {
        id: 'button-1',
        name: 'ActionButton',
        type: 'COMPONENT_INSTANCE' as const,
        $component: { ref: './button/button.coral.json' },
      }
      const result = zComponentInstanceSchema.safeParse(instance)
      expect(result.success).toBe(true)
    })

    it('should validate component instance with bindings', () => {
      const instance = {
        id: 'card-action',
        name: 'CardAction',
        type: 'COMPONENT_INSTANCE' as const,
        $component: { ref: './button/button.coral.json', version: '^1.0.0' },
        propBindings: {
          intent: 'secondary',
          disabled: { $prop: 'isDisabled' },
        },
        eventBindings: {
          onClick: { $event: 'onAction' },
        },
        slotBindings: {
          default: { $prop: 'actionLabel' },
        },
        variantOverrides: { size: 'sm' },
      }
      const result = zComponentInstanceSchema.safeParse(instance)
      expect(result.success).toBe(true)
    })
  })

  describe('ComponentSetSchema', () => {
    it('should validate a component set', () => {
      const set = {
        name: 'Tabs',
        version: '1.0.0',
        description: 'Tabbed interface',
        members: [
          { name: 'Tabs', path: './tabs.coral.json', role: 'root' as const },
          {
            name: 'TabList',
            path: './tab-list.coral.json',
            role: 'container' as const,
          },
          { name: 'Tab', path: './tab.coral.json', role: 'trigger' as const },
          {
            name: 'TabPanel',
            path: './tab-panel.coral.json',
            role: 'content' as const,
          },
        ],
        sharedContext: {
          properties: {
            activeTab: { type: 'string', description: 'Currently active tab' },
          },
        },
      }
      const result = zComponentSetSchema.safeParse(set)
      expect(result.success).toBe(true)
    })
  })

  describe('Type Guards', () => {
    it('isComponentInstance should identify component instances', () => {
      expect(
        isComponentInstance({
          type: 'COMPONENT_INSTANCE',
          $component: { ref: 'x' },
        }),
      ).toBe(true)
      expect(isComponentInstance({ type: 'NODE' })).toBe(false)
      expect(isComponentInstance(null)).toBe(false)
    })

    it('isPropBinding should identify prop bindings', () => {
      expect(isPropBinding({ $prop: 'label' })).toBe(true)
      expect(isPropBinding('static value')).toBe(false)
      expect(isPropBinding({ $event: 'onClick' })).toBe(false)
    })
  })

  describe('Utility Functions', () => {
    it('extractComponentName should extract name from path', () => {
      expect(extractComponentName('./button/button.coral.json')).toBe('Button')
      expect(extractComponentName('./icon-button/icon-button.coral.json')).toBe(
        'IconButton',
      )
      expect(extractComponentName('./data_table/data_table.coral.json')).toBe(
        'DataTable',
      )
    })

    it('toPascalCase should convert to PascalCase', () => {
      expect(toPascalCase('button')).toBe('Button')
      expect(toPascalCase('icon-button')).toBe('IconButton')
      expect(toPascalCase('data_table')).toBe('DataTable')
    })

    it('toKebabCase should convert to kebab-case', () => {
      expect(toKebabCase('Button')).toBe('button')
      expect(toKebabCase('IconButton')).toBe('icon-button')
      expect(toKebabCase('DataTable')).toBe('data-table')
    })
  })

  describe('findComponentInstances', () => {
    it('should find instances in simple tree', () => {
      const node = {
        name: 'Root',
        type: 'NODE' as const,
        elementType: 'div' as const,
        children: [
          {
            id: 'btn-1',
            name: 'Button1',
            type: 'COMPONENT_INSTANCE' as const,
            $component: { ref: './button.coral.json' },
          },
        ],
      }

      const instances = findComponentInstances(node)
      expect(instances).toHaveLength(1)
      expect(instances[0].instance.$component.ref).toBe('./button.coral.json')
    })

    it('should find nested instances', () => {
      const node = {
        name: 'Root',
        type: 'NODE' as const,
        elementType: 'div' as const,
        children: [
          {
            name: 'Wrapper',
            type: 'NODE' as const,
            elementType: 'div' as const,
            children: [
              {
                id: 'btn-1',
                name: 'Button1',
                type: 'COMPONENT_INSTANCE' as const,
                $component: { ref: './button.coral.json' },
              },
            ],
          },
          {
            id: 'btn-2',
            name: 'Button2',
            type: 'COMPONENT_INSTANCE' as const,
            $component: { ref: './icon-button.coral.json' },
          },
        ],
      }

      const instances = findComponentInstances(node)
      expect(instances).toHaveLength(2)
    })
  })

  describe('buildDependencyGraph', () => {
    it('should build graph from components', () => {
      const components = new Map<string, { root: unknown }>([
        [
          'Card',
          {
            root: {
              name: 'Card',
              type: 'NODE',
              elementType: 'div',
              children: [
                {
                  id: 'btn',
                  name: 'CardButton',
                  type: 'COMPONENT_INSTANCE',
                  $component: { ref: './button.coral.json' },
                },
              ],
            },
          },
        ],
        [
          'Button',
          {
            root: {
              name: 'Button',
              type: 'NODE',
              elementType: 'button',
              children: [],
            },
          },
        ],
      ])

      const graph = buildDependencyGraph(components)

      expect(graph.get('Card')?.has('Button')).toBe(true)
      expect(graph.get('Button')?.size).toBe(0)
    })
  })

  describe('findCircularDependencies', () => {
    it('should find circular dependencies', () => {
      const graph = new Map([
        ['A', new Set(['B'])],
        ['B', new Set(['C'])],
        ['C', new Set(['A'])],
      ])

      const cycles = findCircularDependencies(graph)
      expect(cycles.length).toBeGreaterThan(0)
    })

    it('should return empty for no cycles', () => {
      const graph = new Map([
        ['A', new Set(['B'])],
        ['B', new Set(['C'])],
        ['C', new Set<string>()],
      ])

      const cycles = findCircularDependencies(graph)
      expect(cycles).toHaveLength(0)
    })
  })
})
