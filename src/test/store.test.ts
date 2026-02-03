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

// ============================================
// getFilteredData Tests (Pure function)
// ============================================
import { getFilteredData } from '../lib/store'
import type { TableState } from '../types'

describe('getFilteredData', () => {
  const createSearchableSchema = (): DataSchema => ({
    id: 'searchable-schema',
    name: 'Searchable Schema',
    columns: [
      { key: 'id', label: 'ID', format: { type: 'number' }, sortable: true },
      { key: 'name', label: 'Name', format: { type: 'string' }, searchable: true, sortable: true },
      { key: 'email', label: 'Email', format: { type: 'email' }, searchable: true },
      { key: 'value', label: 'Value', format: { type: 'number' }, sortable: true },
      { key: 'status', label: 'Status', format: { type: 'badge' }, filterable: true },
    ],
    features: { export: true, pagination: true, search: true, filters: true },
  })

  const createFilterableData = (): ProcessedData => ({
    schema: createSearchableSchema(),
    rows: [
      { _id: '1', _rowIndex: 0, id: 1, name: 'Alice', email: 'alice@example.com', value: 100, status: 'active' },
      { _id: '2', _rowIndex: 1, id: 2, name: 'Bob', email: 'bob@example.com', value: 200, status: 'inactive' },
      { _id: '3', _rowIndex: 2, id: 3, name: 'Charlie', email: 'charlie@test.com', value: 150, status: 'active' },
      { _id: '4', _rowIndex: 3, id: 4, name: 'Diana', email: 'diana@example.com', value: 300, status: 'pending' },
      { _id: '5', _rowIndex: 4, id: 5, name: 'Eve', email: 'eve@test.com', value: 50, status: 'active' },
      { _id: '6', _rowIndex: 5, id: 6, name: null, email: null, value: null, status: 'unknown' },
    ],
    metadata: { totalRows: 6, processedAt: new Date(), sourceFileName: 'test.xlsx' },
  })

  const defaultTableState: TableState = {
    filters: [],
    search: '',
    pagination: {
      page: 1,
      pageSize: 25,
      totalPages: 1,
      totalItems: 0,
    },
    visibleColumns: ['id', 'name', 'email', 'value', 'status'],
  }

  describe('when no data is loaded', () => {
    it('should return empty rows and zero total', () => {
      const result = getFilteredData(null, defaultTableState)
      expect(result.rows).toEqual([])
      expect(result.totalFiltered).toBe(0)
    })
  })

  describe('search functionality', () => {
    it('should filter by search term in searchable columns', () => {
      const tableState = { ...defaultTableState, search: 'alice' }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(1)
      expect(result.rows[0].name).toBe('Alice')
    })

    it('should search case-insensitively', () => {
      const tableState = { ...defaultTableState, search: 'BOB' }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(1)
      expect(result.rows[0].name).toBe('Bob')
    })

    it('should search in email column', () => {
      const tableState = { ...defaultTableState, search: '@test.com' }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(2)
      expect(result.rows.map(r => r.name)).toContain('Charlie')
      expect(result.rows.map(r => r.name)).toContain('Eve')
    })

    it('should return no results for non-matching search', () => {
      const tableState = { ...defaultTableState, search: 'xyz123nonexistent' }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(0)
      expect(result.totalFiltered).toBe(0)
    })

    it('should handle null values in search', () => {
      const tableState = { ...defaultTableState, search: 'Alice' }
      const result = getFilteredData(createFilterableData(), tableState)
      
      // Should not crash and should find Alice
      expect(result.rows.length).toBe(1)
    })
  })

  describe('filter operators', () => {
    it('should filter with eq (equals) operator', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'status', operator: 'eq', value: 'active' }],
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(3)
      result.rows.forEach(row => expect(row.status).toBe('active'))
    })

    it('should filter with neq (not equals) operator', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'status', operator: 'neq', value: 'active' }],
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(3)
      result.rows.forEach(row => expect(row.status).not.toBe('active'))
    })

    it('should filter with gt (greater than) operator', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'value', operator: 'gt', value: 150 }],
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(2)
      result.rows.forEach(row => expect(Number(row.value)).toBeGreaterThan(150))
    })

    it('should filter with gte (greater than or equal) operator', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'value', operator: 'gte', value: 150 }],
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(3)
      result.rows.forEach(row => expect(Number(row.value)).toBeGreaterThanOrEqual(150))
    })

    it('should filter with lt (less than) operator', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'value', operator: 'lt', value: 150 }],
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      // Alice (100), Eve (50), and null (NaN < 150 = false, but null row also included due to Number(null) = 0)
      // Actually Number(null) = 0, so 0 < 150 = true
      expect(result.rows.length).toBe(3) // Alice, Eve, and null row
      const nonNullRows = result.rows.filter(r => r.value !== null)
      nonNullRows.forEach(row => expect(Number(row.value)).toBeLessThan(150))
    })

    it('should filter with lte (less than or equal) operator', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'value', operator: 'lte', value: 150 }],
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      // Alice (100), Charlie (150), Eve (50), and null row (Number(null) = 0 <= 150)
      expect(result.rows.length).toBe(4)
      const nonNullRows = result.rows.filter(r => r.value !== null)
      nonNullRows.forEach(row => expect(Number(row.value)).toBeLessThanOrEqual(150))
    })

    it('should filter with contains operator', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'email', operator: 'contains', value: 'example' }],
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(3)
      result.rows.forEach(row => expect(String(row.email).toLowerCase()).toContain('example'))
    })

    it('should filter with startsWith operator', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'name', operator: 'startsWith', value: 'A' }],
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(1)
      expect(result.rows[0].name).toBe('Alice')
    })

    it('should filter with endsWith operator', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'name', operator: 'endsWith', value: 'e' }],
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(3) // Alice, Charlie, Eve
    })

    it('should filter with in operator', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'status', operator: 'in', value: ['active', 'pending'] }],
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(4) // 3 active + 1 pending
    })

    it('should return all rows for unknown operator', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'status', operator: 'unknown' as FilterState['operator'], value: 'test' }],
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(6)
    })
  })

  describe('sorting', () => {
    it('should sort by number column ascending', () => {
      const tableState: TableState = {
        ...defaultTableState,
        sort: { column: 'value', direction: 'asc' },
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      const values = result.rows.map(r => r.value).filter(v => v !== null)
      expect(values).toEqual([50, 100, 150, 200, 300])
    })

    it('should sort by number column descending', () => {
      const tableState: TableState = {
        ...defaultTableState,
        sort: { column: 'value', direction: 'desc' },
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      // Null values go to end
      const nonNullRows = result.rows.filter(r => r.value !== null)
      const values = nonNullRows.map(r => r.value)
      expect(values).toEqual([300, 200, 150, 100, 50])
    })

    it('should sort by string column ascending', () => {
      const tableState: TableState = {
        ...defaultTableState,
        sort: { column: 'name', direction: 'asc' },
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      const names = result.rows.map(r => r.name).filter(n => n !== null)
      expect(names).toEqual(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'])
    })

    it('should sort by string column descending', () => {
      const tableState: TableState = {
        ...defaultTableState,
        sort: { column: 'name', direction: 'desc' },
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      const names = result.rows.filter(r => r.name !== null).map(r => r.name)
      expect(names).toEqual(['Eve', 'Diana', 'Charlie', 'Bob', 'Alice'])
    })

    it('should handle null values in sorting (null goes to end)', () => {
      const tableState: TableState = {
        ...defaultTableState,
        sort: { column: 'value', direction: 'asc' },
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      const lastRow = result.rows[result.rows.length - 1]
      expect(lastRow.value).toBeNull()
    })
  })

  describe('pagination', () => {
    it('should paginate results correctly', () => {
      const tableState: TableState = {
        ...defaultTableState,
        pagination: { ...defaultTableState.pagination, pageSize: 2, page: 1 },
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(2)
      expect(result.totalFiltered).toBe(6)
    })

    it('should return correct page of results', () => {
      const tableState: TableState = {
        ...defaultTableState,
        pagination: { ...defaultTableState.pagination, pageSize: 2, page: 2 },
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(2)
      expect(result.rows[0]._id).toBe('3') // Third item
    })

    it('should return remaining items on last page', () => {
      const tableState: TableState = {
        ...defaultTableState,
        pagination: { ...defaultTableState.pagination, pageSize: 4, page: 2 },
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.rows.length).toBe(2) // 6 items, 4 per page, page 2 has 2 items
    })
  })

  describe('combined operations', () => {
    it('should apply search, filter, sort, and pagination together', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'status', operator: 'eq', value: 'active' }],
        sort: { column: 'value', direction: 'desc' },
        pagination: { ...defaultTableState.pagination, pageSize: 2, page: 1 },
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      expect(result.totalFiltered).toBe(3) // Alice, Charlie, Eve are active
      expect(result.rows.length).toBe(2) // First page
      expect(result.rows[0].name).toBe('Charlie') // 150 is highest among active
      expect(result.rows[1].name).toBe('Alice') // 100 is second
    })

    it('should update totalFiltered when combining search and filter', () => {
      const tableState: TableState = {
        ...defaultTableState,
        filters: [{ column: 'status', operator: 'eq', value: 'active' }],
        search: 'e', // Matches Alice (has 'e' in email), Charlie (has 'e' in email), Eve (has 'e' in name and email)
      }
      const result = getFilteredData(createFilterableData(), tableState)
      
      // Active: Alice, Charlie, Eve
      // Search 'e' in searchable columns (name, email):
      // - Alice: alice@example.com contains 'e' ✓
      // - Charlie: charlie@test.com contains 'e' ✓ 
      // - Eve: Eve contains 'e' and eve@test.com contains 'e' ✓
      expect(result.totalFiltered).toBe(3)
    })
  })
})
