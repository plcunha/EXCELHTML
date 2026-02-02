# Excel Viewer - Sistema Modular de Visualização

Um sistema moderno e profissional para transformar arquivos Excel em interfaces frontend interativas e elegantes.

![Excel Viewer](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## ✨ Features

- 📤 **Upload Drag & Drop** - Suporte a XLSX, XLS e CSV
- 📊 **Tabelas Interativas** - Ordenação, filtros, busca e paginação
- 📈 **Gráficos Dinâmicos** - Barras, pizza e linhas automáticos
- 🎨 **Temas Customizáveis** - Sistema de temas por empresa
- 🌙 **Dark Mode** - Suporte nativo a modo escuro
- 📱 **Responsivo** - Funciona em qualquer dispositivo
- 🔒 **Seguro** - Headers de segurança e validação de arquivos
- ⚡ **Rápido** - Processamento no cliente, sem envio de dados

## 🚀 Início Rápido

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/excel-viewer.git
cd excel-viewer

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Build para Produção

```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── api/               # API Routes
│   │   ├── upload/        # Endpoint de upload
│   │   └── config/        # Configurações e schemas
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── FileUpload.tsx    # Upload de arquivos
│   ├── DataTable.tsx     # Tabela de dados
│   ├── Toolbar.tsx       # Barra de ferramentas
│   ├── Pagination.tsx    # Paginação
│   ├── Charts.tsx        # Gráficos
│   └── Header.tsx        # Cabeçalho
├── lib/                   # Bibliotecas e utilitários
│   ├── excel-parser.ts   # Parser de Excel/CSV
│   ├── config.ts         # Configurações e temas
│   ├── store.ts          # Estado global (Zustand)
│   └── utils.ts          # Funções utilitárias
└── types/                 # Definições TypeScript
    └── index.ts          # Tipos do sistema
```

## 🎨 Sistema de Temas

### Temas Pré-definidos

O sistema vem com temas prontos para uso:

```typescript
import { companyPresets } from '@/lib/config'

// Temas disponíveis
const themes = {
  default: companyPresets.default,   // Azul profissional
  techCorp: companyPresets.techCorp, // Roxo moderno
  financeBank: companyPresets.financeBank, // Verde financeiro
  shopMax: companyPresets.shopMax,   // Laranja e-commerce
}
```

### Criar Tema Customizado

```typescript
import { createCompanyConfig } from '@/lib/config'

const minhaEmpresa = createCompanyConfig({
  id: 'minha-empresa',
  name: 'Minha Empresa',
  logo: '/logos/minha-empresa.svg',
  theme: {
    colors: {
      primary: '#7c3aed',
      primaryDark: '#5b21b6',
      primaryLight: '#a78bfa',
      accent: '#10b981',
      // ... outras cores
    },
    borderRadius: 'xl',
    shadows: 'soft',
  },
  currencyCode: 'BRL',
  defaultLocale: 'pt-BR',
})
```

## 📐 Schemas de Dados

### Definição de Schema

Schemas definem como os dados são exibidos:

```typescript
import type { DataSchema } from '@/types'

const vendas: DataSchema = {
  id: 'vendas',
  name: 'Relatório de Vendas',
  columns: [
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
        locale: 'pt-BR' 
      },
      align: 'right',
    },
    {
      key: 'status',
      label: 'Status',
      format: { 
        type: 'badge',
        badgeColors: {
          'Concluído': { bg: '#dcfce7', text: '#166534' },
          'Pendente': { bg: '#fef3c7', text: '#92400e' },
          'Cancelado': { bg: '#fecaca', text: '#991b1b' },
        }
      },
      align: 'center',
    },
  ],
  features: {
    export: true,
    charts: true,
    pagination: true,
    search: true,
    filters: true,
  },
}
```

### Tipos de Coluna Suportados

| Tipo | Descrição | Formatação |
|------|-----------|------------|
| `string` | Texto | Texto simples |
| `number` | Número | Formatação numérica |
| `currency` | Moeda | R$ 1.234,56 |
| `percentage` | Porcentagem | 85,5% |
| `date` | Data | 31/12/2024 |
| `datetime` | Data e hora | 31/12/2024 14:30 |
| `boolean` | Booleano | ✓ ou ✗ |
| `email` | E-mail | Link mailto |
| `url` | URL | Link externo |
| `phone` | Telefone | Link tel |
| `image` | Imagem | Thumbnail |
| `badge` | Badge | Chips coloridos |
| `progress` | Progresso | Barra de progresso |

## 🔌 API Reference

### Upload de Arquivo

```
POST /api/upload
Content-Type: multipart/form-data
```

### Salvar Schema

```
POST /api/config?type=schema
Content-Type: application/json

{
  "id": "meu-schema",
  "name": "Meus Dados",
  "columns": [...]
}
```

### Salvar Configuração de Empresa

```
POST /api/config?type=company
Content-Type: application/json

{
  "id": "minha-empresa",
  "name": "Minha Empresa",
  "theme": {...}
}
```

## 🛠️ Uso Programático

### Carregar Dados Programaticamente

```typescript
import { parseFile, processData } from '@/lib/excel-parser'
import { useAppStore } from '@/lib/store'

// Em um componente
const { setData } = useAppStore()

async function loadFile(file: File) {
  const parseResult = await parseFile(file)
  const processed = processData(parseResult)
  setData(processed)
}
```

### Exportar Dados

```typescript
import { exportData } from '@/lib/excel-parser'
import { downloadFile } from '@/lib/utils'

// Exportar para Excel
const blob = exportData(data, 'xlsx')
downloadFile(blob, 'dados.xlsx')
```

## 🔒 Segurança

- ✅ Validação de tipo e tamanho de arquivo
- ✅ Headers de segurança (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- ✅ Processamento client-side (dados não são enviados ao servidor)
- ✅ Sanitização de inputs
- ✅ Content Security Policy ready

## 📊 Performance

- ⚡ Parsing otimizado com Web Workers (futuro)
- ⚡ Virtualização de tabelas para grandes datasets
- ⚡ Lazy loading de gráficos
- ⚡ Memoização de cálculos pesados
- ⚡ Bundle splitting automático

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT © 2024 Excel Viewer
