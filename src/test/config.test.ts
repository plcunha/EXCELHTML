import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  defaultTheme,
  darkTheme,
  companyPresets,
  generateCSSVariables,
  applyTheme,
  getCompanyConfig,
  createCompanyConfig,
} from '../lib/config'
import type { CompanyTheme } from '../types'

describe('config', () => {
  describe('Theme Constants', () => {
    it('should have valid default theme', () => {
      expect(defaultTheme.colors.primary).toBe('#2563eb')
      expect(defaultTheme.colors.accent).toBe('#16a34a')
      expect(defaultTheme.borderRadius).toBe('lg')
      expect(defaultTheme.shadows).toBe('soft')
    })

    it('should have valid dark theme', () => {
      expect(darkTheme.colors.primary).toBe('#60a5fa')
      expect(darkTheme.colors.background).toBe('#0f172a')
      expect(darkTheme.colors.surface).toBe('#1e293b')
      expect(darkTheme.colors.text).toBe('#f1f5f9')
    })

    it('should have all required color properties', () => {
      const requiredColors = [
        'primary', 'primaryDark', 'primaryLight', 'accent',
        'background', 'surface', 'text', 'textSecondary',
        'border', 'success', 'warning', 'error', 'info'
      ]
      
      requiredColors.forEach(color => {
        expect(defaultTheme.colors).toHaveProperty(color)
        expect(darkTheme.colors).toHaveProperty(color)
      })
    })
  })

  describe('Company Presets', () => {
    it('should have default preset', () => {
      expect(companyPresets.default).toBeDefined()
      expect(companyPresets.default.id).toBe('default')
      expect(companyPresets.default.name).toBe('Excel Viewer')
    })

    it('should have techCorp preset with custom theme', () => {
      expect(companyPresets.techCorp).toBeDefined()
      expect(companyPresets.techCorp.theme.colors.primary).toBe('#8b5cf6')
      expect(companyPresets.techCorp.theme.borderRadius).toBe('xl')
    })

    it('should have financeBank preset', () => {
      expect(companyPresets.financeBank).toBeDefined()
      expect(companyPresets.financeBank.theme.colors.primary).toBe('#0d9488')
      expect(companyPresets.financeBank.theme.shadows).toBe('strong')
    })

    it('should have shopMax preset', () => {
      expect(companyPresets.shopMax).toBeDefined()
      expect(companyPresets.shopMax.theme.colors.primary).toBe('#f97316')
    })

    it('all presets should have required properties', () => {
      Object.values(companyPresets).forEach(preset => {
        expect(preset.id).toBeDefined()
        expect(preset.name).toBeDefined()
        expect(preset.theme).toBeDefined()
        expect(preset.defaultLocale).toBeDefined()
        expect(preset.currencyCode).toBeDefined()
      })
    })
  })

  describe('generateCSSVariables', () => {
    it('should generate color variables', () => {
      const vars = generateCSSVariables(defaultTheme)

      expect(vars['--color-primary']).toBe('#2563eb')
      expect(vars['--color-accent']).toBe('#16a34a')
      expect(vars['--color-background']).toBe('#f8fafc')
    })

    it('should generate radius variable', () => {
      const vars = generateCSSVariables(defaultTheme)
      expect(vars['--radius']).toBe('0.5rem') // lg = 0.5rem
    })

    it('should handle different border radius values', () => {
      const testCases: { radius: CompanyTheme['borderRadius']; expected: string }[] = [
        { radius: 'none', expected: '0' },
        { radius: 'sm', expected: '0.25rem' },
        { radius: 'md', expected: '0.375rem' },
        { radius: 'lg', expected: '0.5rem' },
        { radius: 'xl', expected: '0.75rem' },
      ]

      testCases.forEach(({ radius, expected }) => {
        const theme = { ...defaultTheme, borderRadius: radius }
        const vars = generateCSSVariables(theme)
        expect(vars['--radius']).toBe(expected)
      })
    })

    it('should generate font variables when provided', () => {
      const themeWithFonts: CompanyTheme = {
        ...defaultTheme,
        fonts: {
          sans: 'Inter, sans-serif',
          mono: 'Fira Code, monospace',
        },
      }
      
      const vars = generateCSSVariables(themeWithFonts)
      expect(vars['--font-sans']).toBe('Inter, sans-serif')
      expect(vars['--font-mono']).toBe('Fira Code, monospace')
    })

    it('should not include font variables when not provided', () => {
      const vars = generateCSSVariables(defaultTheme)
      expect(vars['--font-sans']).toBeUndefined()
      expect(vars['--font-mono']).toBeUndefined()
    })
  })

  describe('applyTheme', () => {
    let mockElement: HTMLElement

    beforeEach(() => {
      mockElement = document.createElement('div')
    })

    afterEach(() => {
      mockElement.remove()
    })

    it('should apply CSS variables to element', () => {
      applyTheme(defaultTheme, mockElement)

      expect(mockElement.style.getPropertyValue('--color-primary')).toBe('#2563eb')
      expect(mockElement.style.getPropertyValue('--color-accent')).toBe('#16a34a')
      expect(mockElement.style.getPropertyValue('--radius')).toBe('0.5rem')
    })

    it('should apply theme to document.documentElement by default', () => {
      applyTheme(defaultTheme)

      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#2563eb')
    })

    it('should apply dark theme correctly', () => {
      applyTheme(darkTheme, mockElement)
      
      expect(mockElement.style.getPropertyValue('--color-background')).toBe('#0f172a')
      expect(mockElement.style.getPropertyValue('--color-text')).toBe('#f1f5f9')
    })
  })

  describe('getCompanyConfig', () => {
    it('should return matching company config', () => {
      const config = getCompanyConfig('techCorp')
      expect(config.id).toBe('techCorp')
      expect(config.name).toBe('TechCorp')
    })

    it('should return default config for unknown company', () => {
      const config = getCompanyConfig('unknownCompany')
      expect(config.id).toBe('default')
      expect(config.name).toBe('Excel Viewer')
    })

    it('should return default config for empty string', () => {
      const config = getCompanyConfig('')
      expect(config.id).toBe('default')
    })
  })

  describe('createCompanyConfig', () => {
    it('should create config with defaults', () => {
      const config = createCompanyConfig({
        id: 'myCompany',
        name: 'My Company',
      })

      expect(config.id).toBe('myCompany')
      expect(config.name).toBe('My Company')
      expect(config.theme).toBeDefined()
      expect(config.currencyCode).toBe('BRL') // From default
    })

    it('should merge custom theme colors', () => {
      const config = createCompanyConfig({
        id: 'custom',
        name: 'Custom Corp',
        theme: {
          colors: {
            primary: '#ff0000',
            primaryDark: '#cc0000',
            primaryLight: '#ff3333',
            accent: '#00ff00',
            background: '#ffffff',
            surface: '#f0f0f0',
            text: '#000000',
            textSecondary: '#666666',
            border: '#cccccc',
            success: '#00ff00',
            warning: '#ffff00',
            error: '#ff0000',
            info: '#0000ff',
          },
        },
      })

      expect(config.theme.colors.primary).toBe('#ff0000')
      expect(config.theme.colors.accent).toBe('#00ff00')
    })

    it('should merge partial theme colors with defaults', () => {
      const config = createCompanyConfig({
        id: 'partial',
        name: 'Partial Corp',
        theme: {
          colors: {
            primary: '#123456',
            primaryDark: '#0a1a2a',
            primaryLight: '#2468ac',
            accent: defaultTheme.colors.accent,
            background: defaultTheme.colors.background,
            surface: defaultTheme.colors.surface,
            text: defaultTheme.colors.text,
            textSecondary: defaultTheme.colors.textSecondary,
            border: defaultTheme.colors.border,
            success: defaultTheme.colors.success,
            warning: defaultTheme.colors.warning,
            error: defaultTheme.colors.error,
            info: defaultTheme.colors.info,
          },
        },
      })

      expect(config.theme.colors.primary).toBe('#123456')
      // Other colors should be preserved from default or provided
      expect(config.theme.colors.success).toBe(defaultTheme.colors.success)
    })

    it('should override locale and currency', () => {
      const config = createCompanyConfig({
        id: 'international',
        name: 'International Corp',
        defaultLocale: 'en-US',
        currencyCode: 'USD',
        dateFormat: 'MM/dd/yyyy',
      })

      expect(config.defaultLocale).toBe('en-US')
      expect(config.currencyCode).toBe('USD')
      expect(config.dateFormat).toBe('MM/dd/yyyy')
    })

    it('should include logo when provided', () => {
      const config = createCompanyConfig({
        id: 'withLogo',
        name: 'Logo Corp',
        logo: '/images/logo.png',
      })

      expect(config.logo).toBe('/images/logo.png')
    })

    it('should merge borderRadius and shadows', () => {
      const config = createCompanyConfig({
        id: 'styled',
        name: 'Styled Corp',
        theme: {
          borderRadius: 'xl',
          shadows: 'strong',
          colors: defaultTheme.colors,
        },
      })

      expect(config.theme.borderRadius).toBe('xl')
      expect(config.theme.shadows).toBe('strong')
    })
  })
})
