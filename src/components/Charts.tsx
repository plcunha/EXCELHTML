'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import type { DataRow, ColumnDefinition } from '@/types'

interface ChartsProps {
  className?: string
}

const COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
]

// Dark mode tooltip styles
const getTooltipStyle = (isDarkMode: boolean) => ({
  backgroundColor: isDarkMode ? '#1f2937' : '#fff',
  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
  borderRadius: '8px',
  boxShadow: isDarkMode 
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  color: isDarkMode ? '#f3f4f6' : '#374151',
})

// Grid and axis colors for dark mode
const getChartColors = (isDarkMode: boolean) => ({
  grid: isDarkMode ? '#374151' : '#e5e7eb',
  axis: isDarkMode ? '#9ca3af' : '#6b7280',
  text: isDarkMode ? '#d1d5db' : '#6b7280',
  labelLine: isDarkMode ? '#9ca3af' : '#6b7280',
})

export function Charts({ className }: ChartsProps) {
  const { data, isDarkMode } = useAppStore()
  
  const chartColors = useMemo(() => getChartColors(isDarkMode), [isDarkMode])
  const tooltipStyle = useMemo(() => getTooltipStyle(isDarkMode), [isDarkMode])
  
  const chartData = useMemo(() => {
    if (!data) return null
    
    // Encontra colunas numéricas e de badge para gráficos
    const numericColumns = data.schema.columns.filter(
      c => ['number', 'currency', 'percentage', 'progress'].includes(c.format.type)
    )
    
    const badgeColumns = data.schema.columns.filter(
      c => c.format.type === 'badge'
    )
    
    // Dados para gráfico de barras (primeiras 10 linhas, primeira coluna numérica)
    const barData = numericColumns.length > 0 ? {
      column: numericColumns[0],
      data: data.rows.slice(0, 10).map((row, i) => ({
        name: `Item ${i + 1}`,
        value: Number(row[numericColumns[0].key]) || 0,
      })),
    } : null
    
    // Dados para gráfico de pizza (primeira coluna badge)
    const pieData = badgeColumns.length > 0 ? {
      column: badgeColumns[0],
      data: aggregateBadgeData(data.rows, badgeColumns[0]),
    } : null
    
    // Dados para gráfico de linha (evolução temporal ou sequencial)
    const lineData = numericColumns.length >= 2 ? {
      columns: numericColumns.slice(0, 3),
      data: data.rows.slice(0, 20).map((row, i) => {
        const point: Record<string, unknown> = { name: `${i + 1}` }
        numericColumns.slice(0, 3).forEach(col => {
          point[col.key] = Number(row[col.key]) || 0
        })
        return point
      }),
    } : null
    
    // Dados para gráfico de área (mesmo formato que linha, mas com preenchimento)
    const areaData = numericColumns.length >= 1 ? {
      column: numericColumns[0],
      data: data.rows.slice(0, 15).map((row, i) => ({
        name: `${i + 1}`,
        value: Number(row[numericColumns[0].key]) || 0,
      })),
    } : null
    
    // Dados para gráfico radar (comparação multidimensional)
    const radarData = numericColumns.length >= 3 ? {
      columns: numericColumns.slice(0, 5),
      data: numericColumns.slice(0, 5).map(col => {
        // Calcula média da coluna para o radar
        const values = data.rows.map(row => Number(row[col.key]) || 0)
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        const max = Math.max(...values)
        // Normaliza para porcentagem
        const normalized = max > 0 ? (avg / max) * 100 : 0
        return {
          subject: col.label,
          value: Math.round(normalized),
          fullMark: 100,
        }
      }),
    } : null
    
    return { barData, pieData, lineData, areaData, radarData }
  }, [data])
  
  if (!data || !chartData) {
    return null
  }
  
  const { barData, pieData, lineData, areaData, radarData } = chartData
  
  // Se não há dados suficientes para gráficos
  if (!barData && !pieData) {
    return (
      <div className={cn(
        'p-8 text-center rounded-xl border',
        'bg-white border-gray-200 text-gray-500',
        'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400',
        className
      )}>
        <p>Dados insuficientes para gerar gráficos</p>
        <p className="text-sm mt-1">Adicione colunas numéricas ou categóricas</p>
      </div>
    )
  }
  
  return (
    <div className={cn('grid gap-6 md:grid-cols-2', className)}>
      {/* Gráfico de Barras */}
      {barData && (
        <div className={cn(
          'rounded-xl border shadow-soft p-4',
          'bg-white border-gray-200',
          'dark:bg-gray-800 dark:border-gray-700'
        )}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
            {barData.column.label}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartColors.text }} stroke={chartColors.axis} />
                <YAxis tick={{ fontSize: 12, fill: chartColors.text }} stroke={chartColors.axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Gráfico de Pizza */}
      {pieData && (
        <div className={cn(
          'rounded-xl border shadow-soft p-4',
          'bg-white border-gray-200',
          'dark:bg-gray-800 dark:border-gray-700'
        )}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Distribuição: {pieData.column.label}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: chartColors.labelLine }}
                >
                  {pieData.data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Gráfico de Linha */}
      {lineData && (
        <div className={cn(
          'rounded-xl border shadow-soft p-4',
          'bg-white border-gray-200',
          'dark:bg-gray-800 dark:border-gray-700'
        )}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Comparativo
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartColors.text }} stroke={chartColors.axis} />
                <YAxis tick={{ fontSize: 12, fill: chartColors.text }} stroke={chartColors.axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: chartColors.text }} />
                {lineData.columns.map((col, index) => (
                  <Line
                    key={col.key}
                    type="monotone"
                    dataKey={col.key}
                    name={col.label}
                    stroke={COLORS[index]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Gráfico de Área */}
      {areaData && (
        <div className={cn(
          'rounded-xl border shadow-soft p-4',
          'bg-white border-gray-200',
          'dark:bg-gray-800 dark:border-gray-700'
        )}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Tendência: {areaData.column.label}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData.data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartColors.text }} stroke={chartColors.axis} />
                <YAxis tick={{ fontSize: 12, fill: chartColors.text }} stroke={chartColors.axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Gráfico Radar */}
      {radarData && (
        <div className={cn(
          'rounded-xl border shadow-soft p-4',
          'bg-white border-gray-200',
          'dark:bg-gray-800 dark:border-gray-700'
        )}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Análise Multidimensional
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData.data}>
                <PolarGrid stroke={chartColors.grid} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 11, fill: chartColors.text }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: chartColors.axis }}
                />
                <Radar
                  name="Média"
                  dataKey="value"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.5}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [`${value}%`, 'Média Normalizada']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

// Função auxiliar para agregar dados de badge
function aggregateBadgeData(
  rows: DataRow[], 
  column: ColumnDefinition
): { name: string; value: number }[] {
  const counts: Record<string, number> = {}
  
  rows.forEach(row => {
    const value = String(row[column.key] ?? 'N/A')
    counts[value] = (counts[value] || 0) + 1
  })
  
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Limita a 8 categorias
}
