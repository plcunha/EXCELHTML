import { describe, it, expect } from 'vitest'

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
