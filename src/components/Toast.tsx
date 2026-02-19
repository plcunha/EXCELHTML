'use client'

import { useEffect, useCallback, useRef } from 'react'
import { create } from 'zustand'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TOAST_DURATION_MS } from '@/lib/constants'

// ============================================
// TOAST TYPES
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration: number
  createdAt: number
}

// ============================================
// TOAST STORE
// ============================================

interface ToastStore {
  toasts: ToastItem[]
  addToast: (type: ToastType, message: string, duration?: number) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  
  addToast: (type, message, duration = TOAST_DURATION_MS) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const toast: ToastItem = { id, type, message, duration, createdAt: Date.now() }
    
    set((state) => ({
      toasts: [...state.toasts, toast].slice(-5), // max 5 toasts
    }))
    
    return id
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
  
  clearToasts: () => set({ toasts: [] }),
}))

// ============================================
// CONVENIENCE HOOK
// ============================================

export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastStore()
  
  return {
    success: (message: string, duration?: number) => addToast('success', message, duration),
    error: (message: string, duration?: number) => addToast('error', message, duration),
    warning: (message: string, duration?: number) => addToast('warning', message, duration),
    info: (message: string, duration?: number) => addToast('info', message, duration),
    remove: removeToast,
    clear: clearToasts,
  }
}

// ============================================
// TOAST ITEM COMPONENT
// ============================================

const toastConfig: Record<ToastType, { icon: typeof CheckCircle2; bg: string; border: string; text: string; progress: string }> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    progress: 'bg-green-500',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    progress: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    progress: 'bg-amber-500',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    progress: 'bg-blue-500',
  },
}

function ToastItemComponent({ toast }: { toast: ToastItem }) {
  const { removeToast } = useToastStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const handleClose = useCallback(() => {
    removeToast(toast.id)
  }, [removeToast, toast.id])
  
  useEffect(() => {
    timerRef.current = setTimeout(handleClose, toast.duration)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [handleClose, toast.duration])
  
  const config = toastConfig[toast.type]
  const Icon = config.icon
  
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
        'animate-slide-in-right min-w-[320px] max-w-[420px]',
        config.bg, config.border
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.text)} aria-hidden="true" />
      <p className={cn('text-sm flex-1', config.text)}>{toast.message}</p>
      <button
        onClick={handleClose}
        className={cn(
          'flex-shrink-0 p-1 rounded-md transition-colors',
          'hover:bg-black/5 dark:hover:bg-white/10',
          config.text
        )}
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden">
        <div
          className={cn('h-full', config.progress)}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  )
}

// ============================================
// TOAST CONTAINER
// ============================================

export function ToastContainer() {
  const { toasts } = useToastStore()
  
  if (toasts.length === 0) return null
  
  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex flex-col-reverse gap-2 pointer-events-none"
      aria-label="Notificações"
      role="region"
    >
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto relative">
          <ToastItemComponent toast={toast} />
        </div>
      ))}
    </div>
  )
}
