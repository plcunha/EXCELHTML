/**
 * Web Worker for Excel/CSV parsing
 * Offloads heavy parsing to a separate thread for better UI responsiveness
 */

import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import type { CellValue } from '@/types'

// ============================================
// MESSAGE TYPES
// ============================================

export interface WorkerMessage {
  type: 'parse' | 'progress'
  payload: ParsePayload | ProgressPayload
}

export interface ParsePayload {
  fileData: ArrayBuffer
  fileName: string
  fileType: 'xlsx' | 'xls' | 'csv'
}

export interface ProgressPayload {
  stage: 'reading' | 'parsing' | 'processing' | 'complete'
  progress: number
  message: string
}

export interface WorkerResult {
  type: 'result' | 'error' | 'progress'
  payload: ParseResultPayload | ErrorPayload | ProgressPayload
}

export interface ParseResultPayload {
  headers: string[]
  data: Record<string, CellValue>[]
  rawData: unknown[][]
  errors: string[]
}

export interface ErrorPayload {
  message: string
  stack?: string
}

// ============================================
// WORKER CONTEXT
// ============================================

const ctx: Worker = self as unknown as Worker

/**
 * Send progress update to main thread
 */
function sendProgress(stage: ProgressPayload['stage'], progress: number, message: string): void {
  ctx.postMessage({
    type: 'progress',
    payload: { stage, progress, message }
  } satisfies WorkerResult)
}

/**
 * Parse Excel file (xlsx/xls)
 */
function parseExcel(arrayBuffer: ArrayBuffer): ParseResultPayload {
  sendProgress('parsing', 20, 'Lendo planilha...')
  
  const workbook = XLSX.read(arrayBuffer, { 
    type: 'array',
    cellDates: true,
    cellNF: true,
  })
  
  sendProgress('parsing', 40, 'Convertendo dados...')
  
  // Get first worksheet
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  
  // Convert to JSON
  const rawData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { 
    header: 1,
    defval: null,
    raw: false,
  })
  
  if (rawData.length === 0) {
    return { headers: [], data: [], rawData: [], errors: ['Planilha vazia'] }
  }
  
  sendProgress('processing', 60, 'Processando linhas...')
  
  // Headers are the first row
  const headers = (rawData[0] as string[]).map((h, i) => 
    h?.toString().trim() || `column_${i}`
  )
  
  // Data are the remaining rows
  const totalRows = rawData.length - 1
  const data = rawData.slice(1).map((row, index) => {
    // Send progress for large files
    if (totalRows > 1000 && index % 1000 === 0) {
      const progress = 60 + Math.floor((index / totalRows) * 30)
      sendProgress('processing', progress, `Processando linha ${index + 1} de ${totalRows}...`)
    }
    
    const rowData: Record<string, CellValue> = {}
    headers.forEach((header, i) => {
      rowData[header] = (row as CellValue[])[i] ?? null
    })
    return rowData
  })
  
  sendProgress('complete', 100, 'Concluído!')
  
  return { headers, data, rawData, errors: [] }
}

/**
 * Parse CSV file
 */
function parseCSV(text: string): Promise<ParseResultPayload> {
  return new Promise((resolve) => {
    sendProgress('parsing', 20, 'Analisando CSV...')
    
    Papa.parse<Record<string, CellValue>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      step: undefined, // Could add progress callback here
      complete: (result) => {
        sendProgress('processing', 80, 'Finalizando...')
        
        const headers = result.meta.fields || []
        const data = result.data
        const errors = result.errors.map(e => e.message)
        
        sendProgress('complete', 100, 'Concluído!')
        
        resolve({ 
          headers, 
          data, 
          rawData: result.data as unknown as unknown[][], 
          errors 
        })
      },
      error: (error: Error) => {
        resolve({ 
          headers: [], 
          data: [], 
          rawData: [], 
          errors: [error.message] 
        })
      },
    })
  })
}

// ============================================
// MESSAGE HANDLER
// ============================================

ctx.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data
  
  if (type !== 'parse') {
    return
  }
  
  const { fileData, fileName, fileType } = payload as ParsePayload
  
  try {
    sendProgress('reading', 10, `Carregando ${fileName}...`)
    
    let result: ParseResultPayload
    
    if (fileType === 'csv') {
      // Decode ArrayBuffer to string for CSV
      const decoder = new TextDecoder('utf-8')
      const text = decoder.decode(fileData)
      result = await parseCSV(text)
    } else {
      result = parseExcel(fileData)
    }
    
    ctx.postMessage({
      type: 'result',
      payload: result
    } satisfies WorkerResult)
    
  } catch (error) {
    const errorPayload: ErrorPayload = {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }
    
    ctx.postMessage({
      type: 'error',
      payload: errorPayload
    } satisfies WorkerResult)
  }
})

// Signal that worker is ready
ctx.postMessage({ type: 'ready' })
