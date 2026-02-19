'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Filter, Plus, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { DROPDOWN_Z_INDEX } from '@/lib/constants'
import type { FilterState, CellValue, ColumnDefinition } from '@/types'

// ============================================
// OPERADORES DE FILTRO
// ============================================

interface OperatorOption {
  value: FilterState['operator']
  label: string
  /** Column types this operator applies to */
  types: ReadonlyArray<string>
}

const OPERATORS: OperatorOption[] = [
  { value: 'eq', label: 'Igual a', types: ['string', 'number', 'currency', 'percentage', 'date', 'datetime', 'boolean', 'email', 'url', 'phone', 'badge'] },
  { value: 'neq', label: 'Diferente de', types: ['string', 'number', 'currency', 'percentage', 'date', 'datetime', 'boolean', 'email', 'url', 'phone', 'badge'] },
  { value: 'gt', label: 'Maior que', types: ['number', 'currency', 'percentage', 'progress'] },
  { value: 'gte', label: 'Maior ou igual', types: ['number', 'currency', 'percentage', 'progress'] },
  { value: 'lt', label: 'Menor que', types: ['number', 'currency', 'percentage', 'progress'] },
  { value: 'lte', label: 'Menor ou igual', types: ['number', 'currency', 'percentage', 'progress'] },
  { value: 'contains', label: 'Contém', types: ['string', 'email', 'url', 'phone', 'badge'] },
  { value: 'startsWith', label: 'Começa com', types: ['string', 'email', 'url', 'phone'] },
  { value: 'endsWith', label: 'Termina com', types: ['string', 'email', 'url', 'phone'] },
]

function getOperatorsForColumn(column: ColumnDefinition): OperatorOption[] {
  return OPERATORS.filter(op => op.types.includes(column.format.type))
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface FilterPanelProps {
  className?: string
}

export function FilterPanel({ className }: FilterPanelProps) {
  const { data, tableState, addFilter, removeFilter, clearFilters } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const filterableColumns = data?.schema.columns.filter(c => c.filterable) ?? []
  const activeFilters = tableState.filters

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  if (!data) return null

  return (
    <div className={cn('relative', className)} ref={panelRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors',
          activeFilters.length > 0
            ? 'text-primary-600 bg-primary-50 hover:bg-primary-100 ring-1 ring-primary-200'
            : 'text-gray-600 bg-gray-50 hover:bg-gray-100',
          isOpen && 'bg-gray-100'
        )}
        aria-label="Filtros"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Filter className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">Filtros</span>
        {activeFilters.length > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full">
            {activeFilters.length}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-96 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg py-3 max-h-[480px] overflow-y-auto"
          style={{ zIndex: DROPDOWN_Z_INDEX }}
          role="dialog"
          aria-label="Painel de filtros"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Filtros
            </h3>
            {activeFilters.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Limpar todos
              </button>
            )}
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="px-4 py-3 space-y-2 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ativos ({activeFilters.length})
              </p>
              {activeFilters.map((filter) => {
                const column = data.schema.columns.find(c => c.key === filter.column)
                const operator = OPERATORS.find(o => o.value === filter.operator)
                return (
                  <div
                    key={filter.column}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                        {column?.label ?? filter.column}
                      </span>
                      <span className="text-xs text-primary-500 dark:text-primary-400 mx-1">
                        {operator?.label ?? filter.operator}
                      </span>
                      <span className="text-xs font-mono text-primary-800 dark:text-primary-200 truncate">
                        &quot;{String(filter.value ?? '')}&quot;
                      </span>
                    </div>
                    <button
                      onClick={() => removeFilter(filter.column)}
                      className="flex-shrink-0 p-1 text-primary-400 hover:text-red-500 transition-colors rounded"
                      aria-label={`Remover filtro ${column?.label ?? filter.column}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add New Filter */}
          <div className="px-4 pt-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Adicionar filtro
            </p>
            {filterableColumns.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                Nenhuma coluna filtrável disponível
              </p>
            ) : (
              <FilterForm
                columns={filterableColumns}
                activeFilterColumns={activeFilters.map(f => f.column)}
                onAddFilter={(filter) => {
                  addFilter(filter)
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// FORMULÁRIO DE NOVO FILTRO
// ============================================

interface FilterFormProps {
  columns: ColumnDefinition[]
  activeFilterColumns: string[]
  onAddFilter: (filter: FilterState) => void
}

function FilterForm({ columns, activeFilterColumns, onAddFilter }: FilterFormProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [selectedOperator, setSelectedOperator] = useState<FilterState['operator']>('contains')
  const [filterValue, setFilterValue] = useState<string>('')

  const currentColumn = columns.find(c => c.key === selectedColumn)
  const availableOperators = currentColumn ? getOperatorsForColumn(currentColumn) : []

  // When column changes, reset operator to first available
  const handleColumnChange = (columnKey: string) => {
    setSelectedColumn(columnKey)
    setFilterValue('')
    const col = columns.find(c => c.key === columnKey)
    if (col) {
      const ops = getOperatorsForColumn(col)
      setSelectedOperator(ops[0]?.value ?? 'contains')
    }
  }

  const handleSubmit = () => {
    if (!selectedColumn || !filterValue.trim()) return

    let value: CellValue = filterValue.trim()

    // Coerce numeric values
    if (currentColumn && ['number', 'currency', 'percentage', 'progress'].includes(currentColumn.format.type)) {
      const num = parseFloat(value.replace(/[^\d.-]/g, ''))
      if (!isNaN(num)) value = num
    }

    onAddFilter({
      column: selectedColumn,
      operator: selectedOperator,
      value,
    })

    // Reset form
    setSelectedColumn('')
    setFilterValue('')
    setSelectedOperator('contains')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Filter out columns that already have active filters
  const availableColumns = columns.filter(c => !activeFilterColumns.includes(c.key))

  return (
    <div className="space-y-3">
      {/* Column Selector */}
      <div>
        <label htmlFor="filter-column" className="sr-only">Coluna</label>
        <select
          id="filter-column"
          value={selectedColumn}
          onChange={(e) => handleColumnChange(e.target.value)}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700',
            'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'
          )}
        >
          <option value="">Selecione uma coluna...</option>
          {availableColumns.map((col) => (
            <option key={col.key} value={col.key}>
              {col.label}
            </option>
          ))}
        </select>
      </div>

      {/* Operator + Value (only show when column is selected) */}
      {selectedColumn && (
        <>
          <div>
            <label htmlFor="filter-operator" className="sr-only">Operador</label>
            <select
              id="filter-operator"
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value as FilterState['operator'])}
              className={cn(
                'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'
              )}
            >
              {availableOperators.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="filter-value" className="sr-only">Valor</label>
              <input
                id="filter-value"
                type={currentColumn && ['number', 'currency', 'percentage', 'progress'].includes(currentColumn.format.type) ? 'number' : 'text'}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Valor..."
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700',
                  'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'
                )}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!filterValue.trim()}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg font-medium transition-colors',
                filterValue.trim()
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              )}
              aria-label="Adicionar filtro"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {availableColumns.length === 0 && activeFilterColumns.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
          Todas as colunas filtráveis já possuem filtros ativos
        </p>
      )}
    </div>
  )
}
