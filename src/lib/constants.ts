/**
 * Constantes centralizadas da aplicação
 * 
 * Este arquivo contém todas as constantes usadas em toda a aplicação,
 * facilitando manutenção e configuração.
 */

// ============================================
// LIMITES DE ARQUIVO
// ============================================

/** Tamanho máximo de arquivo em bytes (50MB) */
export const MAX_FILE_SIZE = 50 * 1024 * 1024

/** Tamanho máximo de arquivo formatado para exibição */
export const MAX_FILE_SIZE_DISPLAY = '50MB'

/** Extensões de arquivo suportadas */
export const SUPPORTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'] as const

/** MIME types suportados para upload */
export const SUPPORTED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv', // .csv
  'application/csv', // .csv (alternativo)
] as const

/** String de aceite para input de arquivo */
export const FILE_ACCEPT_STRING = '.xlsx,.xls,.csv'

// ============================================
// PAGINAÇÃO
// ============================================

/** Opções de itens por página */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

/** Tamanho de página padrão */
export const DEFAULT_PAGE_SIZE = 25

/** Número máximo de botões de página visíveis */
export const MAX_VISIBLE_PAGES = 5

// ============================================
// TABELA
// ============================================

/** Largura mínima de coluna em pixels */
export const MIN_COLUMN_WIDTH = 80

/** Largura máxima de coluna em pixels */
export const MAX_COLUMN_WIDTH = 500

/** Largura padrão de coluna em pixels */
export const DEFAULT_COLUMN_WIDTH = 150

/** Altura da linha da tabela em pixels */
export const TABLE_ROW_HEIGHT = 48

/** Máximo de caracteres para truncar texto em células */
export const MAX_CELL_TEXT_LENGTH = 100

// ============================================
// PERFORMANCE
// ============================================

/** Debounce para busca em milissegundos */
export const SEARCH_DEBOUNCE_MS = 300

/** Debounce para resize de coluna em milissegundos */
export const RESIZE_DEBOUNCE_MS = 100

/** Número de linhas a partir do qual usar Web Worker */
export const WEB_WORKER_THRESHOLD = 1000

/** Tempo máximo de processamento antes de timeout (em ms) */
export const PROCESSING_TIMEOUT_MS = 60000

// ============================================
// GRÁFICOS
// ============================================

/** Tipos de gráficos disponíveis */
export const CHART_TYPES = ['bar', 'pie', 'line', 'area', 'radar'] as const

/** Número máximo de itens em gráfico de pizza */
export const MAX_PIE_CHART_ITEMS = 10

/** Paleta de cores para gráficos */
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
] as const

// ============================================
// EXPORTAÇÃO
// ============================================

/** Formatos de exportação suportados */
export const EXPORT_FORMATS = ['xlsx', 'csv', 'json'] as const

/** Tipos MIME para exportação */
export const EXPORT_MIME_TYPES = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv;charset=utf-8;',
  json: 'application/json',
} as const

// ============================================
// VALIDAÇÃO
// ============================================

/** Regex para validação de email */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Regex para validação de URL */
export const URL_REGEX = /^https?:\/\/[^\s]+$/

/** Regex para validação de telefone */
export const PHONE_REGEX = /^[\d\s()+-]{8,}$/

/** Regex para validação de data */
export const DATE_REGEX = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/

/** Regex para validação de moeda */
export const CURRENCY_REGEX = /^[R$€£¥]\s?[\d.,]+$|^[\d.,]+\s?[R$€£¥]$/

/** Regex para validação de porcentagem */
export const PERCENTAGE_REGEX = /^[\d.,]+\s?%$/

// ============================================
// UI
// ============================================

/** Duração de animação de toast em milissegundos */
export const TOAST_DURATION_MS = 5000

/** Z-index para modal */
export const MODAL_Z_INDEX = 50

/** Z-index para dropdown */
export const DROPDOWN_Z_INDEX = 40

/** Z-index para tooltip */
export const TOOLTIP_Z_INDEX = 60

/** Z-index para header fixo */
export const HEADER_Z_INDEX = 30

// ============================================
// STORAGE KEYS
// ============================================

/** Chave para tema no localStorage */
export const STORAGE_KEY_THEME = 'excel-viewer-theme'

/** Chave para configuração de empresa no localStorage */
export const STORAGE_KEY_COMPANY = 'excel-viewer-company'

/** Chave para preferências do usuário no localStorage */
export const STORAGE_KEY_PREFERENCES = 'excel-viewer-preferences'

// ============================================
// API
// ============================================

/** URL base da API */
export const API_BASE_URL = '/api'

/** Endpoints da API */
export const API_ENDPOINTS = {
  upload: '/api/upload',
  config: '/api/config',
} as const

// ============================================
// TIPOS DERIVADOS
// ============================================

/** Tipo para extensões suportadas */
export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number]

/** Tipo para tamanhos de página */
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number]

/** Tipo para tipos de gráfico */
export type ChartType = (typeof CHART_TYPES)[number]

/** Tipo para formatos de exportação */
export type ExportFormat = (typeof EXPORT_FORMATS)[number]
