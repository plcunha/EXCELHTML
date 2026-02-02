import { describe, it, expect } from 'vitest'
import { generateSchemaFromData, processData, exportData } from '@/lib/excel-parser'
import type { ParseResult } from '@/lib/excel-parser'

describe('generateSchemaFromData', () => {
  it('should generate schema from headers and data', () => {
    const headers = ['name', 'email', 'age']
    const data = [
      { name: 'John', email: 'john@test.com', age: 30 },
      { name: 'Jane', email: 'jane@test.com', age: 25 },
    ]
    
    const schema = generateSchemaFromData(headers, data)
    
    expect(schema.columns).toHaveLength(3)
    expect(schema.columns[0].key).toBe('name')
    expect(schema.columns[1].key).toBe('email')
    expect(schema.columns[2].key).toBe('age')
  })

  it('should infer email type correctly', () => {
    const headers = ['contact']
    const data = [
      { contact: 'user1@example.com' },
      { contact: 'user2@example.com' },
      { contact: 'user3@example.com' },
    ]
    
    const schema = generateSchemaFromData(headers, data)
    
    expect(schema.columns[0].format.type).toBe('email')
  })

  it('should use custom schema options', () => {
    const headers = ['name']
    const data = [{ name: 'Test' }]
    
    const schema = generateSchemaFromData(headers, data, {
      schemaId: 'custom-id',
      schemaName: 'Custom Name',
    })
    
    expect(schema.id).toBe('custom-id')
    expect(schema.name).toBe('Custom Name')
  })
})

describe('processData', () => {
  it('should process parse result into structured data', () => {
    const parseResult: ParseResult = {
      headers: ['name', 'value'],
      data: [
        { name: 'Item 1', value: 100 },
        { name: 'Item 2', value: 200 },
      ],
      rawData: [],
      errors: [],
    }
    
    const result = processData(parseResult)
    
    expect(result.rows).toHaveLength(2)
    expect(result.schema.columns).toHaveLength(2)
    expect(result.metadata.totalRows).toBe(2)
  })

  it('should add row metadata (_id, _rowIndex)', () => {
    const parseResult: ParseResult = {
      headers: ['name'],
      data: [{ name: 'Test' }],
      rawData: [],
      errors: [],
    }
    
    const result = processData(parseResult)
    
    expect(result.rows[0]._id).toBeDefined()
    expect(result.rows[0]._rowIndex).toBe(0)
  })

  it('should include source file name in metadata', () => {
    const parseResult: ParseResult = {
      headers: ['name'],
      data: [{ name: 'Test' }],
      rawData: [],
      errors: [],
    }
    
    const result = processData(parseResult, undefined, {
      sourceFileName: 'test.xlsx',
    })
    
    expect(result.metadata.sourceFileName).toBe('test.xlsx')
  })
})

describe('exportData', () => {
  it('should export to JSON format', () => {
    const data = {
      schema: {
        id: 'test',
        name: 'Test',
        columns: [{ key: 'name', label: 'Name', format: { type: 'string' as const } }],
        features: {},
      },
      rows: [{ _id: '1', _rowIndex: 0, name: 'Test' }],
      metadata: { totalRows: 1, processedAt: new Date() },
    }
    
    const blob = exportData(data, 'json')
    
    expect(blob.type).toBe('application/json')
  })

  it('should export to CSV format', () => {
    const data = {
      schema: {
        id: 'test',
        name: 'Test',
        columns: [{ key: 'name', label: 'Name', format: { type: 'string' as const } }],
        features: {},
      },
      rows: [{ _id: '1', _rowIndex: 0, name: 'Test' }],
      metadata: { totalRows: 1, processedAt: new Date() },
    }
    
    const blob = exportData(data, 'csv')
    
    expect(blob.type).toContain('text/csv')
  })

  it('should export to XLSX format', () => {
    const data = {
      schema: {
        id: 'test',
        name: 'Test',
        columns: [{ key: 'name', label: 'Name', format: { type: 'string' as const } }],
        features: {},
      },
      rows: [{ _id: '1', _rowIndex: 0, name: 'Test' }],
      metadata: { totalRows: 1, processedAt: new Date() },
    }
    
    const blob = exportData(data, 'xlsx')
    
    expect(blob.type).toContain('spreadsheet')
  })
})
