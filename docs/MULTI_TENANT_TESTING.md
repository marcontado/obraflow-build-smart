# Multi-Tenant Security Testing Guide

Este guia descreve como executar e interpretar os testes de isolamento multi-tenant.

## Executando os Testes

### Testes Unitários (Rápidos)
```bash
npm run test
```

Os testes unitários verificam:
- ✅ Validação de workspace_id obrigatório
- ✅ Prevenção de queries sem contexto de workspace
- ✅ Isolamento básico entre workspaces
- ✅ Validação de formatos de dados

### Testes de Integração (Requer Database)
```bash
npm run test:integration
```

Os testes de integração verificam (TODO - implementar quando DB de teste estiver pronto):
- ⚠️ Acesso cruzado entre workspaces bloqueado por RLS
- ⚠️ Políticas de segurança funcionando corretamente
- ⚠️ Cache invalidado ao trocar workspace
- ⚠️ Operações CASCADE ao deletar workspace

## Checklist de Segurança Multi-Tenant

### 1. Isolamento de Dados ✅

**O que testamos:**
- Todas as queries incluem filtro `workspace_id`
- Impossível fazer queries sem workspace
- Queries de diferentes workspaces são isoladas

**Como verificar manualmente:**
```typescript
// ❌ ISTO DEVE FALHAR
const query = supabase.from("projects").select("*");

// ✅ ISTO DEVE FUNCIONAR
const query = createWorkspaceQuery("projects", workspaceId);
```

### 2. Row Level Security (RLS) ✅

**Políticas obrigatórias em todas as tabelas:**

```sql
-- SELECT: apenas membros do workspace
CREATE POLICY "Members can view workspace data"
ON table_name FOR SELECT
USING (is_workspace_member(auth.uid(), workspace_id));

-- INSERT: apenas membros e owner é auth.uid()
CREATE POLICY "Members can create workspace data"
ON table_name FOR INSERT
WITH CHECK (
  is_workspace_member(auth.uid(), workspace_id) AND 
  created_by = auth.uid()
);

-- UPDATE: apenas membros
CREATE POLICY "Members can update workspace data"
ON table_name FOR UPDATE
USING (is_workspace_member(auth.uid(), workspace_id));

-- DELETE: apenas membros
CREATE POLICY "Members can delete workspace data"
ON table_name FOR DELETE
USING (is_workspace_member(auth.uid(), workspace_id));
```

**Verificar RLS ativo:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('projects', 'clients', 'tasks', 'partners');
-- Todos devem ter rowsecurity = true
```

### 3. Prevenção de Vazamento de Dados ✅

**Nunca expor:**
- workspace_id em URLs públicas
- workspace_id em mensagens de erro para usuários
- Dados de outros workspaces em cache

**Sempre validar:**
- Usuário é membro do workspace
- workspace_id está presente em todas as operações
- Cache é invalidado ao trocar workspace

### 4. Autenticação e Autorização ✅

**Verificações obrigatórias:**
```typescript
// 1. Usuário está autenticado
const { user } = useAuth();
if (!user) return null;

// 2. Workspace está ativo
const { currentWorkspace } = useWorkspace();
if (!currentWorkspace) return null;

// 3. Usuário é membro do workspace
const { role } = useUserRole();
if (!role) return null;
```

### 5. Cache e Estado Global ✅

**Invalidação de cache:**
```typescript
// Escutar evento de troca de workspace
useEffect(() => {
  const handleWorkspaceChange = (event: CustomEvent) => {
    // Invalidar queries do workspace anterior
    queryClient.invalidateQueries();
  };
  
  window.addEventListener("workspace-changed", handleWorkspaceChange);
  return () => window.removeEventListener("workspace-changed", handleWorkspaceChange);
}, []);
```

## Vetores de Ataque Comuns

### ❌ Ataque 1: Manipulação de workspace_id via URL
```typescript
// URL: /projects?workspace_id=outro-workspace
// Proteção: SEMPRE usar currentWorkspace do contexto
const { currentWorkspace } = useWorkspace();
const query = createWorkspaceQuery("projects", currentWorkspace.id);
```

### ❌ Ataque 2: Bypass via localStorage
```typescript
// Atacante: localStorage.setItem("currentWorkspaceId", "outro-workspace")
// Proteção: Validar membership no backend via RLS
```

### ❌ Ataque 3: SQL Injection via workspace_id
```typescript
// Atacante: workspace_id = "'; DROP TABLE projects; --"
// Proteção: Supabase escapa automaticamente + validação de UUID
```

### ❌ Ataque 4: Acesso via cache compartilhado
```typescript
// Proteção: Cache keys devem incluir workspace_id
const cacheKey = `projects-${workspaceId}`;
```

## Testes Manuais Recomendados

### Teste 1: Isolamento Básico
1. Login como User A em Workspace 1
2. Criar projeto "Projeto A"
3. Logout e login como User B em Workspace 2
4. Verificar que "Projeto A" NÃO aparece
5. Criar projeto "Projeto B"
6. Voltar para User A em Workspace 1
7. Verificar que "Projeto B" NÃO aparece

### Teste 2: Troca de Workspace
1. Login com um usuário membro de 2+ workspaces
2. Criar dados no Workspace 1
3. Trocar para Workspace 2
4. Verificar que dados do Workspace 1 NÃO aparecem
5. Criar dados no Workspace 2
6. Trocar de volta para Workspace 1
7. Verificar que apenas dados do Workspace 1 aparecem

### Teste 3: Tentativa de Acesso Não Autorizado
1. Obter ID de um projeto de outro workspace (via DB)
2. Tentar acessar `/projects/{id}` via URL direta
3. Verificar que acesso é negado ou redireciona

### Teste 4: Remoção de Membro
1. User A convida User B para Workspace
2. User B aceita e cria dados
3. User A remove User B do workspace
4. Logout e login como User B
5. Verificar que dados do workspace não aparecem mais

## Métricas de Segurança

### Cobertura de Testes
- ✅ Testes unitários: >90% coverage em funções críticas
- ⚠️ Testes de integração: Pendente (TODO)
- ⚠️ Testes E2E: Pendente (TODO)

### Performance
- Query com workspace filter: <100ms
- Troca de workspace: <200ms
- Invalidação de cache: <50ms

### Auditoria
- [ ] Revisar RLS policies mensalmente
- [ ] Verificar logs de acesso negado semanalmente
- [ ] Testar vetores de ataque trimestralmente
- [ ] Atualizar documentação quando adicionar tabelas

## Próximos Passos

### High Priority
1. Implementar testes de integração com database real
2. Adicionar logging de tentativas de acesso não autorizado
3. Criar dashboard de monitoramento de segurança

### Medium Priority
4. Implementar rate limiting por workspace
5. Adicionar alertas para padrões suspeitos
6. Criar relatório automático de auditoria

### Low Priority
7. Testes de performance sob carga
8. Testes de penetração automatizados
9. Compliance checks (GDPR, LGPD)

## Recursos Adicionais

- [MULTI_TENANT_ARCHITECTURE.md](../MULTI_TENANT_ARCHITECTURE.md) - Arquitetura completa
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Multi-Tenancy Guide](https://cheatsheetseries.owasp.org/cheatsheets/Multitenant_Security_Cheat_Sheet.html)

## Suporte

Para reportar problemas de segurança:
1. **NÃO** criar issue pública
2. Enviar para: security@[seu-dominio].com
3. Incluir: descrição detalhada + steps to reproduce
4. Aguardar confirmação antes de disclosure
