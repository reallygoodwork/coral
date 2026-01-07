import {
  createDefaultConfig,
  getDefaultExportTarget,
  parsePackageRef,
  resolveConfigPath,
  validateConfig,
  zCoralConfigSchema,
} from '../structures/package'

describe('Package Schema', () => {
  describe('CoralConfigSchema', () => {
    it('should validate a minimal valid config', () => {
      const config = {
        name: 'my-design-system',
        version: '1.0.0',
        coral: { specVersion: '1.0.0' },
      }
      const result = zCoralConfigSchema.safeParse(config)
      expect(result.success).toBe(true)
    })

    it('should validate a full config', () => {
      const config = {
        $schema: 'https://coral.design/config.schema.json',
        name: '@acme/design-system',
        version: '1.0.0',
        description: 'ACME Design System',
        coral: { specVersion: '1.0.0' },
        tokens: { entry: './tokens/index.json' },
        components: { entry: './components/index.json' },
        presets: {
          cssReset: './presets/reset.css',
          globalStyles: './presets/global.css',
        },
        extends: ['@acme/base-tokens@^1.0.0'],
        exports: {
          react: {
            outDir: './dist/react',
            typescript: true,
            styling: 'tailwind',
          },
        },
      }
      const result = zCoralConfigSchema.safeParse(config)
      expect(result.success).toBe(true)
    })

    it('should reject invalid package name', () => {
      const config = {
        name: 'Invalid Name',
        version: '1.0.0',
        coral: { specVersion: '1.0.0' },
      }
      const result = zCoralConfigSchema.safeParse(config)
      expect(result.success).toBe(false)
    })

    it('should reject invalid version', () => {
      const config = {
        name: 'my-package',
        version: 'invalid',
        coral: { specVersion: '1.0.0' },
      }
      const result = zCoralConfigSchema.safeParse(config)
      expect(result.success).toBe(false)
    })

    it('should validate scoped package name', () => {
      const config = {
        name: '@my-org/design-system',
        version: '1.0.0',
        coral: { specVersion: '1.0.0' },
      }
      const result = zCoralConfigSchema.safeParse(config)
      expect(result.success).toBe(true)
    })
  })

  describe('parsePackageRef', () => {
    it('should parse simple package name', () => {
      const [name, version] = parsePackageRef('my-package')
      expect(name).toBe('my-package')
      expect(version).toBeUndefined()
    })

    it('should parse package with version', () => {
      const [name, version] = parsePackageRef('my-package@^1.0.0')
      expect(name).toBe('my-package')
      expect(version).toBe('^1.0.0')
    })

    it('should parse scoped package', () => {
      const [name, version] = parsePackageRef('@acme/tokens')
      expect(name).toBe('@acme/tokens')
      expect(version).toBeUndefined()
    })

    it('should parse scoped package with version', () => {
      const [name, version] = parsePackageRef('@acme/tokens@^1.0.0')
      expect(name).toBe('@acme/tokens')
      expect(version).toBe('^1.0.0')
    })
  })

  describe('createDefaultConfig', () => {
    it('should create default config with name', () => {
      const config = createDefaultConfig('my-design-system')

      expect(config.name).toBe('my-design-system')
      expect(config.version).toBe('0.1.0')
      expect(config.coral.specVersion).toBe('1.0.0')
      expect(config.tokens?.entry).toBe('./tokens/index.json')
      expect(config.components?.entry).toBe('./components/index.json')
    })

    it('should accept custom version', () => {
      const config = createDefaultConfig('my-design-system', '2.0.0')
      expect(config.version).toBe('2.0.0')
    })
  })

  describe('validateConfig', () => {
    it('should return success for valid config', () => {
      const config = {
        name: 'my-package',
        version: '1.0.0',
        coral: { specVersion: '1.0.0' },
      }
      const result = validateConfig(config)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.errors).toBeUndefined()
    })

    it('should return errors for invalid config', () => {
      const config = {
        name: 'Invalid Name',
        version: 'bad',
      }
      const result = validateConfig(config)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })
  })

  describe('getDefaultExportTarget', () => {
    it('should return default target if exists', () => {
      const config = createDefaultConfig('test')
      config.exports = {
        default: { outDir: './dist/default' },
        react: { outDir: './dist/react' },
      }

      const target = getDefaultExportTarget(config)
      expect(target?.outDir).toBe('./dist/default')
    })

    it('should return first target if no default', () => {
      const config = createDefaultConfig('test')
      config.exports = {
        react: { outDir: './dist/react' },
        vue: { outDir: './dist/vue' },
      }

      const target = getDefaultExportTarget(config)
      expect(target?.outDir).toBe('./dist/react')
    })

    it('should return undefined if no exports', () => {
      const config = createDefaultConfig('test')
      const target = getDefaultExportTarget(config)
      expect(target).toBeUndefined()
    })
  })

  describe('resolveConfigPath', () => {
    it('should resolve relative path with ./', () => {
      const resolved = resolveConfigPath('/project', './tokens/index.json')
      expect(resolved).toBe('/project/tokens/index.json')
    })

    it('should resolve path without prefix', () => {
      const resolved = resolveConfigPath('/project', 'tokens/index.json')
      expect(resolved).toBe('/project/tokens/index.json')
    })

    it('should resolve parent directory path', () => {
      const resolved = resolveConfigPath(
        '/project/components',
        '../tokens/index.json',
      )
      expect(resolved).toBe('/project/tokens/index.json')
    })
  })
})
