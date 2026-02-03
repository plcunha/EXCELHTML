import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  cn, 
  formatValue, 
  formatFileSize, 
  truncate, 
  capitalize, 
  getPaginationRange,
  debounce,
  throttle,
  stringToColor,
  isValidUrl
} from '@/lib/utils'

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

  it('should handle edge case with first page', () => {
    const range = getPaginationRange(1, 10)
    expect(range[0]).toBe(1)
    expect(range[range.length - 1]).toBe(10)
  })

  it('should handle edge case with last page', () => {
    const range = getPaginationRange(10, 10)
    expect(range[0]).toBe(1)
    expect(range[range.length - 1]).toBe(10)
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce function calls', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments to debounced function', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('arg1', 'arg2')

    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should reset timer on subsequent calls', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    vi.advanceTimersByTime(50)
    debouncedFn()
    vi.advanceTimersByTime(50)

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)

    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should throttle function calls', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn()
    throttledFn()
    throttledFn()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should allow calls after throttle period', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)

    throttledFn()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should pass arguments to throttled function', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn('test')

    expect(fn).toHaveBeenCalledWith('test')
  })
})

describe('stringToColor', () => {
  it('should generate a color from a string', () => {
    const color = stringToColor('test')
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })

  it('should generate same color for same string', () => {
    const color1 = stringToColor('hello')
    const color2 = stringToColor('hello')
    expect(color1).toBe(color2)
  })

  it('should generate different colors for different strings', () => {
    const color1 = stringToColor('hello')
    const color2 = stringToColor('world')
    expect(color1).not.toBe(color2)
  })

  it('should handle empty string', () => {
    const color = stringToColor('')
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
  })
})

describe('isValidUrl', () => {
  it('should return true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('http://example.com')).toBe(true)
    expect(isValidUrl('https://example.com/path?query=1')).toBe(true)
  })

  it('should return false for invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false)
    expect(isValidUrl('example.com')).toBe(false)
    expect(isValidUrl('')).toBe(false)
  })

  it('should handle URLs with ports', () => {
    expect(isValidUrl('http://localhost:3000')).toBe(true)
    expect(isValidUrl('https://example.com:8080/path')).toBe(true)
  })
})

describe('formatValue - additional cases', () => {
  it('should format number values', () => {
    const result = formatValue(1234.5678, { type: 'number', locale: 'pt-BR', decimals: 2 })
    expect(result).toContain('1.234,57')
  })

  it('should format date values', () => {
    const result = formatValue('2024-12-31', { type: 'date', dateFormat: 'dd/MM/yyyy' })
    expect(result).toBe('31/12/2024')
  })

  it('should handle invalid date gracefully', () => {
    const result = formatValue('not-a-date', { type: 'date' })
    expect(result).toBe('not-a-date')
  })

  it('should format progress values', () => {
    const result = formatValue(75.5, { type: 'progress' })
    expect(result).toBe('76%')
  })

  it('should handle empty string as null', () => {
    expect(formatValue('', { type: 'string' })).toBe('—')
  })

  it('should format Date objects', () => {
    const date = new Date(2024, 11, 31)
    const result = formatValue(date, { type: 'date', dateFormat: 'dd/MM/yyyy' })
    expect(result).toBe('31/12/2024')
  })

  it('should use default format for unknown types', () => {
    const result = formatValue('test', { type: 'unknown' as never })
    expect(result).toBe('test')
  })
})
