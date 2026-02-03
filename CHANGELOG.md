# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- Componente `ErrorBoundary` para tratamento de erros React
- Componentes `Skeleton` para loading states (Table, Card, Avatar, Upload, Chart, Page)
- Arquivo `constants.ts` com constantes centralizadas da aplicação
- Headers de segurança aprimorados (CSP, Referrer-Policy, Permissions-Policy, HSTS)
- Documentação expandida no README com troubleshooting e guia de contribuição
- Skip links para acessibilidade (pular para conteúdo principal e navegação)
- ARIA labels e roles semânticos em todos os componentes principais
- Suporte a leitores de tela com `aria-live` para estados de loading e erro
- **208 testes unitários** cobrindo store, excel-parser, utils, config e keyboard shortcuts
- **86% de cobertura de código** com testes abrangentes

### Alterado
- Corrigido deprecation warning de `substr` para `substring` em `excel-parser.ts`
- Melhorada estrutura semântica HTML com `role="main"`, `role="banner"`, `role="contentinfo"`
- Toggle de visualização agora usa padrão ARIA tabs (`role="tablist"`, `role="tab"`, `role="tabpanel"`)
- Refatorado `useFilteredData` para extrair função pura `getFilteredData()` (melhor testabilidade)
- Corrigidos erros TypeScript em `DataTable.tsx` (type assertions para CellValue)

---

## [1.0.0] - 2024-12-01

### Adicionado

#### Core
- Upload drag & drop para arquivos Excel (XLSX, XLS) e CSV
- Parsing automático com inferência de tipos de dados
- Tabela de dados interativa com ordenação, filtros e paginação
- Sistema de busca global com destaque de resultados

#### Visualização
- Gráficos dinâmicos (Barras, Pizza, Linhas, Área, Radar)
- Renderização automática baseada nos tipos de dados
- Suporte a 13 tipos de coluna (string, number, currency, percentage, date, datetime, boolean, email, url, phone, image, badge, progress)

#### Experiência do Usuário
- Dark mode com persistência
- Atalhos de teclado para navegação rápida
- Edição inline de células (modo editável)
- Responsivo para dispositivos móveis
- Feedback visual com toasts e loading states

#### Exportação
- Exportação para XLSX, CSV e JSON
- Impressão otimizada
- Exportação de dados filtrados

#### Performance
- Web Workers para parsing de arquivos grandes
- Barra de progresso em tempo real
- Memoização de cálculos pesados
- Lazy loading de componentes

#### Segurança
- Validação de extensão e MIME type
- Limite de tamanho de arquivo configurável
- Processamento client-side (dados não enviados ao servidor)
- Headers de segurança (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)

#### Temas
- Sistema de temas customizáveis por empresa
- Configuração de cores, tipografia e espaçamentos
- Suporte a múltiplas empresas/marcas

#### Desenvolvimento
- TypeScript strict mode
- ESLint configurado
- Vitest para testes unitários
- CI/CD com GitHub Actions

### Tecnologias
- Next.js 15.1 com App Router
- React 19
- TypeScript 5.7
- Tailwind CSS 3.4
- Zustand para estado global
- Recharts para gráficos
- xlsx (SheetJS) para parsing Excel
- PapaParse para parsing CSV

---

## Convenções de Versionamento

- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs compatíveis

## Links

- [Repositório](https://github.com/seu-usuario/excel-viewer)
- [Issues](https://github.com/seu-usuario/excel-viewer/issues)
- [Documentação](./docs/EXAMPLES.md)
