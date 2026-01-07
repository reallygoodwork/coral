import type { PlopTypes } from '@turbo/gen'

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('package', {
    description: 'Generate a new package for the monorepo',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message:
          'What is the name of the package? (without @reallygoodwork/ prefix)',
        validate: (input: string) => {
          if (input.includes(' ')) {
            return 'Package name cannot include spaces'
          }
          if (!input) {
            return 'Package name is required'
          }
          return true
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Package description:',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'packages/{{ name }}/package.json',
        templateFile: 'templates/package/package.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{ name }}/tsconfig.json',
        templateFile: 'templates/package/tsconfig.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{ name }}/tsconfig.test.json',
        templateFile: 'templates/package/tsconfig.test.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{ name }}/jest.config.js',
        templateFile: 'templates/package/jest.config.js.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{ name }}/tsup.config.ts',
        templateFile: 'templates/package/tsup.config.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{ name }}/.releaserc.json',
        templateFile: 'templates/package/.releaserc.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{ name }}/src/index.ts',
        templateFile: 'templates/package/src/index.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{ name }}/src/__tests__/index.test.ts',
        templateFile: 'templates/package/src/__tests__/index.test.ts.hbs',
      },
    ],
  })
}
