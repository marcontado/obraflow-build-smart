# Archestra 🏗️

**Plataforma SaaS de Gestão de Obras para Designers de Interiores**

Archestra é uma solução completa para gerenciamento de projetos de design de interiores, oferecendo controle total sobre orçamentos, cronogramas, clientes e equipes.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🚀 Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Routing:** React Router v6
- **State Management:** React Query (TanStack Query)
- **Validation:** Zod
- **Backend:** Lovable Cloud (Supabase)
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth
- **Tests:** Vitest + Testing Library
- **Linting:** ESLint + Prettier

---

## 📋 Pré-requisitos

- Node.js 18+ ou Bun
- npm, pnpm ou yarn
- Conta Lovable (para backend)

---

## 🛠️ Instalação e Execução

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

---

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Cria build de produção |
| `npm run preview` | Visualiza build de produção |
| `npm run lint` | Executa ESLint |
| `npm run lint:fix` | Corrige erros do ESLint automaticamente |
| `npm run format` | Formata código com Prettier |
| `npm run format:check` | Verifica formatação do código |
| `npm test` | Executa testes unitários |
| `npm run test:ui` | Abre interface do Vitest |
| `npm run test:coverage` | Gera relatório de cobertura de testes |
| `npm run type-check` | Verifica tipos TypeScript |

---

## 📁 Estrutura de Pastas

```
src/
├── __tests__/           # Testes unitários
├── assets/              # Imagens e arquivos estáticos
├── components/
│   ├── layout/          # Sidebar, Header, Footer
│   ├── ui/              # shadcn/ui components
│   ├── dashboard/       # Componentes do Dashboard
│   ├── projects/        # Componentes de Projetos
│   └── shared/          # Componentes reutilizáveis
├── hooks/               # Custom React hooks
├── integrations/        # Integrações externas (Supabase)
├── lib/                 # Utilitários (utils, cn, etc)
├── pages/               # Páginas (rotas)
├── services/            # Lógica de API e Supabase
│   ├── auth.service.ts
│   ├── projects.service.ts
│   └── clients.service.ts
├── types/               # TypeScript types globais
├── constants/           # Constantes do app
└── index.css            # CSS global e design system
```

---

## 🔐 Integração com Lovable Cloud (Supabase)

O Archestra utiliza **Lovable Cloud**, que é baseado em Supabase, para:

- ✅ Autenticação de usuários (email/password, magic links)
- ✅ Banco de dados PostgreSQL com RLS (Row-Level Security)
- ✅ Storage de arquivos
- ✅ Edge Functions para lógica serverless

### Tabelas do Banco de Dados

- `profiles` - Perfis de usuário
- `clients` - Clientes
- `projects` - Projetos
- `project_areas` - Áreas/ambientes dos projetos
- `tasks` - Tarefas dos projetos

### Variáveis de Ambiente

As credenciais do Supabase são gerenciadas automaticamente pelo Lovable:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

---

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Rodar testes em modo watch
npm test -- --watch

# Ver interface gráfica dos testes
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

---

## 🎨 Design System

O Archestra utiliza um design system consistente baseado em:

- **Cores semânticas** (primary, secondary, accent, etc.)
- **Tipografia responsiva** (display, headings, body)
- **Espaçamentos consistentes** (Tailwind spacing scale)
- **Componentes reutilizáveis** (shadcn/ui)
- **Tokens CSS customizados** (definidos em `src/index.css`)

Sempre use tokens semânticos ao invés de cores diretas:

```tsx
// ❌ Errado
<div className="bg-blue-500 text-white">

// ✅ Correto
<div className="bg-primary text-primary-foreground">
```

---

## 🗺️ Roadmap de Funcionalidades

### ✅ Etapa 1 - Fundações (Concluída)
- [x] Setup do projeto base
- [x] Configuração de testes (Vitest)
- [x] Configuração de linting (ESLint + Prettier)
- [x] Integração com Supabase
- [x] Sistema de autenticação
- [x] Layout base com Sidebar e Header

### 🚧 Etapa 2 - CRUD Básico (Em desenvolvimento)
- [ ] Listagem de projetos
- [ ] Criação de projetos
- [ ] Edição de projetos
- [ ] Exclusão de projetos
- [ ] Gestão de clientes

### 📅 Etapa 3 - Kanban e Tarefas
- [ ] Board Kanban para tarefas
- [ ] Drag and drop
- [ ] Filtros e ordenação
- [ ] Assignação de tarefas

### 📅 Etapa 4 - Orçamentos
- [ ] Criação de orçamentos
- [ ] Acompanhamento de gastos
- [ ] Relatórios financeiros

### 📅 Etapa 5 - Cronogramas (Gantt)
- [ ] Visualização de cronograma
- [ ] Dependências entre tarefas
- [ ] Alertas de atrasos

---

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## 🆘 Suporte

Para dúvidas ou problemas, abra uma issue no repositório ou entre em contato com o time de desenvolvimento.

---

**Desenvolvido com ❤️ para designers de interiores**
