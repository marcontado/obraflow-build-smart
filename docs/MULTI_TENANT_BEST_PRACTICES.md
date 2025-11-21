# Multi-Tenant Development Best Practices

Guia de melhores práticas para desenvolvimento seguro em arquitetura multi-tenant.

## 🎯 Princípios Fundamentais

### 1. **Workspace-First Mindset**

Todo código deve considerar workspace como contexto primário:

```typescript
// ❌ NUNCA FAÇA ISSO
const { data } = await supabase.from("projects").select("*");

// ✅ SEMPRE FAÇA ISSO
const { workspaceId, query } = useWorkspaceQuery();
const { data } = await query("projects").select("*");
```

### 2. **Defense in Depth**

Múltiplas camadas de segurança:

```
┌─────────────────────────────────────┐
│ 1. Client-side validation           │ ← useWorkspaceQuery
├─────────────────────────────────────┤
│ 2. Service layer checks             │ ← createWorkspaceQuery
├─────────────────────────────────────┤
│ 3. Database RLS policies            │ ← is_workspace_member()
├─────────────────────────────────────┤
│ 4. Foreign key constraints          │ ← CASCADE deletes
└─────────────────────────────────────┘
```

### 3. **Fail Secure**

Em caso de erro, negar acesso:

```typescript
// ✅ Bom: falha segura
const { currentWorkspace } = useWorkspace();
if (!currentWorkspace) {
  return <Navigate to="/workspace/select" />;
}

// ❌ Ruim: falha insegura
const workspaceId = currentWorkspace?.id || "default";
```

## 📝 Padrões de Código

### Criando Novos Componentes

```typescript
// components/MyFeature.tsx
import { useWorkspaceQuery } from "@/hooks/useWorkspaceQuery";
import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";

function MyFeature() {
  const { workspaceId, query } = useWorkspaceQuery();
  
  const { data } = useQuery({
    queryKey: ["my-feature", workspaceId],
    queryFn: async () => {
      const { data, error } = await query("my_table")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
  
  return <div>{/* ... */}</div>;
}

// SEMPRE use withWorkspaceGuard
export default withWorkspaceGuard(MyFeature);
```

### Criando Novos Services

```typescript
// services/myFeature.service.ts
import { createWorkspaceQuery } from "@/lib/workspace-query";

export const myFeatureService = {
  async getAll(workspaceId: string) {
    // SEMPRE valide workspace_id primeiro
    if (!workspaceId) {
      throw new Error("workspace_id is required");
    }
    
    const { data, error } = await createWorkspaceQuery("my_table", workspaceId)
      .select("*");
    
    return { data, error };
  },
  
  async create(workspaceId: string, input: MyInput) {
    // SEMPRE inclua workspace_id
    const { data, error } = await createWorkspaceQuery("my_table", workspaceId)
      .insert({
        ...input,
        workspace_id: workspaceId,
        created_by: auth.uid()
      })
      .select()
      .single();
    
    return { data, error };
  }
};
```

### Criando Novas Tabelas

```sql
-- migration: create_my_table.sql

-- 1. Criar tabela com workspace_id NOT NULL
CREATE TABLE public.my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  -- outros campos
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- 2. Foreign key com CASCADE
  CONSTRAINT fk_my_table_workspace
    FOREIGN KEY (workspace_id)
    REFERENCES public.workspaces(id)
    ON DELETE CASCADE
);

-- 3. Índice para performance
CREATE INDEX idx_my_table_workspace_id ON public.my_table(workspace_id);

-- 4. Ativar RLS
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança
CREATE POLICY "Members can view workspace data"
  ON public.my_table FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can create workspace data"
  ON public.my_table FOR INSERT
  WITH CHECK (
    is_workspace_member(auth.uid(), workspace_id) AND
    created_by = auth.uid()
  );

CREATE POLICY "Members can update workspace data"
  ON public.my_table FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can delete workspace data"
  ON public.my_table FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- 6. Atualizar tipo no workspace-query.ts
-- type WorkspaceScopedTable = ... | "my_table";
```

### Hooks Personalizados

```typescript
// hooks/useMyFeature.ts
import { useWorkspaceQuery } from "@/hooks/useWorkspaceQuery";
import { useQuery, useMutation } from "@tanstack/react-query";

export function useMyFeature() {
  const { workspaceId, query } = useWorkspaceQuery();
  
  // Query
  const myFeatureQuery = useQuery({
    queryKey: ["my-feature", workspaceId],
    queryFn: async () => {
      const { data, error } = await query("my_table").select("*");
      if (error) throw error;
      return data;
    }
  });
  
  // Mutation
  const createMutation = useMutation({
    mutationFn: async (input: MyInput) => {
      const { data, error } = await query("my_table")
        .insert({
          ...input,
          workspace_id: workspaceId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-feature", workspaceId] });
    }
  });
  
  return {
    data: myFeatureQuery.data,
    isLoading: myFeatureQuery.isLoading,
    create: createMutation.mutate
  };
}
```

## 🚫 Anti-Patterns (O que NÃO fazer)

### 1. Hardcoded workspace_id
```typescript
// ❌ NUNCA
const workspaceId = "550e8400-e29b-41d4-a716-446655440000";

// ✅ SEMPRE
const { currentWorkspace } = useWorkspace();
const workspaceId = currentWorkspace.id;
```

### 2. workspace_id opcional
```typescript
// ❌ NUNCA
interface MyData {
  id: string;
  workspace_id?: string; // NUNCA opcional!
}

// ✅ SEMPRE
interface MyData {
  id: string;
  workspace_id: string; // SEMPRE obrigatório
}
```

### 3. Bypass de workspace context
```typescript
// ❌ NUNCA - bypass do contexto
const { data } = await supabase
  .from("projects")
  .select("*")
  .eq("id", projectId);

// ✅ SEMPRE - usar contexto
const { query } = useWorkspaceQuery();
const { data } = await query("projects")
  .select("*")
  .eq("id", projectId);
```

### 4. Cache global sem workspace
```typescript
// ❌ NUNCA - cache compartilhado
queryKey: ["projects"]

// ✅ SEMPRE - cache por workspace
queryKey: ["projects", workspaceId]
```

### 5. Assumir workspace default
```typescript
// ❌ NUNCA
const workspaceId = localStorage.getItem("workspaceId") || "default";

// ✅ SEMPRE validar
const { currentWorkspace } = useWorkspace();
if (!currentWorkspace) {
  throw new Error("No workspace selected");
}
```

## 🧪 Test-Driven Development

### 1. Escreva testes ANTES de implementar

```typescript
// PRIMEIRO: Escrever teste
describe("MyFeature", () => {
  it("should only show workspace data", () => {
    const ws1Data = createData(workspace1Id);
    const ws2Data = createData(workspace2Id);
    
    render(<MyFeature />, { workspaceId: workspace1Id });
    
    expect(screen.getByText(ws1Data.name)).toBeInTheDocument();
    expect(screen.queryByText(ws2Data.name)).not.toBeInTheDocument();
  });
});

// DEPOIS: Implementar feature
```

### 2. Testes obrigatórios para cada nova feature

- [ ] Isola dados por workspace
- [ ] Requer workspace_id
- [ ] Invalida cache na troca
- [ ] Previne acesso não autorizado
- [ ] Valida entrada de dados

## 🔍 Code Review Checklist

Ao revisar PRs com multi-tenancy:

### Database Changes
- [ ] RLS ativado na tabela?
- [ ] workspace_id é NOT NULL?
- [ ] Foreign key tem ON DELETE CASCADE?
- [ ] Índice criado em workspace_id?
- [ ] Políticas RLS implementadas?

### Code Changes
- [ ] Usa `createWorkspaceQuery` ou `useWorkspaceQuery`?
- [ ] Componente usa `withWorkspaceGuard`?
- [ ] Cache keys incluem workspaceId?
- [ ] Serviço valida workspace_id?
- [ ] Testes de isolamento incluídos?

### Security
- [ ] Nenhum hardcoded workspace_id?
- [ ] Nenhum bypass de validações?
- [ ] Erros não expõem dados sensíveis?
- [ ] workspace_id nunca vem de query params?

## 🎓 Onboarding de Novos Desenvolvedores

### Dia 1: Fundamentos
1. Ler [MULTI_TENANT_ARCHITECTURE.md](../MULTI_TENANT_ARCHITECTURE.md)
2. Entender conceito de workspace isolation
3. Rodar testes: `npm run test`
4. Explorar `useWorkspaceQuery` e `withWorkspaceGuard`

### Dia 2: Prática
5. Fazer tutorial: criar tabela + service + component
6. Implementar feature simples com isolamento
7. Escrever testes para a feature
8. Code review com mentor

### Dia 3: Segurança
9. Ler [MULTI_TENANT_TESTING.md](./MULTI_TENANT_TESTING.md)
10. Executar `npm run security:check`
11. Testar manualmente: criar 2 workspaces, verificar isolamento
12. Revisar RLS policies no banco

### Recursos de Aprendizado
- 📚 Documentação interna (este arquivo)
- 🎬 Video tutorial (TODO: criar)
- 💬 Canal #multi-tenancy no Slack
- 👥 Pair programming com time senior

## 📊 Métricas e Monitoramento

### KPIs de Segurança
- **Zero** vazamentos de dados entre workspaces
- **100%** de tabelas com RLS ativo
- **<100ms** latência adicional por filtro workspace
- **Zero** registros órfãos

### Logs Críticos
```typescript
// Logar tentativas de acesso não autorizado
console.error("SECURITY: Unauthorized workspace access attempt", {
  userId: user.id,
  attemptedWorkspace: targetWorkspaceId,
  userWorkspaces: user.workspaces,
  timestamp: new Date().toISOString()
});
```

### Alertas
- Tentativas repetidas de acesso não autorizado
- Queries sem workspace_id (devem ser impossíveis)
- Aumento súbito em tempo de resposta (pode indicar índice faltando)

## 🚀 Deploy Checklist

Antes de fazer deploy para produção:

- [ ] Todos os testes passando (`npm run test`)
- [ ] Security check verde (`npm run security:check`)
- [ ] Code review aprovado por senior
- [ ] RLS testado manualmente em staging
- [ ] Performance testada com múltiplos workspaces
- [ ] Rollback plan documentado
- [ ] Monitoring configurado
- [ ] Team notificado

## 🆘 Respondendo a Incidentes

### Suspeita de Vazamento de Dados

1. **IMEDIATO**: Desabilitar workspace afetado
2. **Investigar**: Checar logs de acesso
3. **Identificar**: Qual dado vazou e para quem
4. **Remediar**: Corrigir a vulnerabilidade
5. **Notificar**: Informar usuários afetados (GDPR/LGPD)
6. **Post-mortem**: Documentar e prevenir recorrência

### Performance Issues

1. Verificar índices: `EXPLAIN ANALYZE SELECT ...`
2. Checar cache invalidation excessiva
3. Otimizar queries com muitos joins
4. Considerar materialized views

## 📞 Suporte

- **Questões técnicas**: #dev-support
- **Security issues**: security@empresa.com (privado!)
- **Arquitetura**: @tech-lead
- **Emergências**: oncall@empresa.com

---

**Lembre-se**: Multi-tenancy não é apenas código, é uma responsabilidade. A privacidade dos dados dos nossos usuários depende de seguirmos estas práticas rigorosamente.
