# Testes de Isolamento Multi-Tenant

Esta pasta contém testes automatizados para validar o isolamento de dados entre workspaces.

## 🎯 Objetivo

Garantir que dados de um workspace **NUNCA** sejam acessíveis por usuários de outro workspace, prevenindo vazamento de dados e garantindo compliance com GDPR/LGPD.

## 📁 Estrutura

```
__tests__/
├── multi-tenant-isolation.test.tsx  # Testes de isolamento
├── button.test.tsx                   # Testes de componentes
├── utils.test.ts                     # Testes de utilitários
└── README.md                         # Esta documentação
```

## 🚀 Executando os Testes

### Todos os testes
```bash
npm run test
```

### Apenas testes de isolamento
```bash
npm run test multi-tenant-isolation
```

### Com cobertura
```bash
npm run test:coverage
```

### Watch mode (desenvolvimento)
```bash
npm run test:watch
```

## 📊 Cobertura Atual

### ✅ Testes Implementados

1. **Workspace Query Helper Security** (100%)
   - ✅ Previne queries sem workspace_id
   - ✅ Valida formato de workspace_id
   - ✅ Garante filtro automático por workspace

2. **Service Layer Isolation** (100%)
   - ✅ Requer workspace_id em operações create
   - ✅ Valida formato de IDs
   - ✅ Previne operações sem contexto

3. **Cross-Workspace Access Prevention** (100%)
   - ✅ Isola queries entre workspaces
   - ✅ Previne manipulação de workspace_id
   - ✅ Testa operações em lote

4. **RLS Policy Validation** (Documentado)
   - ✅ Documenta políticas esperadas
   - ✅ Lista tabelas que precisam RLS
   - ✅ Define padrões de segurança

5. **Cache Invalidation** (100%)
   - ✅ Testa evento de troca de workspace
   - ✅ Valida separação de cache keys

6. **Authentication & Authorization** (Documentado)
   - ✅ Documenta requisitos de autenticação
   - ✅ Valida checagens de membership
   - ✅ Previne escalação de privilégios

7. **Data Leakage Prevention** (100%)
   - ✅ Valida sanitização de erros
   - ✅ Testa injeção SQL
   - ✅ Verifica exposição de dados sensíveis

8. **Edge Cases** (100%)
   - ✅ Operações concorrentes
   - ✅ Limpeza em deleção
   - ✅ Prevenção de registros órfãos

9. **Performance & Scalability** (Documentado)
   - ✅ Documenta necessidade de índices
   - ✅ Valida queries eficientes

### ⚠️ Testes Pendentes (TODO)

Estes testes requerem setup de banco de dados de teste:

- [ ] Cross-workspace data access com DB real
- [ ] Verificação de RLS policies ativas
- [ ] Testes de CASCADE deletes
- [ ] Validação de roles (owner, admin, member)
- [ ] Testes de concorrência real
- [ ] Invalidação de cache em produção

## 🔒 Checklist de Segurança

Antes de fazer deploy, verifique:

- [ ] Todos os testes passando (`npm run test`)
- [ ] RLS ativo em todas as tabelas workspace-scoped
- [ ] Funções `is_workspace_member()` e `has_workspace_role()` existem
- [ ] workspace_id é NOT NULL em todas as tabelas relevantes
- [ ] Foreign keys têm ON DELETE CASCADE
- [ ] Índices criados em workspace_id para performance
- [ ] Nenhum registro órfão no banco
- [ ] Cache keys incluem workspace_id
- [ ] Componentes usam `withWorkspaceGuard` quando necessário

## 🐛 Debugging Testes Falhos

### Erro: "workspace_id required"
```typescript
// ❌ Errado
const query = supabase.from("projects").select("*");

// ✅ Correto
const query = createWorkspaceQuery("projects", workspaceId);
```

### Erro: "SECURITY ERROR"
```typescript
// ❌ Errado
createWorkspaceQuery("projects", undefined);

// ✅ Correto
const { currentWorkspace } = useWorkspace();
createWorkspaceQuery("projects", currentWorkspace.id);
```

### Erro: "Type instantiation is excessively deep"
```typescript
// ❌ Evite encadeamentos longos
const query = createWorkspaceQuery("projects", id)
  .eq("status", "active")
  .order("created_at")
  .limit(10);

// ✅ Faça operações separadamente
const query = createWorkspaceQuery("projects", id);
const filtered = query.eq("status", "active");
```

## 📚 Recursos Adicionais

- [Multi-Tenant Architecture](../../MULTI_TENANT_ARCHITECTURE.md)
- [Multi-Tenant Testing Guide](../../docs/MULTI_TENANT_TESTING.md)
- [Security Validation Script](../../scripts/validate-multi-tenant-security.ts)

## 🤝 Contribuindo

Ao adicionar novos testes:

1. Siga o padrão existente (describe/it structure)
2. Adicione comentários explicando O QUE e POR QUE
3. Use nomes descritivos para os testes
4. Teste casos positivos E negativos
5. Documente edge cases importantes

### Template de Teste

```typescript
describe("Feature Name", () => {
  it("should prevent security issue X", () => {
    // Arrange: Setup test data
    const workspaceId = "test-workspace-id";
    
    // Act: Execute the action
    const query = createWorkspaceQuery("projects", workspaceId);
    
    // Assert: Verify expected behavior
    expect(query.toString()).toContain(workspaceId);
  });
});
```

## 📞 Suporte

Para questões sobre testes de segurança:
1. Verificar [MULTI_TENANT_ARCHITECTURE.md](../../MULTI_TENANT_ARCHITECTURE.md)
2. Consultar [documentação de testes](../../docs/MULTI_TENANT_TESTING.md)
3. Abrir issue com label `security` e `testing`

---

**⚠️ IMPORTANTE:** Estes testes são CRÍTICOS para segurança. Nunca desabilite ou ignore falhas nos testes de isolamento multi-tenant.
