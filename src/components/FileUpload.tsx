'use client'

import { useCallback, useState } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { processData } from '@/lib/excel-parser'
import { useAppStore } from '@/lib/store'
import { useExcelWorker, type ParseProgress } from '@/lib/useExcelWorker'

interface FileUploadProps {
  onUploadComplete?: () => void
  className?: string
}

export function FileUpload({ onUploadComplete, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    status: 'idle' | 'processing' | 'success' | 'error'
    message?: string
    fileName?: string
    progress?: number
    stage?: ParseProgress['stage']
  }>({ status: 'idle' })
  
  const { setData, setLoading, setError } = useAppStore()
  
  // Use Web Worker for parsing when available
  const { parseFile, isWorkerSupported } = useExcelWorker({
    onProgress: (progress) => {
      setUploadProgress(prev => ({
        ...prev,
        progress: progress.progress,
        message: progress.message,
        stage: progress.stage
      }))
    }
  })
  
  const processFile = useCallback(async (file: File) => {
    setUploadProgress({ status: 'processing', fileName: file.name, progress: 0 })
    setLoading(true)
    
    try {
      // Validar tipo de arquivo
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ]
      const validExtensions = ['.xlsx', '.xls', '.csv']
      
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      const isValidType = validTypes.includes(file.type) || validExtensions.includes(extension)
      
      if (!isValidType) {
        throw new Error('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv')
      }
      
      // Validar tamanho (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo: 50MB')
      }
      
      // Parse do arquivo usando Web Worker quando disponível
      const parseResult = await parseFile(file)
      
      if (parseResult.errors.length > 0) {
        console.warn('Avisos durante o parse:', parseResult.errors)
      }
      
      if (parseResult.headers.length === 0) {
        throw new Error('Não foi possível ler os dados do arquivo')
      }
      
      // Processar dados
      const processed = processData(parseResult, undefined, {
        sourceFileName: file.name,
      })
      
      setData(processed)
      setUploadProgress({ 
        status: 'success', 
        fileName: file.name,
        message: `${processed.rows.length} linhas carregadas${isWorkerSupported ? ' ⚡' : ''}`,
        progress: 100
      })
      
      onUploadComplete?.()
      
      // Reset status após 3s
      setTimeout(() => {
        setUploadProgress({ status: 'idle' })
      }, 3000)
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao processar arquivo'
      setError(message)
      setUploadProgress({ status: 'error', message })
    } finally {
      setLoading(false)
    }
  }, [setData, setLoading, setError, onUploadComplete, parseFile, isWorkerSupported])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])
  
  return (
    <div className={cn('w-full', className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-describedby="upload-instructions"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            document.getElementById('file-upload-input')?.click()
          }
        }}
        className={cn(
          'relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 transition-all duration-300',
          'flex flex-col items-center justify-center text-center',
          'cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/20',
          isDragging && 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 scale-[1.02]',
          uploadProgress.status === 'processing' && 'pointer-events-none opacity-70',
          uploadProgress.status === 'success' && 'border-green-500 bg-green-50 dark:bg-green-900/20',
          uploadProgress.status === 'error' && 'border-red-500 bg-red-50 dark:bg-red-900/20',
        )}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploadProgress.status === 'processing'}
          aria-label="Selecionar arquivo Excel ou CSV para upload"
          id="file-upload-input"
        />
        
        {/* Ícone e texto */}
        <div className="flex flex-col items-center gap-4">
          {uploadProgress.status === 'idle' && (
            <>
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                'bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40',
                'transition-transform duration-300',
                isDragging && 'scale-110',
              )}>
                <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Arraste seu arquivo aqui
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ou clique para selecionar
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <FileSpreadsheet className="w-4 h-4" />
                <span id="upload-instructions">Suporta: XLSX, XLS, CSV (máx. 50MB)</span>
              </div>
            </>
          )}
          
          {uploadProgress.status === 'processing' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/40 animate-pulse">
                <FileSpreadsheet className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="w-full max-w-xs">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2">
                  Processando...
                  {isWorkerSupported && (
                    <span className="inline-flex items-center gap-1 text-xs font-normal text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
                      <Zap className="w-3 h-3" />
                      Worker
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {uploadProgress.message || uploadProgress.fileName}
                </p>
                {/* Progress bar */}
                {typeof uploadProgress.progress === 'number' && (
                  <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-500 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
          
          {uploadProgress.status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/40">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                  Upload concluído!
                </p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  {uploadProgress.message}
                </p>
              </div>
            </>
          )}
          
          {uploadProgress.status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/40">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-red-700 dark:text-red-400">
                  Erro no upload
                </p>
                <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                  {uploadProgress.message}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
