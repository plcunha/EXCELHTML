# Excel Viewer - Sistema Modular de Visualização

Um sistema moderno e profissional para transformar arquivos Excel em interfaces frontend interativas e elegantes.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.1-black?logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Tests-209_passing-brightgreen?logo=vitest" alt="209 Tests Passing" />
  <img src="https://img.shields.io/badge/Coverage-88%25-brightgreen" alt="88% Coverage" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License MIT" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-início-rápido">Início Rápido</a> •
  <a href="#-documentação">Documentação</a> •
  <a href="#-contribuindo">Contribuindo</a> •
  <a href="#-troubleshooting">Troubleshooting</a>
</p>

---

## ✨ Features

### Core
- 📤 **Upload Drag & Drop** - Suporte a XLSX, XLS e CSV com validação robusta
- 📊 **Tabelas Interativas** - Ordenação, filtros, busca e paginação
- 📈 **Gráficos Dinâmicos** - Barras, pizza, linhas, área e radar automáticos
- 🎨 **Temas Customizáveis** - Sistema de temas por empresa
- 🌙 **Dark Mode** - Suporte nativo a modo escuro com persistência

### Experiência do Usuário
- 📱 **Responsivo** - Funciona em qualquer dispositivo
- ⌨️ **Atalhos de Teclado** - Navegação rápida (Shift+? para ver todos)
- ✏️ **Edição Inline** - Edite células diretamente na tabela (modo editável)
- 📊 **Exportação** - XLSX, CSV e JSON

### Performance & Segurança
- ⚡ **Web Workers** - Parsing assíncrono para arquivos grandes
- 🔒 **Seguro** - Headers de segurança, CSP, e validação rigorosa
- 🚀 **Otimizado** - Lazy loading, memoização e bundle splitting
- ✅ **Testado** - 208 testes com 86% de cobertura

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18.17 ou superior
- npm, pnpm ou yarn

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
# Build otimizado
npm run build

# Executar produção
npm start
```

### Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm start` | Executa build de produção |
| `npm run lint` | Verifica código com ESLint |
| `npm run type-check` | Verifica tipos TypeScript |
| `npm run test` | Executa testes (watch mode) |
| `npm run test:run` | Executa testes uma vez |

---

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
│   ├── excel-worker.ts   # Web Worker para parsing
│   ├── config.ts         # Configurações e temas
│   ├── constants.ts      # Constantes centralizadas
│   ├── store.ts          # Estado global (Zustand)
│   └── utils.ts          # Funções utilitárias
├── test/                  # Testes unitários
└── types/                 # Definições TypeScript
    └── index.ts          # Tipos do sistema
```

---

## 📖 Documentação

### Sistema de Temas

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
    },
    borderRadius: 'xl',
    shadows: 'soft',
  },
  currencyCode: 'BRL',
  defaultLocale: 'pt-BR',
})
```

### Schemas de Dados

Schemas definem como os dados são exibidos e formatados:

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
      format: { type: 'currency', currency: 'BRL', locale: 'pt-BR' },
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
        }
      },
    },
  ],
}
```

### Tipos de Coluna Suportados

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `string` | Texto | Texto simples |
| `number` | Número | 1.234,56 |
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

### Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + F` | Focar na busca |
| `Ctrl + O` | Abrir arquivo |
| `Ctrl + Shift + V` | Alternar tabela/gráficos |
| `Ctrl + D` | Alternar modo escuro |
| `Ctrl + ←/→` | Página anterior/próxima |
| `Ctrl + Home/End` | Primeira/última página |
| `Shift + ?` | Mostrar atalhos |
| `Escape` | Limpar busca |

📚 **Mais exemplos:** Consulte [docs/EXAMPLES.md](docs/EXAMPLES.md)

---

## 🔒 Segurança

### Headers de Segurança Configurados

- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Content-Security-Policy` (configurável)
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`

### Validação de Arquivos

- Validação de extensão e MIME type
- Limite de tamanho configurável (padrão: 50MB)
- Processamento client-side (dados não são enviados ao servidor)
- Sanitização de inputs

> **⚠️ Nota de Segurança**: A biblioteca `xlsx` (SheetJS) possui vulnerabilidades conhecidas sem correção disponível na versão gratuita. Para uso em produção com arquivos não confiáveis, considere validação adicional ou use a versão Pro do SheetJS.

---

## ⚡ Performance

- **Web Workers** - Parsing em thread separada para arquivos grandes
- **Barra de Progresso** - Feedback em tempo real durante processamento
- **Virtualização** - Renderização eficiente para grandes datasets
- **Lazy Loading** - Gráficos carregados sob demanda
- **Memoização** - Cálculos pesados cacheados
- **Bundle Splitting** - Carregamento otimizado por rotas

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga as diretrizes abaixo:

### Processo de Contribuição

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/SEU_USUARIO/excel-viewer.git`
3. **Crie** uma branch: `git checkout -b feature/minha-feature`
4. **Desenvolva** sua feature
5. **Teste** suas mudanças: `npm test`
6. **Lint** o código: `npm run lint`
7. **Commit** suas mudanças: `git commit -m 'feat: adiciona minha feature'`
8. **Push** para a branch: `git push origin feature/minha-feature`
9. **Abra** um Pull Request

### Padrões de Código

- Use TypeScript strict mode
- Siga o padrão de commits [Conventional Commits](https://www.conventionalcommits.org/)
- Adicione testes para novas funcionalidades
- Mantenha a cobertura de testes
- Documente funções públicas

### Tipos de Commits

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `style` | Formatação (não afeta lógica) |
| `refactor` | Refatoração |
| `test` | Adição/correção de testes |
| `chore` | Manutenção/configuração |

---

## 🔧 Troubleshooting

### Problemas Comuns

#### "Arquivo não suportado"

**Causa:** O arquivo não tem extensão válida (.xlsx, .xls, .csv) ou está corrompido.

**Solução:**
1. Verifique a extensão do arquivo
2. Tente reexportar do Excel/aplicativo original
3. Para CSVs, verifique a codificação (use UTF-8)

#### "Arquivo muito grande"

**Causa:** O arquivo excede o limite de 50MB.

**Solução:**
1. Divida o arquivo em partes menores
2. Remova colunas/linhas desnecessárias
3. Comprima imagens embutidas (se houver)

#### Performance lenta com muitos dados

**Causa:** Arquivos com milhares de linhas podem impactar a performance.

**Solução:**
1. O Web Worker deve estar ativo (ícone ⚡ aparece)
2. Reduza o número de linhas visíveis por página
3. Evite filtros muito complexos simultaneamente

#### Dark mode não persiste

**Causa:** Cookies/localStorage podem estar bloqueados.

**Solução:**
1. Verifique configurações de privacidade do navegador
2. Permita localStorage para o domínio

#### Gráficos não aparecem

**Causa:** Dados insuficientes ou sem colunas numéricas.

**Solução:**
1. Certifique-se de ter pelo menos uma coluna numérica
2. Verifique se os valores são reconhecidos como números

### Suporte

Se o problema persistir:
1. Verifique a [seção de Issues](https://github.com/seu-usuario/excel-viewer/issues)
2. Abra uma nova issue com:
   - Descrição do problema
   - Passos para reproduzir
   - Versão do navegador
   - Tipo/tamanho do arquivo (não envie dados sensíveis)

---

## 📄 Licença

MIT © 2024 Excel Viewer

---

<p align="center">
  Feito com ❤️ por desenvolvedores para desenvolvedores
</p>
