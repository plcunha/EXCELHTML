import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import type { 
  DataRow, 
  DataSchema, 
  ColumnDefinition, 
  ColumnType,
  ProcessedData,
  CellValue
} from '@/types'

// ============================================
// PARSER DE ARQUIVOS
// ============================================

export interface ParseResult {
  headers: string[]
  data: Record<string, CellValue>[]
  rawData: unknown[][]
  errors: string[]
}

/**
 * Detecta o tipo de arquivo baseado na extensão ou magic bytes
 */
function detectFileType(file: File): 'xlsx' | 'xls' | 'csv' | 'unknown' {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  if (extension === 'xlsx' || extension === 'xls') {
    return extension
  }
  
  if (extension === 'csv' || file.type === 'text/csv') {
    return 'csv'
  }
  
  return 'unknown'
}

/**
 * Parseia arquivo Excel (xlsx/xls)
 */
async function parseExcel(file: File): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { 
    type: 'array',
    cellDates: true,
    cellNF: true,
  })
  
  // Pega a primeira planilha
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  
  // Converte para JSON
  const rawData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { 
    header: 1,
    defval: null,
    raw: false,
  })
  
  if (rawData.length === 0) {
    return { headers: [], data: [], rawData: [], errors: ['Planilha vazia'] }
  }
  
  // Headers são a primeira linha
  const headers = (rawData[0] as string[]).map((h, i) => 
    h?.toString().trim() || `column_${i}`
  )
  
  // Dados são as linhas restantes
  const data = rawData.slice(1).map((row) => {
    const rowData: Record<string, CellValue> = {}
    headers.forEach((header, i) => {
      rowData[header] = (row as CellValue[])[i] ?? null
    })
    return rowData
  })
  
  return { headers, data, rawData, errors: [] }
}

/**
 * Parseia arquivo CSV
 */
async function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => {
        const headers = result.meta.fields || []
        const data = result.data as Record<string, CellValue>[]
        const errors = result.errors.map(e => e.message)
        
        resolve({ 
          headers, 
          data, 
          rawData: result.data as unknown[][], 
          errors 
        })
      },
      error: (error) => {
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

/**
 * Parse genérico de arquivo
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const fileType = detectFileType(file)
  
  switch (fileType) {
    case 'xlsx':
    case 'xls':
      return parseExcel(file)
    case 'csv':
      return parseCSV(file)
    default:
      return { 
        headers: [], 
        data: [], 
        rawData: [], 
        errors: [`Tipo de arquivo não suportado: ${file.name}`] 
      }
  }
}

// ============================================
// INFERÊNCIA DE TIPOS
// ============================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_REGEX = /^https?:\/\/[^\s]+$/
const PHONE_REGEX = /^[\d\s()+-]{8,}$/
const DATE_REGEX = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/
const CURRENCY_REGEX = /^[R$€£¥]\s?[\d.,]+$|^[\d.,]+\s?[R$€£¥]$/
const PERCENTAGE_REGEX = /^[\d.,]+\s?%$/

/**
 * Infere o tipo de uma coluna baseado nos valores
 */
function inferColumnType(values: CellValue[]): ColumnType {
  // Remove valores nulos/undefined
  const nonNullValues = values.filter(v => v != null && v !== '')
  
  if (nonNullValues.length === 0) return 'string'
  
  // Contadores para cada tipo
  const typeCounts: Record<ColumnType, number> = {
    string: 0,
    number: 0,
    currency: 0,
    percentage: 0,
    date: 0,
    datetime: 0,
    boolean: 0,
    email: 0,
    url: 0,
    phone: 0,
    image: 0,
    badge: 0,
    progress: 0,
  }
  
  for (const value of nonNullValues) {
    const strValue = String(value).trim()
    
    // Boolean
    if (typeof value === 'boolean' || 
        ['true', 'false', 'sim', 'não', 'yes', 'no', '0', '1'].includes(strValue.toLowerCase())) {
      typeCounts.boolean++
      continue
    }
    
    // Date object
    if (value instanceof Date) {
      typeCounts.date++
      continue
    }
    
    // Email
    if (EMAIL_REGEX.test(strValue)) {
      typeCounts.email++
      continue
    }
    
    // URL / Image
    if (URL_REGEX.test(strValue)) {
      if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(strValue)) {
        typeCounts.image++
      } else {
        typeCounts.url++
      }
      continue
    }
    
    // Phone
    if (PHONE_REGEX.test(strValue) && !(/[a-zA-Z]/.test(strValue))) {
      typeCounts.phone++
      continue
    }
    
    // Currency
    if (CURRENCY_REGEX.test(strValue)) {
      typeCounts.currency++
      continue
    }
    
    // Percentage
    if (PERCENTAGE_REGEX.test(strValue)) {
      typeCounts.percentage++
      continue
    }
    
    // Date string
    if (DATE_REGEX.test(strValue)) {
      typeCounts.date++
      continue
    }
    
    // Number
    const numValue = parseFloat(strValue.replace(/[,\s]/g, ''))
    if (!isNaN(numValue) && typeof value === 'number') {
      // Progress (0-100)
      if (numValue >= 0 && numValue <= 100) {
        typeCounts.progress++
      }
      typeCounts.number++
      continue
    }
    
    // Default: string
    typeCounts.string++
  }
  
  // Retorna o tipo mais frequente (com precedência para tipos específicos)
  const total = nonNullValues.length
  const threshold = 0.7 // 70% dos valores devem ser do mesmo tipo
  
  // Ordem de prioridade
  const priorityOrder: ColumnType[] = [
    'email', 'url', 'image', 'phone', 'currency', 'percentage', 
    'date', 'datetime', 'boolean', 'progress', 'number', 'badge', 'string'
  ]
  
  for (const type of priorityOrder) {
    if (typeCounts[type] / total >= threshold) {
      return type
    }
  }
  
  // Se nenhum tipo atingir o threshold, verifica se é badge (poucos valores únicos)
  const uniqueValues = new Set(nonNullValues.map(v => String(v).toLowerCase()))
  if (uniqueValues.size <= 10 && uniqueValues.size > 0) {
    return 'badge'
  }
  
  return 'string'
}

/**
 * Gera cores automáticas para badges
 */
function generateBadgeColors(values: CellValue[]): Record<string, { bg: string; text: string }> {
  const uniqueValues = [...new Set(values.filter(v => v != null).map(v => String(v)))]
  
  const colorPalette = [
    { bg: '#dbeafe', text: '#1e40af' }, // blue
    { bg: '#dcfce7', text: '#166534' }, // green
    { bg: '#fef3c7', text: '#92400e' }, // yellow
    { bg: '#fce7f3', text: '#9d174d' }, // pink
    { bg: '#e0e7ff', text: '#3730a3' }, // indigo
    { bg: '#ccfbf1', text: '#115e59' }, // teal
    { bg: '#fed7aa', text: '#9a3412' }, // orange
    { bg: '#f3e8ff', text: '#6b21a8' }, // purple
    { bg: '#fecaca', text: '#991b1b' }, // red
    { bg: '#e5e7eb', text: '#374151' }, // gray
  ]
  
  const colors: Record<string, { bg: string; text: string }> = {}
  uniqueValues.forEach((value, index) => {
    colors[value] = colorPalette[index % colorPalette.length]
  })
  
  return colors
}

/**
 * Gera schema automaticamente baseado nos dados
 */
export function generateSchemaFromData(
  headers: string[],
  data: Record<string, CellValue>[],
  options?: {
    schemaId?: string
    schemaName?: string
  }
): DataSchema {
  const columns: ColumnDefinition[] = headers.map((header) => {
    const values = data.map(row => row[header])
    const inferredType = inferColumnType(values)
    
    const column: ColumnDefinition = {
      key: header,
      label: formatLabel(header),
      format: { type: inferredType },
      sortable: true,
      filterable: true,
      searchable: inferredType === 'string' || inferredType === 'email',
    }
    
    // Configurações específicas por tipo
    switch (inferredType) {
      case 'currency':
        column.format.currency = 'BRL'
        column.format.locale = 'pt-BR'
        column.align = 'right'
        break
      case 'number':
      case 'percentage':
      case 'progress':
        column.align = 'right'
        column.format.decimals = 2
        break
      case 'date':
        column.format.dateFormat = 'dd/MM/yyyy'
        column.align = 'center'
        break
      case 'datetime':
        column.format.dateFormat = 'dd/MM/yyyy HH:mm'
        column.align = 'center'
        break
      case 'badge':
        column.format.badgeColors = generateBadgeColors(values)
        column.align = 'center'
        break
      case 'boolean':
        column.align = 'center'
        break
    }
    
    return column
  })
  
  return {
    id: options?.schemaId || generateId(),
    name: options?.schemaName || 'Dados Importados',
    columns,
    features: {
      export: true,
      print: true,
      charts: true,
      pagination: true,
      search: true,
      filters: true,
      columnToggle: true,
    },
  }
}

// ============================================
// PROCESSAMENTO DE DADOS
// ============================================

/**
 * Processa dados brutos em formato estruturado
 */
export function processData(
  parseResult: ParseResult,
  schema?: DataSchema,
  options?: {
    schemaId?: string
    schemaName?: string
    sourceFileName?: string
  }
): ProcessedData {
  const { headers, data } = parseResult
  
  // Gera ou usa schema existente
  const finalSchema = schema || generateSchemaFromData(headers, data, options)
  
  // Processa cada linha
  const rows: DataRow[] = data.map((row, index) => {
    const processedRow: DataRow = {
      _id: generateId(),
      _rowIndex: index,
    }
    
    finalSchema.columns.forEach((column) => {
      const value = row[column.key]
      processedRow[column.key] = normalizeValue(value, column.format.type)
    })
    
    return processedRow
  })
  
  return {
    schema: finalSchema,
    rows,
    metadata: {
      totalRows: rows.length,
      processedAt: new Date(),
      sourceFileName: options?.sourceFileName,
      warnings: parseResult.errors.length > 0 ? parseResult.errors : undefined,
    },
  }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Formata header em label legível
 */
function formatLabel(header: string): string {
  return header
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\s+/, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()
}

/**
 * Gera ID único
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Normaliza valor para o tipo esperado
 */
function normalizeValue(value: CellValue, type: ColumnType): CellValue {
  if (value == null) return null
  
  switch (type) {
    case 'number':
    case 'currency':
    case 'percentage':
    case 'progress':
      const strValue = String(value).replace(/[R$%,\s]/g, '').replace(',', '.')
      const numValue = parseFloat(strValue)
      return isNaN(numValue) ? null : numValue
      
    case 'boolean':
      if (typeof value === 'boolean') return value
      const boolStr = String(value).toLowerCase()
      return ['true', 'sim', 'yes', '1', 's'].includes(boolStr)
      
    case 'date':
    case 'datetime':
      if (value instanceof Date) return value
      const dateValue = new Date(String(value))
      return isNaN(dateValue.getTime()) ? null : dateValue
      
    default:
      return String(value)
  }
}

/**
 * Exporta dados para diferentes formatos
 */
export function exportData(
  data: ProcessedData,
  format: 'xlsx' | 'csv' | 'json'
): Blob {
  const rows = data.rows.map(row => {
    const cleanRow: Record<string, CellValue> = {}
    data.schema.columns.forEach(col => {
      cleanRow[col.label] = row[col.key]
    })
    return cleanRow
  })
  
  switch (format) {
    case 'xlsx': {
      const worksheet = XLSX.utils.json_to_sheet(rows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, data.schema.name)
      const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
      return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    }
    
    case 'csv': {
      const csv = Papa.unparse(rows)
      return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    }
    
    case 'json': {
      return new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
    }
  }
}
