'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Check, Palette, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { companyPresets, applyTheme } from '@/lib/config'
import { MODAL_Z_INDEX } from '@/lib/constants'
import type { CompanyConfig, CompanyTheme } from '@/types'

// ============================================
// CONSTANTES DO PAINEL
// ============================================

const PRESET_LABELS: Record<string, string> = {
  default: 'Padrão',
  techCorp: 'TechCorp',
  financeBank: 'FinanceBank',
  shopMax: 'ShopMax',
}

const PRESET_DESCRIPTIONS: Record<string, string> = {
  default: 'Tema azul padrão do sistema',
  techCorp: 'Tema violeta para empresas de tecnologia',
  financeBank: 'Tema teal para instituições financeiras',
  shopMax: 'Tema laranja para e-commerce',
}

const COLOR_LABELS: Record<string, string> = {
  primary: 'Primária',
  primaryDark: 'Primária escura',
  primaryLight: 'Primária clara',
  accent: 'Acento',
  background: 'Fundo',
  surface: 'Superfície',
  text: 'Texto',
  textSecondary: 'Texto secundário',
  border: 'Borda',
  success: 'Sucesso',
  warning: 'Aviso',
  error: 'Erro',
  info: 'Info',
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { company, isDarkMode, setCompany, setCustomCompany } = useAppStore()
  const [selectedPresetId, setSelectedPresetId] = useState<string>(company.id)
  const [previewTheme, setPreviewTheme] = useState<CompanyTheme>(company.theme)
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      // Focus first interactive element
      const timer = setTimeout(() => {
        panelRef.current?.querySelector<HTMLElement>('button, [tabindex]')?.focus()
      }, 50)
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ''
        previousFocusRef.current?.focus()
      }
    }
  }, [open])

  // Close on ESC
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Focus trap
  useEffect(() => {
    if (!open) return
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [open])

  // Sync selected preset when company changes externally
  useEffect(() => {
    setSelectedPresetId(company.id)
    setPreviewTheme(company.theme)
  }, [company])

  const handleSelectPreset = useCallback((presetId: string) => {
    setSelectedPresetId(presetId)
    const preset = companyPresets[presetId]
    if (preset) {
      setPreviewTheme(preset.theme)
    }
  }, [])

  const handleApply = useCallback(() => {
    // Check if it's a known preset
    if (companyPresets[selectedPresetId]) {
      setCompany(selectedPresetId)
      const preset = companyPresets[selectedPresetId]
      const themeToApply = isDarkMode ? preset.theme : preset.theme
      applyTheme(themeToApply)
    } else {
      // Custom: build a config from current preview
      const customConfig: CompanyConfig = {
        ...company,
        theme: previewTheme,
      }
      setCustomCompany(customConfig)
      applyTheme(previewTheme)
    }
    onClose()
  }, [selectedPresetId, isDarkMode, company, previewTheme, setCompany, setCustomCompany, onClose])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  if (!open) return null

  const presetIds = Object.keys(companyPresets)

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end"
      style={{ zIndex: MODAL_Z_INDEX + 10 }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      {/* Slide-out drawer */}
      <div
        ref={panelRef}
        className={cn(
          'w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl',
          'flex flex-col overflow-hidden',
          'animate-slide-in-right'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <h2 id="settings-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Configurações
            </h2>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
              'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
            )}
            aria-label="Fechar configurações"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Company Preset Selector */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                Tema da empresa
              </h3>
            </div>

            <div className="space-y-2">
              {presetIds.map((presetId) => {
                const preset = companyPresets[presetId]
                const isSelected = selectedPresetId === presetId
                return (
                  <button
                    key={presetId}
                    onClick={() => handleSelectPreset(presetId)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-200 dark:ring-primary-700'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    )}
                  >
                    {/* Color preview swatch */}
                    <div className="flex-shrink-0 flex gap-0.5">
                      <div
                        className="w-4 h-8 rounded-l-md"
                        style={{ backgroundColor: preset.theme.colors.primary }}
                      />
                      <div
                        className="w-4 h-8"
                        style={{ backgroundColor: preset.theme.colors.accent }}
                      />
                      <div
                        className="w-4 h-8 rounded-r-md"
                        style={{ backgroundColor: preset.theme.colors.primaryLight }}
                      />
                    </div>

                    {/* Name / description */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium',
                        isSelected
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300'
                      )}>
                        {PRESET_LABELS[presetId] ?? preset.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {PRESET_DESCRIPTIONS[presetId] ?? preset.name}
                      </p>
                    </div>

                    {/* Check */}
                    {isSelected && (
                      <Check className="w-4 h-4 flex-shrink-0 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Theme Color Preview */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-3">
              Pré-visualização de cores
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(previewTheme.colors).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div
                    className="w-5 h-5 rounded-md border border-gray-200 dark:border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: value }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">
                      {COLOR_LABELS[key] ?? key}
                    </p>
                    <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Theme Properties */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-3">
              Propriedades
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-xs text-gray-600 dark:text-gray-300">Borda arredondada</span>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  {previewTheme.borderRadius ?? 'lg'}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-xs text-gray-600 dark:text-gray-300">Sombras</span>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  {previewTheme.shadows ?? 'soft'}
                </span>
              </div>
              {previewTheme.fonts?.sans && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-xs text-gray-600 dark:text-gray-300">Fonte sans</span>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {previewTheme.fonts.sans}
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'text-gray-700 hover:bg-gray-100',
              'dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'bg-primary-600 text-white hover:bg-primary-700',
              'disabled:bg-gray-300 disabled:cursor-not-allowed'
            )}
          >
            Aplicar tema
          </button>
        </div>
      </div>
    </div>
  )
}
