'use client'

import { useState } from 'react'
import { Moon, Sun, Settings } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { applyTheme, darkTheme } from '@/lib/config'
import { SettingsPanel } from './SettingsPanel'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { company, isDarkMode, toggleDarkMode, data } = useAppStore()
  const [showSettings, setShowSettings] = useState(false)
  
  // Aplica tema ao carregar
  useEffect(() => {
    const theme = isDarkMode ? darkTheme : company.theme
    applyTheme(theme)
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode, company.theme])
  
  return (
    <>
      <header 
        id="main-nav"
        className={cn(
          'sticky top-0 z-50 w-full',
          'bg-white/80 backdrop-blur-lg border-b border-gray-200',
          'dark:bg-gray-900/80 dark:border-gray-800',
          className
        )}
        role="banner"
        aria-label="Cabeçalho principal"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo e nome */}
          <div className="flex items-center gap-3">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- Dynamic company logo from config
              <img 
                src={isDarkMode && company.logoLight ? company.logoLight : company.logo} 
                alt={company.name}
                className="h-8 w-auto"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {company.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">
                {company.name}
              </h1>
              {data && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {data.schema.name}
                </p>
              )}
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex items-center gap-2">
            {/* Info dos dados */}
            {data && (
              <div className="hidden sm:flex items-center gap-2 mr-4 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30">
                <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                  {data.rows.length.toLocaleString()} registros
                </span>
                <span className="text-primary-400">•</span>
                <span className="text-xs text-primary-600 dark:text-primary-400">
                  {data.schema.columns.length} colunas
                </span>
              </div>
            )}
            
            {/* Toggle dark mode */}
            <button
              onClick={toggleDarkMode}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
              )}
              title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
              aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
            
            {/* Configurações */}
            <button
              onClick={() => setShowSettings(true)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
              )}
              title="Configurações"
              aria-label="Abrir configurações"
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel — rendered outside <header> to avoid stacking context clipping */}
      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
