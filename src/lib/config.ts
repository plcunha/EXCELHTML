import type { CompanyConfig, CompanyTheme } from '@/types'

// ============================================
// TEMAS PRÉ-DEFINIDOS
// ============================================

export const defaultTheme: CompanyTheme = {
  colors: {
    primary: '#2563eb',        // Ajustado: mais escuro para melhor contraste (4.5:1)
    primaryDark: '#1d4ed8',
    primaryLight: '#60a5fa',
    accent: '#16a34a',         // Ajustado: verde mais escuro
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#16a34a',        // Ajustado: mesmo valor do accent
    warning: '#d97706',        // Ajustado: âmbar mais escuro
    error: '#dc2626',          // Ajustado: vermelho mais escuro (4.5:1)
    info: '#2563eb',           // Ajustado: igual primary
  },
  borderRadius: 'lg',
  shadows: 'soft',
}

export const darkTheme: CompanyTheme = {
  colors: {
    primary: '#60a5fa',
    primaryDark: '#3b82f6',
    primaryLight: '#93c5fd',
    accent: '#34d399',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },
  borderRadius: 'lg',
  shadows: 'soft',
}

// ============================================
// EMPRESAS PRÉ-CONFIGURADAS (EXEMPLOS)
// ============================================

export const companyPresets: Record<string, CompanyConfig> = {
  default: {
    id: 'default',
    name: 'Excel Viewer',
    theme: defaultTheme,
    defaultLocale: 'pt-BR',
    dateFormat: 'dd/MM/yyyy',
    currencyCode: 'BRL',
  },
  
  // Exemplo: Empresa de tecnologia
  techCorp: {
    id: 'techCorp',
    name: 'TechCorp',
    logo: '/logos/techcorp.svg',
    theme: {
      colors: {
        primary: '#8b5cf6',
        primaryDark: '#6d28d9',
        primaryLight: '#a78bfa',
        accent: '#06b6d4',
        background: '#faf5ff',
        surface: '#ffffff',
        text: '#1e1b4b',
        textSecondary: '#6b7280',
        border: '#e9d5ff',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4',
      },
      borderRadius: 'xl',
      shadows: 'medium',
    },
    defaultLocale: 'pt-BR',
    currencyCode: 'BRL',
  },
  
  // Exemplo: Banco/Financeira
  financeBank: {
    id: 'financeBank',
    name: 'FinanceBank',
    logo: '/logos/financebank.svg',
    theme: {
      colors: {
        primary: '#0d9488',
        primaryDark: '#0f766e',
        primaryLight: '#14b8a6',
        accent: '#eab308',
        background: '#f0fdfa',
        surface: '#ffffff',
        text: '#134e4a',
        textSecondary: '#5f6c71',
        border: '#99f6e4',
        success: '#22c55e',
        warning: '#eab308',
        error: '#dc2626',
        info: '#0ea5e9',
      },
      borderRadius: 'md',
      shadows: 'strong',
    },
    defaultLocale: 'pt-BR',
    currencyCode: 'BRL',
  },
  
  // Exemplo: E-commerce
  shopMax: {
    id: 'shopMax',
    name: 'ShopMax',
    logo: '/logos/shopmax.svg',
    theme: {
      colors: {
        primary: '#f97316',
        primaryDark: '#ea580c',
        primaryLight: '#fb923c',
        accent: '#3b82f6',
        background: '#fff7ed',
        surface: '#ffffff',
        text: '#431407',
        textSecondary: '#78716c',
        border: '#fed7aa',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#dc2626',
        info: '#3b82f6',
      },
      borderRadius: 'lg',
      shadows: 'soft',
    },
    defaultLocale: 'pt-BR',
    currencyCode: 'BRL',
  },
}

// ============================================
// FUNÇÕES DE TEMA
// ============================================

/**
 * Gera variáveis CSS a partir do tema
 */
export function generateCSSVariables(theme: CompanyTheme): Record<string, string> {
  const vars: Record<string, string> = {}
  
  // Cores
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars[`--color-${key}`] = value
  })
  
  // Fontes
  if (theme.fonts?.sans) {
    vars['--font-sans'] = theme.fonts.sans
  }
  if (theme.fonts?.mono) {
    vars['--font-mono'] = theme.fonts.mono
  }
  
  // Border radius
  const radiusMap = {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  }
  vars['--radius'] = radiusMap[theme.borderRadius || 'lg']
  
  return vars
}

/**
 * Aplica tema ao documento
 */
export function applyTheme(theme: CompanyTheme, element?: HTMLElement) {
  const target = element || document.documentElement
  const vars = generateCSSVariables(theme)
  
  Object.entries(vars).forEach(([key, value]) => {
    target.style.setProperty(key, value)
  })
}

/**
 * Obtém configuração de empresa
 */
export function getCompanyConfig(companyId: string): CompanyConfig {
  return companyPresets[companyId] || companyPresets.default
}

/**
 * Cria configuração customizada de empresa
 */
export function createCompanyConfig(
  config: Partial<CompanyConfig> & { id: string; name: string }
): CompanyConfig {
  return {
    ...companyPresets.default,
    ...config,
    theme: {
      ...defaultTheme,
      ...config.theme,
      colors: {
        ...defaultTheme.colors,
        ...config.theme?.colors,
      },
    },
  }
}
