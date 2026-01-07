import type { CoralRootNode } from '@reallygoodwork/coral-core'
import { generateJSXElement } from '../generateJSX'

describe('Component Composition', () => {
  describe('Component Instance Rendering', () => {
    it('should render a simple component instance', () => {
      const spec: CoralRootNode = {
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
            propBindings: {
              label: 'Click me',
            },
          },
        ],
      }

      const jsx = generateJSXElement(spec, 0, new Map())
      expect(jsx).toContain('<Button')
      expect(jsx).toContain('label="Click me"')
    })

    it('should render component instance with prop references', () => {
      const spec: CoralRootNode = {
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
            propBindings: {
              label: { $prop: 'cardTitle' },
              disabled: { $prop: 'isDisabled' },
            },
          },
        ],
      }

      const jsx = generateJSXElement(spec, 0, new Map())
      expect(jsx).toContain('<Button')
      expect(jsx).toContain('label={props.cardTitle}')
      expect(jsx).toContain('disabled={props.isDisabled}')
    })

    it('should render component instance with variant overrides', () => {
      const spec: CoralRootNode = {
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
            propBindings: {
              label: 'Submit',
            },
            variantOverrides: {
              intent: 'primary',
              size: 'lg',
            },
          },
        ],
      }

      const jsx = generateJSXElement(spec, 0, new Map())
      expect(jsx).toContain('<Button')
      expect(jsx).toContain('intent="primary"')
      expect(jsx).toContain('size="lg"')
    })

    it('should render component instance with slot bindings', () => {
      const spec: CoralRootNode = {
        name: 'Dialog',
        elementType: 'div',
        children: [
          {
            id: 'modal-1',
            name: 'Modal',
            type: 'COMPONENT_INSTANCE',
            elementType: 'div',
            $component: {
              ref: './modal.coral.json',
            },
            slotBindings: {
              default: [
                {
                  name: 'Content',
                  elementType: 'p',
                  textContent: 'Modal content here',
                },
              ],
            },
          },
        ],
      }

      const jsx = generateJSXElement(spec, 0, new Map())
      expect(jsx).toContain('<Modal')
      expect(jsx).toContain('<p')
      expect(jsx).toContain('Modal content here')
      expect(jsx).toContain('</Modal>')
    })

    it('should render component instance with event bindings', () => {
      const spec: CoralRootNode = {
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
            propBindings: {
              label: 'Save',
            },
            eventBindings: {
              onClick: { $event: 'onSave' },
            },
          },
        ],
      }

      const jsx = generateJSXElement(spec, 0, new Map())
      expect(jsx).toContain('<Button')
      expect(jsx).toContain('onClick={props.onSave}')
    })

    it('should render self-closing component instance when no slots', () => {
      const spec: CoralRootNode = {
        name: 'Card',
        elementType: 'div',
        children: [
          {
            id: 'icon-1',
            name: 'Icon',
            type: 'COMPONENT_INSTANCE',
            elementType: 'svg',
            $component: {
              ref: './icon.coral.json',
            },
            propBindings: {
              name: 'check',
            },
          },
        ],
      }

      const jsx = generateJSXElement(spec, 0, new Map())
      expect(jsx).toContain('<Icon')
      expect(jsx).toContain('/>')
    })
  })

  describe('Component Imports', () => {
    it('should detect and track component dependencies', async () => {
      const { generateComponent } = await import('../generateComponent')

      const spec: CoralRootNode = {
        name: 'Card',
        elementType: 'div',
        children: [
          {
            id: 'btn-1',
            name: 'ActionButton',
            type: 'COMPONENT_INSTANCE',
            elementType: 'button',
            $component: {
              ref: './button.coral.json',
            },
          },
          {
            id: 'icon-1',
            name: 'Icon',
            type: 'COMPONENT_INSTANCE',
            elementType: 'svg',
            $component: {
              ref: './icon.coral.json',
            },
          },
        ],
      }

      const { reactCode } = await generateComponent(spec, {
        includeTypes: true,
      })

      expect(reactCode).toContain("import { Button } from './Button'")
      expect(reactCode).toContain("import { Icon } from './Icon'")
    })
  })
})
