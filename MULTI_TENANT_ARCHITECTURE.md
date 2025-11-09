# 🏗️ Arquitetura Multi-Tenant - Regras Obrigatórias

Este documento define as **regras obrigatórias** para manter o isolamento total entre workspaces no sistema.

## ⚠️ Princípio Fundamental

**NUNCA** um usuário pode ver ou modificar dados de outro workspace. Todo código deve assumir que dados não isolados representam uma **vulnerabilidade crítica de segurança**.

---

## 📋 Regras Obrigatórias

### ✅ REGRA #1: Toda tabela de dados de negócio DEVE ter `workspace_id NOT NULL`

**Tabelas de negócio incluem:**
- Projetos, tarefas, clientes, áreas, atividades
- Qualquer dado específico de um workspace

**Exceções permitidas:**
- `profiles` - dados do usuário global
- `workspaces` - a própria tabela de workspaces
- `workspace_members` - relacionamento usuário-workspace
- `platform_admins` - administradores da plataforma
- `subscriptions` - assinaturas Stripe

**Exemplo correto:**
```sql
CREATE TABLE public.nova_entidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  -- seus campos aqui
);
```

**❌ NUNCA FAÇA:**
```sql
CREATE TABLE public.nova_entidade (
  id UUID PRIMARY KEY,
  workspace_id UUID,  -- ❌ NULLABLE!
  -- ...
);
```

---

### ✅ REGRA #2: Toda query DEVE usar `createWorkspaceQuery()` ou services

**NUNCA faça queries diretas em componentes:**
```typescript
// ❌ ERRADO - vulnerabilidade de segurança!
const { data } = await supabase.from("projects").select("*");

// ✅ CORRETO - usando helper
import { createWorkspaceQuery } from "@/lib/workspace-query";
const { data } = await createWorkspaceQuery("projects", workspaceId);

// ✅ AINDA MELHOR - usando hook
import { useWorkspaceQuery } from "@/hooks/useWorkspaceQuery";
const { query } = useWorkspaceQuery();
const { data } = await query("projects").eq("status", "active");

// ✅ MELHOR AINDA - usando service
import { projectsService } from "@/services/projects.service";
const { data } = await projectsService.getAll(workspaceId);
```

---

### ✅ REGRA #3: NUNCA fazer queries diretas com `supabase.from()` em componentes

**Por quê?** 
- É fácil esquecer de adicionar `.eq("workspace_id", ...)`
- Não há validação automática
- Viola o princípio de abstração

**Onde é permitido `supabase.from()`?**
- Dentro de `services/*.service.ts` (desde que use o helper)
- Em migrations SQL
- Em edge functions (com validação explícita)

---

### ✅ REGRA #4: Toda página de dados DEVE usar `withWorkspaceGuard()`

**Aplicar em todas as páginas que manipulem dados de workspace:**
```typescript
import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";

function Reports() {
  // ... seu código
}

export default withWorkspaceGuard(Reports);
```

**Páginas que DEVEM ter o guard:**
- `/projects` - Projects.tsx
- `/reports` - Reports.tsx
- `/clients` - Clients.tsx
- `/project/:id` - ProjectDetails.tsx
- Qualquer nova página que lide com dados de workspace

**Páginas que NÃO precisam:**
- `/auth` - Login/Signup
- `/workspace/select` - Seleção de workspace
- `/workspace/new` - Criação de workspace
- Landing pages públicas

---

### ✅ REGRA #5: Services DEVEM validar `workspaceId` antes de queries

**Estrutura obrigatória dos services:**
```typescript
export const entityService = {
  async getAll(workspaceId: string) {
    // ✅ Usar helper para garantir isolamento
    const { data, error } = await createWorkspaceQuery("entity", workspaceId)
      .order("created_at", { ascending: false });
    
    return { data, error };
  },

  async getById(id: string, workspaceId: string) {
    const { data, error } = await createWorkspaceQuery("entity", workspaceId)
      .eq("id", id)
      .single();
    
    return { data, error };
  },

  // ... outros métodos
};
```

**❌ NUNCA FAÇA:**
```typescript
// ❌ Sem validação de workspace
async getAll() {
  return await supabase.from("entity").select("*");
}
```

---

### ✅ REGRA #6: Testes DEVEM verificar isolamento entre workspaces

**Todo novo recurso deve incluir teste de isolamento:**
```typescript
describe("Isolamento Multi-Tenant", () => {
  it("deve impedir acesso cross-workspace", async () => {
    // Criar workspace A e B
    const workspaceA = await createTestWorkspace("A");
    const workspaceB = await createTestWorkspace("B");
    
    // Criar projeto em workspace A
    const projectA = await createTestProject({ workspaceId: workspaceA.id });
    
    // Tentar acessar projeto de A usando context de B
    const result = await projectsService.getById(projectA.id, workspaceB.id);
    
    // DEVE retornar null ou erro
    expect(result.data).toBeNull();
  });
});
```

---

## 🛡️ Camadas de Proteção

| Camada | Mecanismo | Proteção |
|--------|-----------|----------|
| **Database** | RLS policies + NOT NULL constraint | Bloqueia acesso não autorizado no DB |
| **Query Helper** | `createWorkspaceQuery()` validação | Força isolamento em toda query |
| **Service Layer** | Validação obrigatória de `workspaceId` | Impede queries sem contexto |
| **Component Layer** | `withWorkspaceGuard()` HOC | Previne renderização sem workspace |
| **Cache** | Invalidação no workspace switch | Evita exibir dados antigos |

---

## 📚 Fluxo de Desenvolvimento para Nova Feature

### 1. Criar tabela com template
```bash
# Use o template em docs/templates/new-table-migration.sql
```

### 2. Criar service
```typescript
// src/services/entity.service.ts
import { createWorkspaceQuery } from "@/lib/workspace-query";

export const entityService = {
  async getAll(workspaceId: string) {
    return await createWorkspaceQuery("entity", workspaceId)
      .order("created_at");
  }
};
```

### 3. Criar página com guard
```typescript
import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";

function EntityPage() {
  const { currentWorkspace } = useWorkspace();
  // ... usar currentWorkspace.id em todos os serviços
}

export default withWorkspaceGuard(EntityPage);
```

### 4. Escrever teste de isolamento
```typescript
it("deve isolar dados por workspace", async () => {
  // ... teste aqui
});
```

---

## 🚨 Checklist Antes de Commit

- [ ] Nova tabela tem `workspace_id NOT NULL`?
- [ ] Nova tabela tem RLS policies corretas?
- [ ] Service usa `createWorkspaceQuery()`?
- [ ] Página usa `withWorkspaceGuard()`?
- [ ] Componente passa `workspaceId` para services?
- [ ] Teste de isolamento foi escrito?
- [ ] Script de validação SQL passou?

---

## 🔍 Validação Automática

### Executar validação SQL
```sql
-- Copiar conteúdo de scripts/validate-multi-tenant.sql
-- Executar no Supabase SQL Editor
```

### Executar testes
```bash
npm run test -- multi-tenant-isolation.test.ts
```

---

## 📖 Recursos

- **Helper de Query**: `src/lib/workspace-query.ts`
- **Hook de Query**: `src/hooks/useWorkspaceQuery.ts`
- **HOC Guard**: `src/hoc/withWorkspaceGuard.tsx`
- **Template SQL**: `docs/templates/new-table-migration.sql`
- **Script Validação**: `scripts/validate-multi-tenant.sql`
- **Testes**: `src/__tests__/multi-tenant-isolation.test.tsx`

---

## ⚠️ Consequências de Violar as Regras

1. **Violação de privacidade** - usuários vendo dados de outros
2. **Vulnerabilidade de segurança** - possível exploração maliciosa
3. **Perda de confiança** - clientes abandonando a plataforma
4. **Problemas legais** - LGPD/GDPR violations

**Essas regras não são sugestões - são requisitos críticos de segurança.**
