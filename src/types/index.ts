import { z } from 'zod'

// ============================================
// TIPOS BASE DO SISTEMA
// ============================================

/**
 * Tipos de dados suportados para colunas
 */
export type ColumnType = 
  | 'string' 
  | 'number' 
  | 'currency' 
  | 'percentage' 
  | 'date' 
  | 'datetime'
  | 'boolean'
  | 'email'
  | 'url'
  | 'phone'
  | 'image'
  | 'badge'
  | 'progress'

/**
 * Configuração de formatação para uma coluna
 */
export interface ColumnFormat {
  type: ColumnType
  locale?: string
  currency?: string
  decimals?: number
  dateFormat?: string
  prefix?: string
  suffix?: string
  badgeColors?: Record<string, { bg: string; text: string }>
}

/**
 * Definição de uma coluna no schema
 */
export interface ColumnDefinition {
  key: string
  label: string
  format: ColumnFormat
  sortable?: boolean
  filterable?: boolean
  searchable?: boolean
  hidden?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  sticky?: 'left' | 'right'
}

/**
 * Schema completo para um tipo de dados/planilha
 */
export interface DataSchema {
  id: string
  name: string
  description?: string
  columns: ColumnDefinition[]
  primaryKey?: string
  defaultSort?: {
    column: string
    direction: 'asc' | 'desc'
  }
  groupBy?: string[]
  features?: {
    export?: boolean
    print?: boolean
    charts?: boolean
    pagination?: boolean
    search?: boolean
    filters?: boolean
    columnToggle?: boolean
  }
}

// ============================================
// CONFIGURAÇÃO DE EMPRESA/TEMA
// ============================================

export interface CompanyTheme {
  colors: {
    primary: string
    primaryDark: string
    primaryLight: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    success: string
    warning: string
    error: string
    info: string
  }
  fonts?: {
    sans?: string
    mono?: string
  }
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadows?: 'none' | 'soft' | 'medium' | 'strong'
}

export interface CompanyConfig {
  id: string
  name: string
  logo?: string
  logoLight?: string // Para dark mode
  theme: CompanyTheme
  defaultLocale?: string
  dateFormat?: string
  currencyCode?: string
}

// ============================================
// DADOS PROCESSADOS
// ============================================

export type CellValue = string | number | boolean | Date | null | undefined

export interface DataRow {
  _id: string // ID único gerado internamente
  _rowIndex: number
  [key: string]: CellValue | number | string
}

export interface ProcessedData {
  schema: DataSchema
  rows: DataRow[]
  metadata: {
    totalRows: number
    processedAt: Date
    sourceFileName?: string
    warnings?: string[]
  }
}

// ============================================
// ESTADO DA TABELA
// ============================================

export interface SortState {
  column: string
  direction: 'asc' | 'desc'
}

export interface FilterState {
  column: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'between' | 'in'
  value: CellValue | CellValue[]
}

export interface PaginationState {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export interface TableState {
  sort?: SortState
  filters: FilterState[]
  search: string
  pagination: PaginationState
  visibleColumns: string[]
  groupBy?: string
}

// ============================================
// VALIDAÇÃO COM ZOD
// ============================================

export const ColumnFormatSchema = z.object({
  type: z.enum(['string', 'number', 'currency', 'percentage', 'date', 'datetime', 'boolean', 'email', 'url', 'phone', 'image', 'badge', 'progress']),
  locale: z.string().optional(),
  currency: z.string().optional(),
  decimals: z.number().optional(),
  dateFormat: z.string().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  badgeColors: z.record(z.object({ bg: z.string(), text: z.string() })).optional(),
})

export const ColumnDefinitionSchema = z.object({
  key: z.string(),
  label: z.string(),
  format: ColumnFormatSchema,
  sortable: z.boolean().optional(),
  filterable: z.boolean().optional(),
  searchable: z.boolean().optional(),
  hidden: z.boolean().optional(),
  width: z.union([z.string(), z.number()]).optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  sticky: z.enum(['left', 'right']).optional(),
})

export const DataSchemaSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  columns: z.array(ColumnDefinitionSchema),
  primaryKey: z.string().optional(),
  defaultSort: z.object({
    column: z.string(),
    direction: z.enum(['asc', 'desc']),
  }).optional(),
  groupBy: z.array(z.string()).optional(),
  features: z.object({
    export: z.boolean().optional(),
    print: z.boolean().optional(),
    charts: z.boolean().optional(),
    pagination: z.boolean().optional(),
    search: z.boolean().optional(),
    filters: z.boolean().optional(),
    columnToggle: z.boolean().optional(),
  }).optional(),
})

export const CompanyThemeSchema = z.object({
  colors: z.object({
    primary: z.string(),
    primaryDark: z.string(),
    primaryLight: z.string(),
    accent: z.string(),
    background: z.string(),
    surface: z.string(),
    text: z.string(),
    textSecondary: z.string(),
    border: z.string(),
    success: z.string(),
    warning: z.string(),
    error: z.string(),
    info: z.string(),
  }),
  fonts: z.object({
    sans: z.string().optional(),
    mono: z.string().optional(),
  }).optional(),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
  shadows: z.enum(['none', 'soft', 'medium', 'strong']).optional(),
})

export const CompanyConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().optional(),
  logoLight: z.string().optional(),
  theme: CompanyThemeSchema,
  defaultLocale: z.string().optional(),
  dateFormat: z.string().optional(),
  currencyCode: z.string().optional(),
})
