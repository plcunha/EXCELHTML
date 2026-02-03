'use client'

import { cn } from '@/lib/utils'

// ============================================
// TIPOS
// ============================================

interface SkeletonProps {
  /** Classes CSS adicionais */
  className?: string
  /** Largura do skeleton */
  width?: string | number
  /** Altura do skeleton */
  height?: string | number
  /** Formato arredondado */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  /** Animação */
  animation?: 'pulse' | 'shimmer' | 'none'
  /** Estilos inline adicionais */
  style?: React.CSSProperties
}

interface SkeletonTextProps extends SkeletonProps {
  /** Número de linhas */
  lines?: number
  /** Última linha menor (simula parágrafo) */
  lastLineWidth?: string
}

interface SkeletonTableProps {
  /** Número de linhas */
  rows?: number
  /** Número de colunas */
  columns?: number
  /** Mostrar header */
  showHeader?: boolean
  /** Classes CSS adicionais */
  className?: string
}

interface SkeletonCardProps {
  /** Mostrar imagem no topo */
  showImage?: boolean
  /** Número de linhas de texto */
  textLines?: number
  /** Mostrar ações no rodapé */
  showActions?: boolean
  /** Classes CSS adicionais */
  className?: string
}

// ============================================
// COMPONENTE BASE SKELETON
// ============================================

/**
 * Componente base de Skeleton para loading states
 * 
 * @example
 * ```tsx
 * <Skeleton width={200} height={20} />
 * <Skeleton className="w-full h-10" rounded="lg" />
 * ```
 */
export function Skeleton({
  className,
  width,
  height,
  rounded = 'md',
  animation = 'pulse',
  style: styleProp,
}: SkeletonProps) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]',
    none: '',
  }

  const style: React.CSSProperties = { ...styleProp }
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        roundedClasses[rounded],
        animationClasses[animation],
        className
      )}
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  )
}

// ============================================
// SKELETON TEXT
// ============================================

/**
 * Skeleton para texto com múltiplas linhas
 * 
 * @example
 * ```tsx
 * <SkeletonText lines={3} />
 * <SkeletonText lines={4} lastLineWidth="60%" />
 * ```
 */
export function SkeletonText({
  lines = 3,
  lastLineWidth = '75%',
  className,
  ...props
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          className={cn(
            'w-full',
            index === lines - 1 && lastLineWidth && `w-[${lastLineWidth}]`
          )}
          style={index === lines - 1 ? { width: lastLineWidth } : undefined}
          {...props}
        />
      ))}
    </div>
  )
}

// ============================================
// SKELETON TABLE
// ============================================

/**
 * Skeleton para tabela de dados
 * 
 * @example
 * ```tsx
 * <SkeletonTable rows={5} columns={4} showHeader />
 * ```
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={`header-${index}`}
              height={20}
              className="flex-1"
              rounded="sm"
            />
          ))}
        </div>
      )}

      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                height={16}
                className="flex-1"
                rounded="sm"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// SKELETON CARD
// ============================================

/**
 * Skeleton para cards
 * 
 * @example
 * ```tsx
 * <SkeletonCard showImage textLines={2} showActions />
 * ```
 */
export function SkeletonCard({
  showImage = true,
  textLines = 3,
  showActions = false,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
    >
      {/* Image */}
      {showImage && (
        <Skeleton height={160} className="w-full" rounded="none" />
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton height={24} className="w-3/4" />
        
        {/* Text */}
        <SkeletonText lines={textLines} />

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Skeleton height={36} className="w-20" rounded="md" />
            <Skeleton height={36} className="w-20" rounded="md" />
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// SKELETON AVATAR
// ============================================

/**
 * Skeleton para avatar
 * 
 * @example
 * ```tsx
 * <SkeletonAvatar size={48} />
 * ```
 */
export function SkeletonAvatar({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      rounded="full"
      className={className}
    />
  )
}

// ============================================
// SKELETON UPLOAD
// ============================================

/**
 * Skeleton para área de upload
 * 
 * @example
 * ```tsx
 * <SkeletonUpload />
 * ```
 */
export function SkeletonUpload({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Skeleton width={64} height={64} rounded="lg" />
        <div className="text-center space-y-2">
          <Skeleton width={200} height={20} />
          <Skeleton width={160} height={16} />
        </div>
      </div>
    </div>
  )
}

// ============================================
// SKELETON TOOLBAR
// ============================================

/**
 * Skeleton para toolbar/header
 * 
 * @example
 * ```tsx
 * <SkeletonToolbar />
 * ```
 */
export function SkeletonToolbar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Skeleton width={200} height={36} rounded="md" />
        <Skeleton width={100} height={36} rounded="md" />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Skeleton width={36} height={36} rounded="md" />
        <Skeleton width={36} height={36} rounded="md" />
        <Skeleton width={36} height={36} rounded="md" />
      </div>
    </div>
  )
}

// ============================================
// SKELETON CHART
// ============================================

/**
 * Skeleton para área de gráficos
 * 
 * @example
 * ```tsx
 * <SkeletonChart />
 * ```
 */
export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn('p-4', className)}>
      <div className="flex items-end justify-between gap-2 h-48">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton
            key={index}
            className="flex-1"
            style={{ height: `${30 + Math.random() * 70}%` }}
            rounded="sm"
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4">
        <Skeleton width={80} height={16} rounded="sm" />
        <Skeleton width={80} height={16} rounded="sm" />
        <Skeleton width={80} height={16} rounded="sm" />
      </div>
    </div>
  )
}

// ============================================
// SKELETON PAGE (FULL PAGE LOADING)
// ============================================

/**
 * Skeleton para página completa
 * 
 * @example
 * ```tsx
 * <SkeletonPage />
 * ```
 */
export function SkeletonPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Skeleton width={150} height={32} />
          <div className="flex gap-2">
            <Skeleton width={36} height={36} rounded="md" />
            <Skeleton width={36} height={36} rounded="md" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        <SkeletonToolbar />
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <SkeletonTable rows={10} columns={5} />
        </div>
      </div>
    </div>
  )
}

export default Skeleton
