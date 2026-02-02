import { describe, it, expect } from 'vitest'
import { cn, formatValue, formatFileSize, truncate, capitalize, getPaginationRange } from '@/lib/utils'

describe('cn (className merge)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active', false && 'hidden')).toBe('base active')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })
})

describe('formatValue', () => {
  it('should format currency values', () => {
    const result = formatValue(1234.56, { type: 'currency', currency: 'BRL', locale: 'pt-BR' })
    expect(result).toContain('1.234,56')
  })

  it('should format percentage values', () => {
    const result = formatValue(50, { type: 'percentage', locale: 'pt-BR' })
    expect(result).toContain('50')
    expect(result).toContain('%')
  })

  it('should handle null values', () => {
    expect(formatValue(null, { type: 'string' })).toBe('—')
  })

  it('should format boolean values', () => {
    expect(formatValue(true, { type: 'boolean' })).toBe('Sim')
    expect(formatValue(false, { type: 'boolean' })).toBe('Não')
  })
})

describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
    expect(formatFileSize(500)).toBe('500 Bytes')
  })

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(2048)).toBe('2 KB')
  })

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB')
  })
})

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...')
  })

  it('should not truncate short strings', () => {
    expect(truncate('Hi', 5)).toBe('Hi')
  })
})

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('WORLD')).toBe('World')
  })
})

describe('getPaginationRange', () => {
  it('should return correct range for small page count', () => {
    const range = getPaginationRange(1, 3)
    expect(range).toEqual([1, 2, 3])
  })

  it('should include ellipsis for large page count', () => {
    const range = getPaginationRange(5, 10)
    expect(range).toContain('ellipsis')
    expect(range).toContain(1)
    expect(range).toContain(10)
    expect(range).toContain(5)
  })
})
