import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  ProcessedData, 
  TableState, 
  CompanyConfig, 
  DataSchema,
  FilterState,
  SortState,
  CellValue 
} from '@/types'
import { companyPresets } from './config'

// ============================================
// STORE PRINCIPAL DA APLICAÇÃO
// ============================================

interface AppState {
  // Dados carregados
  data: ProcessedData | null
  isLoading: boolean
  error: string | null
  
  // Configuração da empresa
  company: CompanyConfig
  isDarkMode: boolean
  
  // Estado da tabela
  tableState: TableState
  
  // Modo de edição
  isEditMode: boolean
  editingCell: { rowId: string; columnKey: string } | null
  
  // Schemas salvos
  savedSchemas: Record<string, DataSchema>
  
  // Actions - Dados
  setData: (data: ProcessedData | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearData: () => void
  
  // Actions - Edição
  setEditMode: (enabled: boolean) => void
  setEditingCell: (cell: { rowId: string; columnKey: string } | null) => void
  updateCell: (rowId: string, columnKey: string, value: CellValue) => void
  
  // Actions - Empresa/Tema
  setCompany: (companyId: string) => void
  setCustomCompany: (config: CompanyConfig) => void
  toggleDarkMode: () => void
  
  // Actions - Tabela
  setSort: (sort: SortState | undefined) => void
  addFilter: (filter: FilterState) => void
  removeFilter: (column: string) => void
  clearFilters: () => void
  setSearch: (search: string) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  toggleColumn: (columnKey: string) => void
  setGroupBy: (column: string | undefined) => void
  resetTableState: () => void
  
  // Actions - Schemas
  saveSchema: (schema: DataSchema) => void
  deleteSchema: (schemaId: string) => void
  loadSchema: (schemaId: string) => DataSchema | null
}

const defaultTableState: TableState = {
  filters: [],
  search: '',
  pagination: {
    page: 1,
    pageSize: 25,
    totalPages: 1,
    totalItems: 0,
  },
  visibleColumns: [],
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      data: null,
      isLoading: false,
      error: null,
      company: companyPresets.default,
      isDarkMode: false,
      tableState: defaultTableState,
      isEditMode: false,
      editingCell: null,
      savedSchemas: {},
      
      // Actions - Dados
      setData: (data) => {
        set({ 
          data, 
          error: null,
          isEditMode: false,
          editingCell: null,
          tableState: {
            ...defaultTableState,
            visibleColumns: data?.schema.columns
              .filter(c => !c.hidden)
              .map(c => c.key) || [],
            pagination: {
              ...defaultTableState.pagination,
              totalItems: data?.rows.length || 0,
              totalPages: Math.ceil((data?.rows.length || 0) / defaultTableState.pagination.pageSize),
            },
            sort: data?.schema.defaultSort,
          },
        })
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error, isLoading: false }),
      
      clearData: () => set({ 
        data: null, 
        error: null, 
        isEditMode: false,
        editingCell: null,
        tableState: defaultTableState 
      }),
      
      // Actions - Edição
      setEditMode: (isEditMode) => set({ isEditMode, editingCell: null }),
      
      setEditingCell: (editingCell) => set({ editingCell }),
      
      updateCell: (rowId, columnKey, value) => set((state) => {
        if (!state.data) return state
        
        const updatedRows = state.data.rows.map(row => {
          if (row._id === rowId) {
            return { ...row, [columnKey]: value }
          }
          return row
        })
        
        return {
          data: {
            ...state.data,
            rows: updatedRows,
          },
          editingCell: null,
        }
      }),
      
      // Actions - Empresa/Tema
      setCompany: (companyId) => {
        const config = companyPresets[companyId] || companyPresets.default
        set({ company: config })
      },
      
      setCustomCompany: (config) => set({ company: config }),
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      // Actions - Tabela
      setSort: (sort) => set((state) => ({
        tableState: { ...state.tableState, sort },
      })),
      
      addFilter: (filter) => set((state) => ({
        tableState: {
          ...state.tableState,
          filters: [
            ...state.tableState.filters.filter(f => f.column !== filter.column),
            filter,
          ],
          pagination: { ...state.tableState.pagination, page: 1 },
        },
      })),
      
      removeFilter: (column) => set((state) => ({
        tableState: {
          ...state.tableState,
          filters: state.tableState.filters.filter(f => f.column !== column),
        },
      })),
      
      clearFilters: () => set((state) => ({
        tableState: {
          ...state.tableState,
          filters: [],
          search: '',
        },
      })),
      
      setSearch: (search) => set((state) => ({
        tableState: {
          ...state.tableState,
          search,
          pagination: { ...state.tableState.pagination, page: 1 },
        },
      })),
      
      setPage: (page) => set((state) => ({
        tableState: {
          ...state.tableState,
          pagination: { ...state.tableState.pagination, page },
        },
      })),
      
      setPageSize: (pageSize) => set((state) => {
        const totalItems = state.data?.rows.length || 0
        return {
          tableState: {
            ...state.tableState,
            pagination: {
              ...state.tableState.pagination,
              pageSize,
              page: 1,
              totalPages: Math.ceil(totalItems / pageSize),
            },
          },
        }
      }),
      
      toggleColumn: (columnKey) => set((state) => {
        const { visibleColumns } = state.tableState
        const isVisible = visibleColumns.includes(columnKey)
        
        return {
          tableState: {
            ...state.tableState,
            visibleColumns: isVisible
              ? visibleColumns.filter(k => k !== columnKey)
              : [...visibleColumns, columnKey],
          },
        }
      }),
      
      setGroupBy: (column) => set((state) => ({
        tableState: { ...state.tableState, groupBy: column },
      })),
      
      resetTableState: () => set((state) => ({
        tableState: {
          ...defaultTableState,
          visibleColumns: state.data?.schema.columns
            .filter(c => !c.hidden)
            .map(c => c.key) || [],
        },
      })),
      
      // Actions - Schemas
      saveSchema: (schema) => set((state) => ({
        savedSchemas: { ...state.savedSchemas, [schema.id]: schema },
      })),
      
      deleteSchema: (schemaId) => set((state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [schemaId]: _removed, ...rest } = state.savedSchemas
        return { savedSchemas: rest }
      }),
      
      loadSchema: (schemaId) => get().savedSchemas[schemaId] || null,
    }),
    {
      name: 'excel-viewer-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        company: state.company,
        savedSchemas: state.savedSchemas,
      }),
    }
  )
)

// ============================================
// SELETORES DERIVADOS
// ============================================

/**
 * Pure function to get filtered and paginated data
 * This can be tested without React hooks
 */
export function getFilteredData(
  data: ProcessedData | null,
  tableState: TableState
): { rows: Record<string, CellValue>[]; totalFiltered: number } {
  if (!data) return { rows: [], totalFiltered: 0 }
  
  let filteredRows = [...data.rows]
  
  // Aplicar busca
  if (tableState.search) {
    const searchLower = tableState.search.toLowerCase()
    const searchableColumns = data.schema.columns
      .filter(c => c.searchable)
      .map(c => c.key)
    
    filteredRows = filteredRows.filter(row =>
      searchableColumns.some(key => {
        const value = row[key]
        return value != null && String(value).toLowerCase().includes(searchLower)
      })
    )
  }
  
  // Aplicar filtros
  for (const filter of tableState.filters) {
    filteredRows = filteredRows.filter(row => {
      const value = row[filter.column]
      const filterValue = filter.value
      
      switch (filter.operator) {
        case 'eq':
          return value === filterValue
        case 'neq':
          return value !== filterValue
        case 'gt':
          return Number(value) > Number(filterValue)
        case 'gte':
          return Number(value) >= Number(filterValue)
        case 'lt':
          return Number(value) < Number(filterValue)
        case 'lte':
          return Number(value) <= Number(filterValue)
        case 'contains':
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase())
        case 'endsWith':
          return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase())
        case 'in':
          return Array.isArray(filterValue) && filterValue.includes(value)
        default:
          return true
      }
    })
  }
  
  // Aplicar ordenação
  if (tableState.sort) {
    const { column, direction } = tableState.sort
    filteredRows.sort((a, b) => {
      const aVal = a[column]
      const bVal = b[column]
      
      if (aVal == null) return 1
      if (bVal == null) return -1
      
      let comparison = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }
      
      return direction === 'desc' ? -comparison : comparison
    })
  }
  
  const totalFiltered = filteredRows.length
  
  // Aplicar paginação
  const { page, pageSize } = tableState.pagination
  const start = (page - 1) * pageSize
  const paginatedRows = filteredRows.slice(start, start + pageSize)
  
  return { rows: paginatedRows, totalFiltered }
}

/**
 * Hook para obter dados filtrados e paginados
 * Wrapper around getFilteredData that uses the store
 */
export function useFilteredData() {
  const { data, tableState } = useAppStore()
  return getFilteredData(data, tableState)
}
