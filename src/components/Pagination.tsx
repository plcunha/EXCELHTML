'use client'

import { useCallback } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn, getPaginationRange } from '@/lib/utils'
import { useAppStore, useFilteredData } from '@/lib/store'

interface PaginationProps {
  className?: string
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export function Pagination({ className }: PaginationProps) {
  const { tableState, setPage, setPageSize } = useAppStore()
  const { totalFiltered } = useFilteredData()
  
  const { page, pageSize } = tableState.pagination
  const totalPages = Math.ceil(totalFiltered / pageSize)
  
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }, [totalPages, setPage])
  
  if (totalFiltered === 0) return null
  
  const paginationRange = getPaginationRange(page, totalPages)
  
  return (
    <nav
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 p-4',
        'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft',
        className
      )}
      aria-label="Paginação da tabela"
    >
      {/* Info e seletor de tamanho */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {Math.min((page - 1) * pageSize + 1, totalFiltered)} a{' '}
          {Math.min(page * pageSize, totalFiltered)} de {totalFiltered}
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="page-size-select" className="text-sm text-gray-500 dark:text-gray-400">Itens por página:</label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            aria-label="Selecionar quantidade de itens por página"
            className={cn(
              'px-2 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'
            )}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size} className="bg-white dark:bg-gray-800">
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Controles de paginação */}
      <div className="flex items-center gap-1">
        {/* Primeira página */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
          className={cn(
            'p-2 rounded-lg transition-colors',
            page === 1
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          title="Primeira página"
          aria-label="Ir para primeira página"
        >
          <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Página anterior */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            'p-2 rounded-lg transition-colors',
            page === 1
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          title="Página anterior"
          aria-label="Ir para página anterior"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1 mx-2">
          {paginationRange.map((pageNum, index) => (
            pageNum === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400 dark:text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                aria-label={`Ir para página ${pageNum}`}
                aria-current={pageNum === page ? 'page' : undefined}
                className={cn(
                  'min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors',
                  pageNum === page
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {pageNum}
              </button>
            )
          ))}
        </div>

        {/* Próxima página */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            'p-2 rounded-lg transition-colors',
            page === totalPages
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          title="Próxima página"
          aria-label="Ir para próxima página"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Última página */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
          className={cn(
            'p-2 rounded-lg transition-colors',
            page === totalPages
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          title="Última página"
          aria-label="Ir para última página"
        >
          <ChevronsRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
