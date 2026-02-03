'use client'

import React, { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

// ============================================
// TIPOS
// ============================================

interface ErrorBoundaryProps {
  /** Componentes filhos */
  children: ReactNode
  /** Componente de fallback customizado */
  fallback?: ReactNode
  /** Callback quando ocorre um erro */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Nível do erro (afeta o estilo) */
  level?: 'page' | 'component' | 'critical'
  /** Mostrar detalhes técnicos (apenas em dev) */
  showDetails?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================

/**
 * Componente de Error Boundary para capturar erros React
 * 
 * @example
 * ```tsx
 * <ErrorBoundary level="page" onError={logError}>
 *   <MeuComponente />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })
    
    // Callback opcional para logging
    this.props.onError?.(error, errorInfo)
    
    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error)
      console.error('Component stack:', errorInfo.componentStack)
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleGoHome = (): void => {
    window.location.href = '/'
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback, level = 'component', showDetails } = this.props

    if (!hasError) {
      return children
    }

    // Fallback customizado
    if (fallback) {
      return fallback
    }

    // Fallback padrão baseado no nível
    return (
      <ErrorFallback
        error={error}
        errorInfo={errorInfo}
        level={level}
        showDetails={showDetails ?? process.env.NODE_ENV === 'development'}
        onReset={this.handleReset}
        onReload={this.handleReload}
        onGoHome={this.handleGoHome}
      />
    )
  }
}

// ============================================
// ERROR FALLBACK COMPONENT
// ============================================

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  level: 'page' | 'component' | 'critical'
  showDetails: boolean
  onReset: () => void
  onReload: () => void
  onGoHome: () => void
}

function ErrorFallback({
  error,
  errorInfo,
  level,
  showDetails,
  onReset,
  onReload,
  onGoHome,
}: ErrorFallbackProps) {
  const isPage = level === 'page' || level === 'critical'
  const isCritical = level === 'critical'

  const containerClasses = isPage
    ? 'min-h-screen flex items-center justify-center p-4'
    : 'w-full p-4'

  const cardClasses = isCritical
    ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
    : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'

  const iconClasses = isCritical
    ? 'text-red-500'
    : 'text-yellow-500'

  return (
    <div className={containerClasses}>
      <div
        className={`
          max-w-lg w-full rounded-lg border-2 p-6 shadow-lg
          ${cardClasses}
        `}
        role="alert"
        aria-live="assertive"
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full bg-white dark:bg-gray-800 shadow ${iconClasses}`}>
            {isCritical ? (
              <Bug className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isCritical ? 'Erro Crítico' : 'Algo deu errado'}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {isCritical
                ? 'A aplicação encontrou um erro inesperado e precisa ser recarregada.'
                : 'Ocorreu um erro neste componente. Tente novamente ou recarregue a página.'}
            </p>
          </div>
        </div>

        {/* Detalhes do Erro (apenas em dev) */}
        {showDetails && error && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
              Detalhes técnicos
            </summary>
            <div className="mt-2 space-y-2">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-auto max-h-40">
                <p className="font-bold text-red-600 dark:text-red-400">
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <pre className="mt-2 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
              
              {errorInfo?.componentStack && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-auto max-h-40">
                  <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Component Stack:
                  </p>
                  <pre className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Ações */}
        <div className="mt-6 flex flex-wrap gap-3">
          {!isCritical && (
            <button
              onClick={onReset}
              className="
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium rounded-md
                bg-white dark:bg-gray-800 
                text-gray-700 dark:text-gray-300
                border border-gray-300 dark:border-gray-600
                hover:bg-gray-50 dark:hover:bg-gray-700
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-colors
              "
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </button>
          )}
          
          <button
            onClick={onReload}
            className="
              inline-flex items-center gap-2 px-4 py-2 
              text-sm font-medium rounded-md
              bg-blue-600 hover:bg-blue-700
              text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-colors
            "
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar Página
          </button>

          {isPage && (
            <button
              onClick={onGoHome}
              className="
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium rounded-md
                bg-gray-600 hover:bg-gray-700
                text-white
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                transition-colors
              "
            >
              <Home className="w-4 h-4" />
              Ir para Início
            </button>
          )}
        </div>

        {/* Dica */}
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Se o problema persistir, tente limpar o cache do navegador ou entre em contato com o suporte.
        </p>
      </div>
    </div>
  )
}

// ============================================
// HOOK PARA RESET EXTERNO
// ============================================

/**
 * Wrapper funcional para ErrorBoundary com key de reset
 * 
 * @example
 * ```tsx
 * const [resetKey, setResetKey] = useState(0)
 * 
 * <ErrorBoundaryWithReset resetKey={resetKey}>
 *   <MeuComponente />
 * </ErrorBoundaryWithReset>
 * 
 * // Para forçar reset:
 * setResetKey(prev => prev + 1)
 * ```
 */
export function ErrorBoundaryWithReset({
  children,
  resetKey,
  ...props
}: ErrorBoundaryProps & { resetKey?: number }) {
  return (
    <ErrorBoundary key={resetKey} {...props}>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary
