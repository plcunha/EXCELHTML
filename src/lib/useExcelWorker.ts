'use client'

import { useCallback, useRef, useState } from 'react'
import type { CellValue } from '@/types'

// ============================================
// TYPES (shared with worker)
// ============================================

export interface ParseProgress {
  stage: 'reading' | 'parsing' | 'processing' | 'complete'
  progress: number
  message: string
}

export interface ParseResultPayload {
  headers: string[]
  data: Record<string, CellValue>[]
  rawData: unknown[][]
  errors: string[]
}

// ============================================
// WORKER HOOK
// ============================================

interface UseExcelWorkerOptions {
  onProgress?: (progress: ParseProgress) => void
}

interface UseExcelWorkerReturn {
  parseFile: (file: File) => Promise<ParseResultPayload>
  isWorkerSupported: boolean
  isLoading: boolean
  progress: ParseProgress | null
  error: string | null
}

/**
 * Hook for parsing Excel/CSV files using a Web Worker
 * Falls back to main thread parsing if workers are not supported
 */
export function useExcelWorker(options: UseExcelWorkerOptions = {}): UseExcelWorkerReturn {
  const { onProgress } = options
  const workerRef = useRef<Worker | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<ParseProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Check if workers are supported
  const isWorkerSupported = typeof Worker !== 'undefined'
  
  /**
   * Detect file type from filename
   */
  const detectFileType = useCallback((fileName: string): 'xlsx' | 'xls' | 'csv' | 'unknown' => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (extension === 'xlsx') return 'xlsx'
    if (extension === 'xls') return 'xls'
    if (extension === 'csv') return 'csv'
    return 'unknown'
  }, [])
  
  /**
   * Parse file using Web Worker
   */
  const parseWithWorker = useCallback((file: File): Promise<ParseResultPayload> => {
    return new Promise((resolve, reject) => {
      // Create worker
      const worker = new Worker(
        new URL('./excel-worker.ts', import.meta.url),
        { type: 'module' }
      )
      workerRef.current = worker
      
      // Handle messages from worker
      worker.onmessage = (event) => {
        const { type, payload } = event.data
        
        switch (type) {
          case 'ready':
            // Worker is ready, now we can send the file
            break
            
          case 'progress':
            const progressData = payload as ParseProgress
            setProgress(progressData)
            onProgress?.(progressData)
            break
            
          case 'result':
            setIsLoading(false)
            setProgress(null)
            worker.terminate()
            workerRef.current = null
            resolve(payload as ParseResultPayload)
            break
            
          case 'error':
            setIsLoading(false)
            setError(payload.message)
            worker.terminate()
            workerRef.current = null
            reject(new Error(payload.message))
            break
        }
      }
      
      // Handle worker errors
      worker.onerror = (event) => {
        setIsLoading(false)
        setError(event.message)
        worker.terminate()
        workerRef.current = null
        reject(new Error(event.message))
      }
      
      // Read file and send to worker
      file.arrayBuffer().then((arrayBuffer) => {
        const fileType = detectFileType(file.name)
        
        if (fileType === 'unknown') {
          setIsLoading(false)
          reject(new Error(`Tipo de arquivo não suportado: ${file.name}`))
          return
        }
        
        worker.postMessage({
          type: 'parse',
          payload: {
            fileData: arrayBuffer,
            fileName: file.name,
            fileType
          }
        }, [arrayBuffer]) // Transfer ownership for performance
      })
    })
  }, [detectFileType, onProgress])
  
  /**
   * Fallback: Parse file on main thread
   */
  const parseWithoutWorker = useCallback(async (file: File): Promise<ParseResultPayload> => {
    // Dynamically import the parser
    const { parseFile } = await import('./excel-parser')
    
    setProgress({
      stage: 'parsing',
      progress: 50,
      message: 'Processando...'
    })
    
    const result = await parseFile(file)
    
    setProgress({
      stage: 'complete',
      progress: 100,
      message: 'Concluído!'
    })
    
    return result
  }, [])
  
  /**
   * Main parse function - uses worker if available
   */
  const parseFile = useCallback(async (file: File): Promise<ParseResultPayload> => {
    setIsLoading(true)
    setError(null)
    setProgress({
      stage: 'reading',
      progress: 0,
      message: 'Iniciando...'
    })
    
    try {
      if (isWorkerSupported) {
        return await parseWithWorker(file)
      } else {
        return await parseWithoutWorker(file)
      }
    } catch (err) {
      setIsLoading(false)
      const message = err instanceof Error ? err.message : 'Erro ao processar arquivo'
      setError(message)
      throw err
    }
  }, [isWorkerSupported, parseWithWorker, parseWithoutWorker])
  
  return {
    parseFile,
    isWorkerSupported,
    isLoading,
    progress,
    error
  }
}
