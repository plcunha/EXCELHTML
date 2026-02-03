'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { 
  Header, 
  FileUpload, 
  DataTable, 
  Toolbar, 
  Pagination,
  Charts 
} from '@/components'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { BarChart3, Table2, Upload, Sparkles, Keyboard, X } from 'lucide-react'
import { useKeyboardShortcuts, formatShortcut, type KeyboardShortcut } from '@/lib/useKeyboardShortcuts'

type ViewMode = 'table' | 'charts'

export default function HomePage() {
  const { data, isLoading, error, toggleDarkMode, clearData, setSearch, setPage, tableState } = useAppStore()
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Memoized actions for keyboard shortcuts
  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus()
  }, [])
  
  const toggleView = useCallback(() => {
    setViewMode(prev => prev === 'table' ? 'charts' : 'table')
  }, [])
  
  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])
  
  const goToFirstPage = useCallback(() => {
    if (data) setPage(1)
  }, [data, setPage])
  
  const goToLastPage = useCallback(() => {
    if (data) setPage(tableState.pagination.totalPages)
  }, [data, setPage, tableState.pagination.totalPages])
  
  const goToPrevPage = useCallback(() => {
    if (data && tableState.pagination.page > 1) {
      setPage(tableState.pagination.page - 1)
    }
  }, [data, setPage, tableState.pagination.page])
  
  const goToNextPage = useCallback(() => {
    if (data && tableState.pagination.page < tableState.pagination.totalPages) {
      setPage(tableState.pagination.page + 1)
    }
  }, [data, setPage, tableState.pagination.page, tableState.pagination.totalPages])
  
  const clearSearch = useCallback(() => {
    setSearch('')
  }, [setSearch])
  
  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    { key: 'f', ctrl: true, action: focusSearch, description: 'Focar na busca' },
    { key: 'o', ctrl: true, action: triggerUpload, description: 'Abrir arquivo' },
    { key: 'v', ctrl: true, shift: true, action: toggleView, description: 'Alternar tabela/gráficos' },
    { key: 'd', ctrl: true, action: toggleDarkMode, description: 'Alternar modo escuro' },
    { key: 'Escape', action: clearSearch, description: 'Limpar busca' },
    { key: '?', shift: true, action: () => setShowShortcuts(true), description: 'Mostrar atalhos' },
    { key: 'Home', ctrl: true, action: goToFirstPage, description: 'Primeira página' },
    { key: 'End', ctrl: true, action: goToLastPage, description: 'Última página' },
    { key: 'ArrowLeft', ctrl: true, action: goToPrevPage, description: 'Página anterior' },
    { key: 'ArrowRight', ctrl: true, action: goToNextPage, description: 'Próxima página' },
    { key: 'Delete', ctrl: true, action: clearData, description: 'Limpar dados' },
  ], [focusSearch, triggerUpload, toggleView, toggleDarkMode, clearSearch, goToFirstPage, goToLastPage, goToPrevPage, goToNextPage, clearData])
  
  // Register keyboard shortcuts
  useKeyboardShortcuts(shortcuts)
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 container mx-auto px-4 py-6" role="main" aria-label="Conteúdo principal">
        {/* Estado de erro */}
        {error && (
          <div 
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {/* Estado sem dados */}
        {!data && !isLoading && (
          <div className="max-w-2xl mx-auto mt-12">
            {/* Hero */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Visualizador de Excel Moderno</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Transforme seus dados em{' '}
                <span className="gradient-text">insights visuais</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Faça upload de arquivos Excel ou CSV e visualize seus dados em 
                tabelas interativas e gráficos dinâmicos.
              </p>
            </div>
            
            {/* Upload */}
            <FileUpload />
            
            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <FeatureCard
                icon={<Table2 className="w-5 h-5" />}
                title="Tabelas Interativas"
                description="Ordene, filtre e busque seus dados"
              />
              <FeatureCard
                icon={<BarChart3 className="w-5 h-5" />}
                title="Gráficos Dinâmicos"
                description="Visualize tendências e padrões"
              />
              <FeatureCard
                icon={<Upload className="w-5 h-5" />}
                title="Exportar Dados"
                description="XLSX, CSV ou JSON"
              />
            </div>
          </div>
        )}
        
        {/* Estado com dados */}
        {data && (
          <div className="space-y-4 animate-fade-in">
            {/* Toolbar com toggle de visualização */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Toolbar className="flex-1" />
              
              {/* Toggle de modo de visualização */}
              <div 
                className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg"
                role="tablist"
                aria-label="Modo de visualização"
              >
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                  role="tab"
                  aria-selected={viewMode === 'table'}
                  aria-controls="view-panel"
                  id="tab-table"
                >
                  <Table2 className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Tabela</span>
                </button>
                <button
                  onClick={() => setViewMode('charts')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'charts'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                  role="tab"
                  aria-selected={viewMode === 'charts'}
                  aria-controls="view-panel"
                  id="tab-charts"
                >
                  <BarChart3 className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Gráficos</span>
                </button>
              </div>
            </div>
            
            {/* Conteúdo principal */}
            <div 
              id="view-panel"
              role="tabpanel"
              aria-labelledby={viewMode === 'table' ? 'tab-table' : 'tab-charts'}
            >
              {viewMode === 'table' ? (
                <>
                  <DataTable />
                  <Pagination />
                </>
              ) : (
                <Charts />
              )}
            </div>
            
            {/* Upload adicional (compacto) */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Carregar outro arquivo:
              </p>
              <FileUpload className="max-w-md" />
            </div>
          </div>
        )}
        
        {/* Estado de carregamento */}
        {isLoading && (
          <div 
            className="flex flex-col items-center justify-center py-16"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div 
              className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"
              aria-hidden="true"
            />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Processando arquivo...
            </p>
            <span className="sr-only">Carregando, por favor aguarde...</span>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer 
        className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800"
        role="contentinfo"
        aria-label="Rodapé"
      >
        <div className="flex items-center justify-center gap-4">
          <p>
            Excel Viewer © {new Date().getFullYear()} • 
            Sistema modular para visualização de dados
          </p>
          <button
            onClick={() => setShowShortcuts(true)}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Mostrar atalhos de teclado"
          >
            <Keyboard className="w-4 h-4" />
            <span className="text-xs">Shift + ?</span>
          </button>
        </div>
      </footer>
      
      {/* Hidden file input for keyboard shortcut */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        aria-hidden="true"
      />
      
      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcutsModal
          shortcuts={shortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      )}
    </div>
  )
}

// Componente de feature card
function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-soft">
      <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
        {title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  )
}

// Keyboard shortcuts modal
function KeyboardShortcutsModal({
  shortcuts,
  onClose,
}: {
  shortcuts: KeyboardShortcut[]
  onClose: () => void
}) {
  // Close on Escape
  useKeyboardShortcuts([
    { key: 'Escape', action: onClose, description: 'Fechar modal' },
  ])
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 id="shortcuts-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Atalhos de Teclado
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Shortcuts List */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {shortcut.description}
                </span>
                <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Pressione <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> para fechar
          </p>
        </div>
      </div>
    </div>
  )
}
