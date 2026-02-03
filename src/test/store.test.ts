import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../lib/store'
import type { ProcessedData, DataSchema, FilterState } from '../types'

// Mock data for testing
const createMockSchema = (): DataSchema => ({
  id: 'test-schema',
  name: 'Test Schema',
  columns: [
    { key: 'id', label: 'ID', format: { type: 'number' }, sortable: true },
    { key: 'name', label: 'Name', format: { type: 'string' }, searchable: true },
    { key: 'value', label: 'Value', format: { type: 'number' }, sortable: true },
    { key: 'status', label: 'Status', format: { type: 'badge' }, filterable: true },
  ],
  features: {
    export: true,
    pagination: true,
    search: true,
    filters: true,
  },
})

const createMockData = (): ProcessedData => ({
  schema: createMockSchema(),
  rows: [
    { _id: '1', _rowIndex: 0, id: 1, name: 'Item A', value: 100, status: 'active' },
    { _id: '2', _rowIndex: 1, id: 2, name: 'Item B', value: 200, status: 'inactive' },
    { _id: '3', _rowIndex: 2, id: 3, name: 'Item C', value: 150, status: 'active' },
    { _id: '4', _rowIndex: 3, id: 4, name: 'Test Item', value: 300, status: 'pending' },
    { _id: '5', _rowIndex: 4, id: 5, name: 'Another', value: 50, status: 'active' },
  ],
  metadata: {
    totalRows: 5,
    processedAt: new Date(),
    sourceFileName: 'test.xlsx',
  },
})

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useAppStore.getState()
    store.clearData()
    store.clearFilters()
    store.setEditMode(false)
  })

  describe('Data Actions', () => {
    it('should set data correctly', () => {
      const mockData = createMockData()
      useAppStore.getState().setData(mockData)
      
      const state = useAppStore.getState()
      expect(state.data).not.toBeNull()
      expect(state.data?.rows.length).toBe(5)
      expect(state.error).toBeNull()
      expect(state.isEditMode).toBe(false)
    })

    it('should set visible columns from schema', () => {
      const mockData = createMockData()
      useAppStore.getState().setData(mockData)
      
      const state = useAppStore.getState()
      expect(state.tableState.visibleColumns).toContain('id')
      expect(state.tableState.visibleColumns).toContain('name')
      expect(state.tableState.visibleColumns).toContain('value')
      expect(state.tableState.visibleColumns).toContain('status')
    })

    it('should calculate pagination correctly', () => {
      const mockData = createMockData()
      useAppStore.getState().setData(mockData)
      
      const state = useAppStore.getState()
      expect(state.tableState.pagination.totalItems).toBe(5)
      expect(state.tableState.pagination.totalPages).toBe(1) // 5 items, 25 per page
    })

    it('should set loading state', () => {
      useAppStore.getState().setLoading(true)
      expect(useAppStore.getState().isLoading).toBe(true)
      
      useAppStore.getState().setLoading(false)
      expect(useAppStore.getState().isLoading).toBe(false)
    })

    it('should set error and clear loading', () => {
      useAppStore.getState().setLoading(true)
      useAppStore.getState().setError('Test error')
      
      const state = useAppStore.getState()
      expect(state.error).toBe('Test error')
      expect(state.isLoading).toBe(false)
    })

    it('should clear data completely', () => {
      const mockData = createMockData()
      useAppStore.getState().setData(mockData)
      useAppStore.getState().setEditMode(true)
      
      useAppStore.getState().clearData()
      
      const state = useAppStore.getState()
      expect(state.data).toBeNull()
      expect(state.error).toBeNull()
      expect(state.isEditMode).toBe(false)
      expect(state.editingCell).toBeNull()
    })
  })

  describe('Edit Mode Actions', () => {
    it('should toggle edit mode', () => {
      useAppStore.getState().setEditMode(true)
      expect(useAppStore.getState().isEditMode).toBe(true)
      
      useAppStore.getState().setEditMode(false)
      expect(useAppStore.getState().isEditMode).toBe(false)
    })

    it('should clear editing cell when toggling edit mode', () => {
      useAppStore.getState().setEditingCell({ rowId: '1', columnKey: 'name' })
      useAppStore.getState().setEditMode(false)
      
      expect(useAppStore.getState().editingCell).toBeNull()
    })

    it('should set editing cell', () => {
      const cell = { rowId: '1', columnKey: 'name' }
      useAppStore.getState().setEditingCell(cell)
      
      expect(useAppStore.getState().editingCell).toEqual(cell)
    })

    it('should update cell value', () => {
      const mockData = createMockData()
      useAppStore.getState().setData(mockData)
      
      useAppStore.getState().updateCell('1', 'name', 'Updated Name')
      
      const state = useAppStore.getState()
      const updatedRow = state.data?.rows.find(r => r._id === '1')
      expect(updatedRow?.name).toBe('Updated Name')
      expect(state.editingCell).toBeNull()
    })

    it('should not update cell if no data', () => {
      useAppStore.getState().updateCell('1', 'name', 'Updated Name')
      expect(useAppStore.getState().data).toBeNull()
    })
  })

  describe('Theme Actions', () => {
    it('should toggle dark mode', () => {
      const initialMode = useAppStore.getState().isDarkMode
      useAppStore.getState().toggleDarkMode()
      expect(useAppStore.getState().isDarkMode).toBe(!initialMode)
    })

    it('should set company by ID', () => {
      useAppStore.getState().setCompany('default')
      const state = useAppStore.getState()
      expect(state.company).toBeDefined()
      expect(state.company.id).toBe('default')
    })

    it('should set custom company config', () => {
      const customConfig = {
        id: 'custom',
        name: 'Custom Company',
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
          borderRadius: 'md' as const,
          shadows: 'medium' as const,
        },
        currencyCode: 'USD',
        defaultLocale: 'en-US',
        dateFormat: 'MM/dd/yyyy',
      }
      
      useAppStore.getState().setCustomCompany(customConfig)
      const state = useAppStore.getState()
      expect(state.company.id).toBe('custom')
      expect(state.company.name).toBe('Custom Company')
    })
  })

  describe('Table State Actions', () => {
    it('should set sort', () => {
      const sort = { column: 'name', direction: 'asc' as const }
      useAppStore.getState().setSort(sort)
      
      expect(useAppStore.getState().tableState.sort).toEqual(sort)
    })

    it('should clear sort', () => {
      useAppStore.getState().setSort({ column: 'name', direction: 'asc' })
      useAppStore.getState().setSort(undefined)
      
      expect(useAppStore.getState().tableState.sort).toBeUndefined()
    })

    it('should add filter', () => {
      const filter: FilterState = { column: 'status', operator: 'eq', value: 'active' }
      useAppStore.getState().addFilter(filter)
      
      const state = useAppStore.getState()
      expect(state.tableState.filters).toHaveLength(1)
      expect(state.tableState.filters[0]).toEqual(filter)
      expect(state.tableState.pagination.page).toBe(1) // Reset to page 1
    })

    it('should replace filter for same column', () => {
      useAppStore.getState().addFilter({ column: 'status', operator: 'eq', value: 'active' })
      useAppStore.getState().addFilter({ column: 'status', operator: 'eq', value: 'inactive' })
      
      const state = useAppStore.getState()
      expect(state.tableState.filters).toHaveLength(1)
      expect(state.tableState.filters[0].value).toBe('inactive')
    })

    it('should remove filter', () => {
      useAppStore.getState().addFilter({ column: 'status', operator: 'eq', value: 'active' })
      useAppStore.getState().removeFilter('status')
      
      expect(useAppStore.getState().tableState.filters).toHaveLength(0)
    })

    it('should clear all filters and search', () => {
      useAppStore.getState().addFilter({ column: 'status', operator: 'eq', value: 'active' })
      useAppStore.getState().setSearch('test')
      useAppStore.getState().clearFilters()
      
      const state = useAppStore.getState()
      expect(state.tableState.filters).toHaveLength(0)
      expect(state.tableState.search).toBe('')
    })

    it('should set search and reset page', () => {
      useAppStore.getState().setPage(5)
      useAppStore.getState().setSearch('test query')
      
      const state = useAppStore.getState()
      expect(state.tableState.search).toBe('test query')
      expect(state.tableState.pagination.page).toBe(1)
    })

    it('should set page', () => {
      useAppStore.getState().setPage(3)
      expect(useAppStore.getState().tableState.pagination.page).toBe(3)
    })

    it('should set page size and recalculate pagination', () => {
      const mockData = createMockData()
      useAppStore.getState().setData(mockData)
      useAppStore.getState().setPageSize(2)
      
      const state = useAppStore.getState()
      expect(state.tableState.pagination.pageSize).toBe(2)
      expect(state.tableState.pagination.page).toBe(1)
      expect(state.tableState.pagination.totalPages).toBe(3) // 5 items / 2 per page = 3 pages
    })

    it('should toggle column visibility', () => {
      const mockData = createMockData()
      useAppStore.getState().setData(mockData)
      
      // Initially visible
      expect(useAppStore.getState().tableState.visibleColumns).toContain('name')
      
      // Toggle off
      useAppStore.getState().toggleColumn('name')
      expect(useAppStore.getState().tableState.visibleColumns).not.toContain('name')
      
      // Toggle on
      useAppStore.getState().toggleColumn('name')
      expect(useAppStore.getState().tableState.visibleColumns).toContain('name')
    })

    it('should set group by column', () => {
      useAppStore.getState().setGroupBy('status')
      expect(useAppStore.getState().tableState.groupBy).toBe('status')
      
      useAppStore.getState().setGroupBy(undefined)
      expect(useAppStore.getState().tableState.groupBy).toBeUndefined()
    })

    it('should reset table state', () => {
      const mockData = createMockData()
      useAppStore.getState().setData(mockData)
      useAppStore.getState().setSearch('test')
      useAppStore.getState().addFilter({ column: 'status', operator: 'eq', value: 'active' })
      useAppStore.getState().setPage(3)
      
      useAppStore.getState().resetTableState()
      
      const state = useAppStore.getState()
      expect(state.tableState.search).toBe('')
      expect(state.tableState.filters).toHaveLength(0)
      expect(state.tableState.pagination.page).toBe(1)
    })
  })

  describe('Schema Actions', () => {
    it('should save schema', () => {
      const schema = createMockSchema()
      useAppStore.getState().saveSchema(schema)
      
      expect(useAppStore.getState().savedSchemas['test-schema']).toEqual(schema)
    })

    it('should delete schema', () => {
      const schema = createMockSchema()
      useAppStore.getState().saveSchema(schema)
      useAppStore.getState().deleteSchema('test-schema')
      
      expect(useAppStore.getState().savedSchemas['test-schema']).toBeUndefined()
    })

    it('should load schema', () => {
      const schema = createMockSchema()
      useAppStore.getState().saveSchema(schema)
      
      const loaded = useAppStore.getState().loadSchema('test-schema')
      expect(loaded).toEqual(schema)
    })

    it('should return null for non-existent schema', () => {
      const loaded = useAppStore.getState().loadSchema('non-existent')
      expect(loaded).toBeNull()
    })
  })
})
