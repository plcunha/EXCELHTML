'use client'

import { useMemo } from 'react'
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  ExternalLink,
  Mail,
  Phone,
  Check,
  X,
  Image as ImageIcon 
} from 'lucide-react'
import { cn, formatValue } from '@/lib/utils'
import { useAppStore, useFilteredData } from '@/lib/store'
import type { ColumnDefinition, CellValue } from '@/types'

// ============================================
// COMPONENTES DE CÉLULA ESPECIALIZADOS
// ============================================

interface CellProps {
  value: CellValue
  column: ColumnDefinition
}

function BadgeCell({ value, column }: CellProps) {
  const strValue = String(value ?? '')
  const colors = column.format.badgeColors?.[strValue] || { bg: '#e5e7eb', text: '#374151' }
  
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {strValue}
    </span>
  )
}

function ProgressCell({ value }: CellProps) {
  const numValue = Math.min(100, Math.max(0, Number(value) || 0))
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            numValue >= 80 ? 'bg-green-500' :
            numValue >= 50 ? 'bg-yellow-500' :
            'bg-red-500'
          )}
          style={{ width: `${numValue}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-9 text-right">{numValue}%</span>
    </div>
  )
}

function BooleanCell({ value }: CellProps) {
  const boolValue = Boolean(value)
  
  return (
    <div className="flex justify-center">
      {boolValue ? (
        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-3 h-3 text-green-600" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
          <X className="w-3 h-3 text-red-600" />
        </div>
      )}
    </div>
  )
}

function EmailCell({ value }: CellProps) {
  const email = String(value ?? '')
  
  return (
    <a
      href={`mailto:${email}`}
      className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-800 hover:underline"
    >
      <Mail className="w-3.5 h-3.5" />
      {email}
    </a>
  )
}

function UrlCell({ value }: CellProps) {
  const url = String(value ?? '')
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-800 hover:underline truncate max-w-[200px]"
    >
      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
    </a>
  )
}

function PhoneCell({ value }: CellProps) {
  const phone = String(value ?? '')
  
  return (
    <a
      href={`tel:${phone.replace(/\D/g, '')}`}
      className="inline-flex items-center gap-1.5 text-gray-700 hover:text-primary-600"
    >
      <Phone className="w-3.5 h-3.5" />
      {phone}
    </a>
  )
}

function ImageCell({ value }: CellProps) {
  const url = String(value ?? '')
  
  return (
    <div className="flex items-center justify-center">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- Dynamic external URLs from Excel data
        <img
          src={url}
          alt=""
          className="w-8 h-8 rounded object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextElementSibling?.classList.remove('hidden')
          }}
        />
      ) : null}
      <div className={cn('w-8 h-8 rounded bg-gray-200 flex items-center justify-center', url && 'hidden')}>
        <ImageIcon className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  )
}

function CurrencyCell({ value, column }: CellProps) {
  const formatted = formatValue(value, column.format)
  const numValue = Number(value)
  
  return (
    <span className={cn(
      'font-mono',
      numValue < 0 && 'text-red-600',
      numValue > 0 && 'text-green-600'
    )}>
      {formatted}
    </span>
  )
}

// ============================================
// CÉLULA GENÉRICA
// ============================================

function TableCell({ value, column }: CellProps) {
  switch (column.format.type) {
    case 'badge':
      return <BadgeCell value={value} column={column} />
    case 'progress':
      return <ProgressCell value={value} column={column} />
    case 'boolean':
      return <BooleanCell value={value} column={column} />
    case 'email':
      return <EmailCell value={value} column={column} />
    case 'url':
      return <UrlCell value={value} column={column} />
    case 'phone':
      return <PhoneCell value={value} column={column} />
    case 'image':
      return <ImageCell value={value} column={column} />
    case 'currency':
      return <CurrencyCell value={value} column={column} />
    default:
      return <span>{formatValue(value, column.format)}</span>
  }
}

// ============================================
// COMPONENTE PRINCIPAL DA TABELA
// ============================================

interface DataTableProps {
  className?: string
}

export function DataTable({ className }: DataTableProps) {
  const { data, tableState, setSort } = useAppStore()
  const { rows, totalFiltered } = useFilteredData()
  
  // Colunas visíveis
  const visibleColumns = useMemo(() => {
    if (!data) return []
    return data.schema.columns.filter(
      col => tableState.visibleColumns.includes(col.key)
    )
  }, [data, tableState.visibleColumns])
  
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Nenhum dado carregado
      </div>
    )
  }
  
  const handleSort = (column: ColumnDefinition) => {
    if (!column.sortable) return
    
    const currentSort = tableState.sort
    let newDirection: 'asc' | 'desc' = 'asc'
    
    if (currentSort?.column === column.key) {
      newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc'
    }
    
    setSort({ column: column.key, direction: newDirection })
  }
  
  return (
    <div className={cn('overflow-hidden rounded-xl border border-gray-200 bg-white shadow-soft', className)}>
      <div className="overflow-x-auto">
        <table className="w-full" role="grid" aria-label="Tabela de dados">
          {/* Header */}
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 select-none transition-colors',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sticky === 'left' && 'sticky left-0 bg-gray-50 z-10',
                    column.sticky === 'right' && 'sticky right-0 bg-gray-50 z-10',
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                  aria-sort={
                    tableState.sort?.column === column.key
                      ? tableState.sort.direction === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                  tabIndex={column.sortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      handleSort(column)
                    }
                  }}
                >
                  <div className={cn(
                    'flex items-center gap-1.5',
                    column.align === 'center' && 'justify-center',
                    column.align === 'right' && 'justify-end',
                  )}>
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="text-gray-400" aria-hidden="true">
                        {tableState.sort?.column === column.key ? (
                          tableState.sort.direction === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-primary-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-primary-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  Nenhum resultado encontrado
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={`${row._id}-${column.key}`}
                      className={cn(
                        'px-4 py-3 text-sm text-gray-700',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.sticky === 'left' && 'sticky left-0 bg-white z-10',
                        column.sticky === 'right' && 'sticky right-0 bg-white z-10',
                      )}
                    >
                      <TableCell value={row[column.key]} column={column} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer com contagem */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
        Mostrando {rows.length} de {totalFiltered} resultados
        {totalFiltered !== data.rows.length && (
          <span className="text-gray-400"> (filtrado de {data.rows.length} total)</span>
        )}
      </div>
    </div>
  )
}
