/**
 * Tests for code examples in the Component Composition guide
 */

import {
  findComponentInstances,
  getInstanceDependencies,
  findCircularDependencies,
  flattenComponentTree,
} from '@reallygoodwork/coral-core';
import type { CoralRootNode, ComponentInstance } from '@reallygoodwork/coral-core';

describe('Composition Guide Examples', () => {
  describe('Component Instances', () => {
    const alertDialog: CoralRootNode = {
      name: 'AlertDialog',
      elementType: 'div',
      children: [
        {
          name: 'CloseButton',
          type: 'COMPONENT_INSTANCE',
          elementType: 'button',
          $component: {
            ref: './button/button.coral.json',
            version: '^1.0.0',
          },
          propBindings: {
            label: 'Close',
            intent: 'secondary',
            size: 'sm',
          },
          eventBindings: {
            onClick: { $event: 'onClose' },
          },
        } as ComponentInstance,
      ],
    };

    it('should find component instances in a tree', () => {
      const instances = findComponentInstances(alertDialog);

      expect(instances).toBeDefined();
      expect(instances.length).toBeGreaterThan(0);
      expect(instances[0].instance.$component.ref).toBe(
        './button/button.coral.json',
      );
    });

    it('should get instance dependencies', () => {
      const instances = findComponentInstances(alertDialog);
      expect(instances.length).toBeGreaterThan(0);

      const deps = getInstanceDependencies(instances[0].instance);

      expect(deps).toBeDefined();
      expect(deps).toContain('./button/button.coral.json');
    });
  });

  describe('Prop Bindings', () => {
    it('should handle static prop bindings', () => {
      const instance: ComponentInstance = {
        type: 'COMPONENT_INSTANCE',
        elementType: 'button',
        $component: {
          ref: './button.coral.json',
        },
        propBindings: {
          label: 'Click me',
          intent: 'primary',
          size: 'lg',
          disabled: false,
        },
      };

      expect(instance.propBindings).toBeDefined();
      expect(instance.propBindings?.label).toBe('Click me');
      expect(instance.propBindings?.intent).toBe('primary');
      expect(instance.propBindings?.disabled).toBe(false);
    });

    it('should handle parent prop references', () => {
      const instance: ComponentInstance = {
        type: 'COMPONENT_INSTANCE',
        elementType: 'button',
        $component: {
          ref: './button.coral.json',
        },
        propBindings: {
          label: { $prop: 'buttonLabel' },
          disabled: { $prop: 'isDisabled' },
        },
      };

      expect(instance.propBindings).toBeDefined();
      expect(instance.propBindings?.label).toEqual({ $prop: 'buttonLabel' });
    });

    it('should handle computed values', () => {
      const instance: ComponentInstance = {
        type: 'COMPONENT_INSTANCE',
        elementType: 'button',
        $component: {
          ref: './button.coral.json',
        },
        propBindings: {
          label: {
            $computed: 'ternary',
            $inputs: [
              { $prop: 'loading' },
              'Loading...',
              { $prop: 'submitLabel' },
            ],
          },
        },
      };

      expect(instance.propBindings?.label).toBeDefined();
      expect(
        (instance.propBindings?.label as any).$computed,
      ).toBe('ternary');
    });

    it('should handle prop transforms', () => {
      const instance: ComponentInstance = {
        type: 'COMPONENT_INSTANCE',
        elementType: 'button',
        $component: {
          ref: './button.coral.json',
        },
        propBindings: {
          'aria-expanded': { $prop: 'isOpen', $transform: 'boolean' },
          'aria-disabled': { $prop: 'enabled', $transform: 'not' },
        },
      };

      expect(instance.propBindings?.['aria-expanded']).toEqual({
        $prop: 'isOpen',
        $transform: 'boolean',
      });
    });
  });

  describe('Event Bindings', () => {
    it('should handle event bindings', () => {
      const instance: ComponentInstance = {
        type: 'COMPONENT_INSTANCE',
        elementType: 'button',
        $component: {
          ref: './button.coral.json',
        },
        eventBindings: {
          onClick: { $event: 'onButtonClick' },
          onFocus: { $event: 'onButtonFocus' },
        },
      };

      expect(instance.eventBindings).toBeDefined();
      expect(instance.eventBindings?.onClick).toEqual({
        $event: 'onButtonClick',
      });
    });

    it('should handle inline handlers', () => {
      const instance: ComponentInstance = {
        type: 'COMPONENT_INSTANCE',
        elementType: 'button',
        $component: {
          ref: './button.coral.json',
        },
        eventBindings: {
          onClick: {
            $inline: '() => setIsOpen(false)',
          },
        },
      };

      expect(instance.eventBindings?.onClick).toEqual({
        $inline: '() => setIsOpen(false)',
      });
    });
  });

  describe('Variant Overrides', () => {
    it('should handle variant overrides', () => {
      const instance: ComponentInstance = {
        type: 'COMPONENT_INSTANCE',
        elementType: 'button',
        $component: {
          ref: './button.coral.json',
        },
        propBindings: {
          label: 'Save',
        },
        variantOverrides: {
          intent: 'primary',
          size: 'sm',
        },
      };

      expect(instance.variantOverrides).toBeDefined();
      expect(instance.variantOverrides?.intent).toBe('primary');
      expect(instance.variantOverrides?.size).toBe('sm');
    });
  });

  describe('Slots', () => {
    const cardWithSlots: CoralRootNode = {
      name: 'Card',
      elementType: 'div',
      slots: [
        {
          name: 'default',
          description: 'Main content area',
          required: true,
        },
        {
          name: 'header',
          description: 'Card header content',
          allowedElements: ['h1', 'h2', 'h3', 'h4'],
        },
        {
          name: 'footer',
          description: 'Card footer content',
          multiple: true,
        },
        {
          name: 'actions',
          description: 'Action buttons',
          allowedComponents: ['Button', 'IconButton'],
          multiple: true,
        },
      ],
      children: [
        {
          name: 'HeaderWrapper',
          elementType: 'div',
          slotTarget: 'header',
          styles: { padding: '16px', borderBottom: '1px solid #eee' },
        },
        {
          name: 'ContentWrapper',
          elementType: 'div',
          slotTarget: 'default',
          styles: { padding: '16px' },
        },
        {
          name: 'FooterWrapper',
          elementType: 'div',
          slotTarget: 'footer',
          styles: { padding: '16px', borderTop: '1px solid #eee' },
        },
      ],
    };

    it('should define slots correctly', () => {
      expect(cardWithSlots.slots).toBeDefined();
      expect(cardWithSlots.slots?.length).toBe(4);
      expect(cardWithSlots.slots?.[0].name).toBe('default');
      expect(cardWithSlots.slots?.[0].required).toBe(true);
    });

    it('should have slot targets in children', () => {
      const headerChild = cardWithSlots.children?.find(
        (c) => c.slotTarget === 'header',
      );
      expect(headerChild).toBeDefined();
      expect(headerChild?.name).toBe('HeaderWrapper');
    });
  });

  describe('Slot Bindings', () => {
    it('should handle slot bindings', () => {
      const instance: ComponentInstance = {
        type: 'COMPONENT_INSTANCE',
        elementType: 'div',
        $component: {
          ref: './card/card.coral.json',
        },
        slotBindings: {
          header: { elementType: 'h2', textContent: 'Card Title' },
          default: [
            { elementType: 'p', textContent: 'Card content goes here.' },
          ],
          actions: [
            {
              type: 'COMPONENT_INSTANCE',
              elementType: 'button',
              $component: {
                ref: './button/button.coral.json',
              },
              propBindings: { label: 'Save' },
            } as ComponentInstance,
          ],
        },
      };

      expect(instance.slotBindings).toBeDefined();
      expect(instance.slotBindings?.header).toBeDefined();
      expect(instance.slotBindings?.default).toBeDefined();
      expect(Array.isArray(instance.slotBindings?.default)).toBe(true);
    });
  });
});
