'use client'

import { ErrorBoundary } from '@/components'

/**
 * Client-side providers wrapper for the application.
 * Wraps the entire app with a critical-level ErrorBoundary.
 * 
 * This component exists because layout.tsx is a Server Component
 * and cannot directly use client-side ErrorBoundary as a wrapper.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary level="critical">
      {children}
    </ErrorBoundary>
  )
}
