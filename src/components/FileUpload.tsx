'use client'

import { useCallback, useState } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseFile, processData } from '@/lib/excel-parser'
import { useAppStore } from '@/lib/store'

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
  }>({ status: 'idle' })
  
  const { setData, setLoading, setError } = useAppStore()
  
  const processFile = useCallback(async (file: File) => {
    setUploadProgress({ status: 'processing', fileName: file.name })
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
      
      // Parse do arquivo
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
        message: `${processed.rows.length} linhas carregadas` 
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
  }, [setData, setLoading, setError, onUploadComplete])
  
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
          'relative border-2 border-dashed rounded-xl p-8 transition-all duration-300',
          'flex flex-col items-center justify-center text-center',
          'cursor-pointer hover:border-primary-500 hover:bg-primary-50/50',
          isDragging && 'border-primary-500 bg-primary-50 scale-[1.02]',
          uploadProgress.status === 'processing' && 'pointer-events-none opacity-70',
          uploadProgress.status === 'success' && 'border-green-500 bg-green-50',
          uploadProgress.status === 'error' && 'border-red-500 bg-red-50',
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
                'bg-gradient-to-br from-primary-100 to-primary-200',
                'transition-transform duration-300',
                isDragging && 'scale-110',
              )}>
                <Upload className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  Arraste seu arquivo aqui
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ou clique para selecionar
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <FileSpreadsheet className="w-4 h-4" />
                <span id="upload-instructions">Suporta: XLSX, XLS, CSV (máx. 50MB)</span>
              </div>
            </>
          )}
          
          {uploadProgress.status === 'processing' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary-100 animate-pulse">
                <FileSpreadsheet className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  Processando...
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {uploadProgress.fileName}
                </p>
              </div>
            </>
          )}
          
          {uploadProgress.status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-green-700">
                  Upload concluído!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {uploadProgress.message}
                </p>
              </div>
            </>
          )}
          
          {uploadProgress.status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-100">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-red-700">
                  Erro no upload
                </p>
                <p className="text-sm text-red-600 mt-1">
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
