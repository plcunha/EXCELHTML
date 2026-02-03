'use client'

import { 
  Search, 
  Download, 
  Columns, 
  RefreshCw, 
  Printer,
  ChevronDown,
  X,
  Pencil,
  PencilOff
} from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { exportData } from '@/lib/excel-parser'
import { downloadFile } from '@/lib/utils'

interface ToolbarProps {
  className?: string
}

export function Toolbar({ className }: ToolbarProps) {
  const { 
    data, 
    tableState, 
    setSearch, 
    clearFilters, 
    resetTableState, 
    toggleColumn,
    isEditMode,
    setEditMode
  } = useAppStore()
  
  const [showColumnPicker, setShowColumnPicker] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const columnPickerRef = useRef<HTMLDivElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  
  // Fechar menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (columnPickerRef.current && !columnPickerRef.current.contains(event.target as Node)) {
        setShowColumnPicker(false)
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleExport = useCallback((format: 'xlsx' | 'csv' | 'json') => {
    if (!data) return
    
    const blob = exportData(data, format)
    const extension = format === 'xlsx' ? 'xlsx' : format === 'csv' ? 'csv' : 'json'
    const filename = `${data.schema.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${extension}`
    
    downloadFile(blob, filename)
    setShowExportMenu(false)
  }, [data])
  
  const handlePrint = useCallback(() => {
    window.print()
  }, [])
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [setSearch])
  
  const handleClearSearch = useCallback(() => {
    setSearch('')
  }, [setSearch])
  
  const handleToggleColumnPicker = useCallback(() => {
    setShowColumnPicker(prev => !prev)
  }, [])
  
  const handleToggleExportMenu = useCallback(() => {
    setShowExportMenu(prev => !prev)
  }, [])
  
  const handleToggleEditMode = useCallback(() => {
    setEditMode(!isEditMode)
  }, [isEditMode, setEditMode])
  
  if (!data) return null
  
  const hasFilters = tableState.filters.length > 0 || tableState.search
  
  return (
    <div className={cn('flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-soft', className)}>
      {/* Busca */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar..."
          value={tableState.search}
          onChange={handleSearchChange}
          className={cn(
            'w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            'placeholder:text-gray-400 transition-all'
          )}
        />
        {tableState.search && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
      
      {/* Separador */}
      <div className="h-6 w-px bg-gray-200" />
      
      {/* Botões de ação */}
      <div className="flex items-center gap-2">
        {/* Limpar filtros */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg',
              'text-red-600 bg-red-50 hover:bg-red-100 transition-colors'
            )}
            aria-label="Limpar todos os filtros"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span>Limpar filtros</span>
          </button>
        )}
        
        {/* Seletor de colunas */}
        <div className="relative" ref={columnPickerRef}>
          <button
            onClick={handleToggleColumnPicker}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg',
              'text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors',
              showColumnPicker && 'bg-gray-100'
            )}
            aria-label="Selecionar colunas visíveis"
            aria-expanded={showColumnPicker}
            aria-haspopup="true"
          >
            <Columns className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Colunas</span>
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          
          {showColumnPicker && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-2 max-h-80 overflow-y-auto">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Colunas visíveis
                </p>
              </div>
              {data.schema.columns.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tableState.visibleColumns.includes(column.key)}
                    onChange={() => toggleColumn(column.key)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{column.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        
        {/* Exportar */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={handleToggleExportMenu}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg',
              'text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors',
              showExportMenu && 'bg-gray-100'
            )}
            aria-label="Exportar dados"
            aria-expanded={showExportMenu}
            aria-haspopup="true"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Exportar</span>
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          
          {showExportMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1">
              <button
                onClick={() => handleExport('xlsx')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Excel (.xlsx)
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                CSV (.csv)
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                JSON (.json)
              </button>
            </div>
          )}
        </div>
        
        {/* Imprimir */}
        <button
          onClick={handlePrint}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg',
            'text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors'
          )}
          aria-label="Imprimir tabela"
        >
          <Printer className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Imprimir</span>
        </button>
        
        {/* Edit Mode Toggle */}
        <button
          onClick={handleToggleEditMode}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors',
            isEditMode 
              ? 'text-primary-600 bg-primary-50 hover:bg-primary-100 ring-1 ring-primary-200' 
              : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
          )}
          aria-label={isEditMode ? 'Desativar modo de edição' : 'Ativar modo de edição'}
          aria-pressed={isEditMode}
        >
          {isEditMode ? (
            <PencilOff className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Pencil className="w-4 h-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{isEditMode ? 'Editando' : 'Editar'}</span>
        </button>
        
        {/* Reset */}
        <button
          onClick={resetTableState}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg',
            'text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors'
          )}
          title="Resetar visualização"
          aria-label="Resetar visualização da tabela"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
