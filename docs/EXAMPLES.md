# Exemplos de Uso do Excel Viewer

Este documento contém exemplos práticos de como usar o sistema.

## 1. Upload Básico

O uso mais simples é fazer upload de um arquivo Excel ou CSV:

1. Arraste o arquivo para a área de upload
2. Os dados serão automaticamente processados
3. A tabela será exibida com tipos inferidos automaticamente

## 2. Configurar Tema Customizado

```typescript
// Em qualquer componente ou arquivo de configuração
import { useAppStore } from '@/lib/store'
import { createCompanyConfig } from '@/lib/config'

function App() {
  const { setCustomCompany } = useAppStore()
  
  useEffect(() => {
    // Configurar tema da empresa
    const config = createCompanyConfig({
      id: 'acme-corp',
      name: 'ACME Corporation',
      logo: '/logos/acme.svg',
      theme: {
        colors: {
          primary: '#e11d48',      // Rosa
          primaryDark: '#be123c',
          primaryLight: '#fb7185',
          accent: '#0ea5e9',       // Azul
          background: '#fafafa',
          surface: '#ffffff',
          text: '#18181b',
          textSecondary: '#71717a',
          border: '#e4e4e7',
          success: '#22c55e',
          warning: '#eab308',
          error: '#ef4444',
          info: '#3b82f6',
        },
        borderRadius: 'lg',
        shadows: 'medium',
      },
      currencyCode: 'USD',
      defaultLocale: 'en-US',
      dateFormat: 'MM/dd/yyyy',
    })
    
    setCustomCompany(config)
  }, [])
  
  return <YourApp />
}
```

## 3. Usar Schema Pré-definido

```typescript
import { parseFile, processData } from '@/lib/excel-parser'
import type { DataSchema } from '@/types'

// Schema para dados de vendas
const salesSchema: DataSchema = {
  id: 'sales-report',
  name: 'Relatório de Vendas',
  columns: [
    {
      key: 'id',
      label: 'ID',
      format: { type: 'number' },
      width: 80,
      align: 'center',
    },
    {
      key: 'cliente',
      label: 'Cliente',
      format: { type: 'string' },
      sortable: true,
      searchable: true,
    },
    {
      key: 'produto',
      label: 'Produto',
      format: { type: 'string' },
      sortable: true,
      searchable: true,
    },
    {
      key: 'valor',
      label: 'Valor',
      format: { 
        type: 'currency',
        currency: 'BRL',
        locale: 'pt-BR',
      },
      sortable: true,
      align: 'right',
    },
    {
      key: 'data',
      label: 'Data',
      format: { 
        type: 'date',
        dateFormat: 'dd/MM/yyyy',
      },
      sortable: true,
      align: 'center',
    },
    {
      key: 'status',
      label: 'Status',
      format: { 
        type: 'badge',
        badgeColors: {
          'Pago': { bg: '#dcfce7', text: '#166534' },
          'Pendente': { bg: '#fef3c7', text: '#92400e' },
          'Atrasado': { bg: '#fecaca', text: '#991b1b' },
        },
      },
      filterable: true,
      align: 'center',
    },
    {
      key: 'comissao',
      label: 'Comissão',
      format: { 
        type: 'percentage',
        decimals: 1,
      },
      align: 'right',
    },
  ],
  defaultSort: {
    column: 'data',
    direction: 'desc',
  },
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

// Usar o schema
async function loadSalesData(file: File) {
  const parseResult = await parseFile(file)
  const processed = processData(parseResult, salesSchema, {
    sourceFileName: file.name,
  })
  
  return processed
}
```

## 4. Dados de RH

```typescript
const hrSchema: DataSchema = {
  id: 'hr-employees',
  name: 'Funcionários',
  columns: [
    {
      key: 'foto',
      label: 'Foto',
      format: { type: 'image' },
      width: 60,
      align: 'center',
      sortable: false,
    },
    {
      key: 'nome',
      label: 'Nome Completo',
      format: { type: 'string' },
      sortable: true,
      searchable: true,
      sticky: 'left',
    },
    {
      key: 'email',
      label: 'E-mail',
      format: { type: 'email' },
      searchable: true,
    },
    {
      key: 'telefone',
      label: 'Telefone',
      format: { type: 'phone' },
    },
    {
      key: 'departamento',
      label: 'Departamento',
      format: { 
        type: 'badge',
        badgeColors: {
          'TI': { bg: '#dbeafe', text: '#1e40af' },
          'RH': { bg: '#fce7f3', text: '#9d174d' },
          'Vendas': { bg: '#dcfce7', text: '#166534' },
          'Marketing': { bg: '#fef3c7', text: '#92400e' },
          'Financeiro': { bg: '#e0e7ff', text: '#3730a3' },
        },
      },
      filterable: true,
    },
    {
      key: 'salario',
      label: 'Salário',
      format: { 
        type: 'currency',
        currency: 'BRL',
      },
      align: 'right',
    },
    {
      key: 'admissao',
      label: 'Data Admissão',
      format: { 
        type: 'date',
        dateFormat: 'dd/MM/yyyy',
      },
      align: 'center',
    },
    {
      key: 'ativo',
      label: 'Ativo',
      format: { type: 'boolean' },
      align: 'center',
      filterable: true,
    },
    {
      key: 'metas',
      label: 'Metas',
      format: { type: 'progress' },
      width: 150,
    },
  ],
  features: {
    export: true,
    charts: true,
    pagination: true,
    search: true,
    filters: true,
    columnToggle: true,
  },
}
```

## 5. Integração com APIs Externas

```typescript
import { generateSchemaFromData, processData } from '@/lib/excel-parser'
import { useAppStore } from '@/lib/store'

async function loadFromAPI() {
  const { setData, setLoading, setError } = useAppStore.getState()
  
  setLoading(true)
  
  try {
    // Buscar dados da API
    const response = await fetch('/api/external-data')
    const jsonData = await response.json()
    
    // Converter para formato do sistema
    const headers = Object.keys(jsonData[0])
    const schema = generateSchemaFromData(headers, jsonData, {
      schemaName: 'Dados da API',
    })
    
    const processed = processData(
      { headers, data: jsonData, rawData: [], errors: [] },
      schema
    )
    
    setData(processed)
  } catch (error) {
    setError('Erro ao carregar dados da API')
  }
}
```

## 6. Filtros Programáticos

```typescript
import { useAppStore } from '@/lib/store'

function FilterExample() {
  const { addFilter, removeFilter, clearFilters, setSearch } = useAppStore()
  
  // Filtrar por status "Pago"
  const filterPaid = () => {
    addFilter({
      column: 'status',
      operator: 'eq',
      value: 'Pago',
    })
  }
  
  // Filtrar valores maiores que 1000
  const filterHighValue = () => {
    addFilter({
      column: 'valor',
      operator: 'gt',
      value: 1000,
    })
  }
  
  // Buscar por nome
  const searchByName = (name: string) => {
    setSearch(name)
  }
  
  // Limpar todos os filtros
  const reset = () => {
    clearFilters()
  }
  
  return (
    <div>
      <button onClick={filterPaid}>Mostrar Pagos</button>
      <button onClick={filterHighValue}>Valores Altos</button>
      <button onClick={reset}>Limpar Filtros</button>
    </div>
  )
}
```

## 7. Exportação Customizada

```typescript
import { useAppStore, useFilteredData } from '@/lib/store'
import { exportData } from '@/lib/excel-parser'
import { downloadFile } from '@/lib/utils'

function ExportExample() {
  const { data } = useAppStore()
  const { rows, totalFiltered } = useFilteredData()
  
  // Exportar apenas dados filtrados
  const exportFiltered = () => {
    if (!data) return
    
    const filteredData = {
      ...data,
      rows,
      metadata: {
        ...data.metadata,
        totalRows: totalFiltered,
      },
    }
    
    const blob = exportData(filteredData, 'xlsx')
    downloadFile(blob, `dados_filtrados_${Date.now()}.xlsx`)
  }
  
  // Exportar todos os dados
  const exportAll = () => {
    if (!data) return
    
    const blob = exportData(data, 'csv')
    downloadFile(blob, `todos_dados_${Date.now()}.csv`)
  }
  
  return (
    <div>
      <button onClick={exportFiltered}>Exportar Filtrados</button>
      <button onClick={exportAll}>Exportar Todos</button>
    </div>
  )
}
```

## 8. Múltiplas Empresas

```typescript
// config/companies.ts
import { createCompanyConfig, type CompanyConfig } from '@/lib/config'

export const companies: Record<string, CompanyConfig> = {
  acme: createCompanyConfig({
    id: 'acme',
    name: 'ACME Corp',
    logo: '/logos/acme.svg',
    theme: {
      colors: {
        primary: '#dc2626',
        // ... outras cores
      },
    },
  }),
  
  globex: createCompanyConfig({
    id: 'globex',
    name: 'Globex Corporation',
    logo: '/logos/globex.svg',
    theme: {
      colors: {
        primary: '#2563eb',
        // ... outras cores
      },
    },
  }),
  
  initech: createCompanyConfig({
    id: 'initech',
    name: 'Initech',
    logo: '/logos/initech.svg',
    theme: {
      colors: {
        primary: '#059669',
        // ... outras cores
      },
    },
  }),
}

// Uso em um componente
function CompanySwitcher() {
  const { setCustomCompany } = useAppStore()
  
  return (
    <select onChange={(e) => setCustomCompany(companies[e.target.value])}>
      <option value="acme">ACME Corp</option>
      <option value="globex">Globex Corporation</option>
      <option value="initech">Initech</option>
    </select>
  )
}
```

## Próximas Funcionalidades

- Adicionar autenticação para salvar schemas por usuário
- Implementar persistência de preferências no servidor
- Suporte a múltiplas planilhas em um único arquivo
