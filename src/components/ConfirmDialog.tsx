'use client'

import { useEffect, useRef, useCallback } from 'react'
import { AlertTriangle, HelpCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODAL_Z_INDEX } from '@/lib/constants'

// ============================================
// TYPES
// ============================================

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

// ============================================
// CONFIRM DIALOG COMPONENT
// ============================================

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  
  // Focus trap: focus confirm button when dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the element is rendered
      const timer = setTimeout(() => {
        confirmRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open])
  
  // Close on Escape
  useEffect(() => {
    if (!open) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onCancel()
      }
      
      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [open, onCancel])
  
  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])
  
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }, [onCancel])
  
  if (!open) return null
  
  const isDanger = variant === 'danger'
  
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      style={{ zIndex: MODAL_Z_INDEX + 10 }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        ref={dialogRef}
        className={cn(
          'bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-sm w-full mx-4',
          'border border-gray-200 dark:border-gray-800',
          'animate-scale-in'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 px-6 pt-6 pb-2">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
            isDanger
              ? 'bg-red-100 dark:bg-red-900/30'
              : 'bg-blue-100 dark:bg-blue-900/30'
          )}>
            {isDanger ? (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            ) : (
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="confirm-dialog-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {title}
            </h2>
            <p
              id="confirm-dialog-message"
              className="mt-1 text-sm text-gray-600 dark:text-gray-400"
            >
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button
            onClick={onCancel}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800',
              'hover:bg-gray-200 dark:hover:bg-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-gray-400/50'
            )}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'focus:outline-none focus:ring-2',
              isDanger
                ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500/50'
                : 'text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500/50'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
