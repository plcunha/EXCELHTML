import { describe, it, expect } from 'vitest'

// ============================================
// DARK MODE THEME UTILITIES
// ============================================

// Replicated from Charts.tsx for testing
const getTooltipStyle = (isDarkMode: boolean) => ({
  backgroundColor: isDarkMode ? '#1f2937' : '#fff',
  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
  borderRadius: '8px',
  boxShadow: isDarkMode 
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  color: isDarkMode ? '#f3f4f6' : '#374151',
})

const getChartColors = (isDarkMode: boolean) => ({
  grid: isDarkMode ? '#374151' : '#e5e7eb',
  axis: isDarkMode ? '#9ca3af' : '#6b7280',
  text: isDarkMode ? '#d1d5db' : '#6b7280',
  labelLine: isDarkMode ? '#9ca3af' : '#6b7280',
})

// ============================================
// DARK MODE THEME TESTS
// ============================================

describe('Chart Dark Mode Theme', () => {
  describe('getTooltipStyle', () => {
    it('should return light mode styles when isDarkMode is false', () => {
      const style = getTooltipStyle(false)
      
      expect(style.backgroundColor).toBe('#fff')
      expect(style.border).toBe('1px solid #e5e7eb')
      expect(style.color).toBe('#374151')
      expect(style.boxShadow).toContain('0.1)')
    })
    
    it('should return dark mode styles when isDarkMode is true', () => {
      const style = getTooltipStyle(true)
      
      expect(style.backgroundColor).toBe('#1f2937')
      expect(style.border).toBe('1px solid #374151')
      expect(style.color).toBe('#f3f4f6')
      expect(style.boxShadow).toContain('0.3)')
    })
    
    it('should always include borderRadius', () => {
      expect(getTooltipStyle(false).borderRadius).toBe('8px')
      expect(getTooltipStyle(true).borderRadius).toBe('8px')
    })
  })
  
  describe('getChartColors', () => {
    it('should return light mode colors when isDarkMode is false', () => {
      const colors = getChartColors(false)
      
      expect(colors.grid).toBe('#e5e7eb')
      expect(colors.axis).toBe('#6b7280')
      expect(colors.text).toBe('#6b7280')
      expect(colors.labelLine).toBe('#6b7280')
    })
    
    it('should return dark mode colors when isDarkMode is true', () => {
      const colors = getChartColors(true)
      
      expect(colors.grid).toBe('#374151')
      expect(colors.axis).toBe('#9ca3af')
      expect(colors.text).toBe('#d1d5db')
      expect(colors.labelLine).toBe('#9ca3af')
    })
    
    it('should return all required color properties', () => {
      const lightColors = getChartColors(false)
      const darkColors = getChartColors(true)
      
      const requiredKeys = ['grid', 'axis', 'text', 'labelLine']
      
      requiredKeys.forEach(key => {
        expect(lightColors).toHaveProperty(key)
        expect(darkColors).toHaveProperty(key)
      })
    })
  })
})

// ============================================
// CHART DATA STRUCTURE TESTS
// ============================================

// Test data structures for chart generation
describe('Chart Data Structures', () => {
  describe('Bar Chart Data', () => {
    it('should format numeric data for bar chart', () => {
      const rows = [
        { value: 100 },
        { value: 200 },
        { value: 150 },
      ]
      
      const barData = rows.slice(0, 10).map((row, i) => ({
        name: `Item ${i + 1}`,
        value: Number(row.value) || 0,
      }))
      
      expect(barData).toHaveLength(3)
      expect(barData[0]).toEqual({ name: 'Item 1', value: 100 })
      expect(barData[1]).toEqual({ name: 'Item 2', value: 200 })
      expect(barData[2]).toEqual({ name: 'Item 3', value: 150 })
    })
    
    it('should handle missing values as 0', () => {
      const rows = [
        { value: null },
        { value: undefined },
        { value: 'not a number' },
      ]
      
      const barData = rows.map((row, i) => ({
        name: `Item ${i + 1}`,
        value: Number(row.value) || 0,
      }))
      
      expect(barData[0].value).toBe(0)
      expect(barData[1].value).toBe(0)
      expect(barData[2].value).toBe(0)
    })
  })
  
  describe('Pie Chart Data Aggregation', () => {
    it('should aggregate badge/category data', () => {
      const rows = [
        { status: 'Pago' },
        { status: 'Pago' },
        { status: 'Pendente' },
        { status: 'Pago' },
        { status: 'Atrasado' },
      ]
      
      const counts: Record<string, number> = {}
      rows.forEach(row => {
        const value = String(row.status ?? 'N/A')
        counts[value] = (counts[value] || 0) + 1
      })
      
      const pieData = Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
      
      expect(pieData).toHaveLength(3)
      expect(pieData[0]).toEqual({ name: 'Pago', value: 3 })
      expect(pieData[1]).toEqual({ name: 'Pendente', value: 1 })
      expect(pieData[2]).toEqual({ name: 'Atrasado', value: 1 })
    })
    
    it('should handle N/A for null values', () => {
      const rows = [
        { status: null },
        { status: undefined },
        { status: 'Valid' },
      ]
      
      const counts: Record<string, number> = {}
      rows.forEach(row => {
        const value = String(row.status ?? 'N/A')
        counts[value] = (counts[value] || 0) + 1
      })
      
      expect(counts['N/A']).toBe(2)
      expect(counts['Valid']).toBe(1)
    })
  })
  
  describe('Area Chart Data', () => {
    it('should format trend data for area chart', () => {
      const rows = [
        { revenue: 1000 },
        { revenue: 1200 },
        { revenue: 1100 },
        { revenue: 1500 },
      ]
      
      const areaData = rows.slice(0, 15).map((row, i) => ({
        name: `${i + 1}`,
        value: Number(row.revenue) || 0,
      }))
      
      expect(areaData).toHaveLength(4)
      expect(areaData[0]).toEqual({ name: '1', value: 1000 })
      expect(areaData[3]).toEqual({ name: '4', value: 1500 })
    })
  })
  
  describe('Radar Chart Data', () => {
    it('should normalize values for radar chart', () => {
      const columns = [
        { key: 'sales', label: 'Vendas' },
        { key: 'support', label: 'Suporte' },
        { key: 'quality', label: 'Qualidade' },
      ]
      
      const rows = [
        { sales: 80, support: 60, quality: 90 },
        { sales: 70, support: 80, quality: 85 },
        { sales: 90, support: 70, quality: 95 },
      ]
      
      const radarData = columns.map(col => {
        const values = rows.map(row => Number(row[col.key as keyof typeof row]) || 0)
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        const max = Math.max(...values)
        const normalized = max > 0 ? (avg / max) * 100 : 0
        
        return {
          subject: col.label,
          value: Math.round(normalized),
          fullMark: 100,
        }
      })
      
      expect(radarData).toHaveLength(3)
      expect(radarData[0].subject).toBe('Vendas')
      expect(radarData[0].value).toBeGreaterThan(0)
      expect(radarData[0].value).toBeLessThanOrEqual(100)
      expect(radarData[0].fullMark).toBe(100)
    })
    
    it('should handle empty data gracefully', () => {
      const values: number[] = []
      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      const max = values.length > 0 ? Math.max(...values) : 0
      const normalized = max > 0 ? (avg / max) * 100 : 0
      
      expect(normalized).toBe(0)
    })
  })
  
  describe('Line Chart Multi-Series Data', () => {
    it('should format multi-column data for line chart', () => {
      const columns = [
        { key: 'metric1', label: 'Metric 1' },
        { key: 'metric2', label: 'Metric 2' },
      ]
      
      const rows = [
        { metric1: 10, metric2: 20 },
        { metric1: 15, metric2: 25 },
        { metric1: 12, metric2: 22 },
      ]
      
      const lineData = rows.map((row, i) => {
        const point: Record<string, unknown> = { name: `${i + 1}` }
        columns.forEach(col => {
          point[col.key] = Number(row[col.key as keyof typeof row]) || 0
        })
        return point
      })
      
      expect(lineData).toHaveLength(3)
      expect(lineData[0]).toEqual({ name: '1', metric1: 10, metric2: 20 })
      expect(lineData[1]).toEqual({ name: '2', metric1: 15, metric2: 25 })
    })
  })
})
