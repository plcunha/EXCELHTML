'use client'

import { useState } from 'react'
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
import { BarChart3, Table2, Upload, Sparkles } from 'lucide-react'

type ViewMode = 'table' | 'charts'

export default function HomePage() {
  const { data, isLoading, error } = useAppStore()
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Estado de erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
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
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  <Table2 className="w-4 h-4" />
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
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Gráficos</span>
                </button>
              </div>
            </div>
            
            {/* Conteúdo principal */}
            {viewMode === 'table' ? (
              <>
                <DataTable />
                <Pagination />
              </>
            ) : (
              <Charts />
            )}
            
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
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Processando arquivo...
            </p>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p>
          Excel Viewer © {new Date().getFullYear()} • 
          Sistema modular para visualização de dados
        </p>
      </footer>
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
