#!/usr/bin/env tsx

/**
 * Script de validação de segurança multi-tenant
 * 
 * Executa checagens automáticas no banco de dados para verificar
 * que todas as medidas de segurança estão implementadas corretamente.
 * 
 * Uso:
 *   npm run security:check
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas');
  console.error('Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface SecurityCheck {
  name: string;
  description: string;
  check: () => Promise<{ passed: boolean; details?: string }>;
  critical: boolean;
}

const securityChecks: SecurityCheck[] = [
  {
    name: 'RLS Enabled on All Tables',
    description: 'Verifica que Row Level Security está ativo em todas as tabelas workspace-scoped',
    critical: true,
    check: async () => {
      const requiredTables = [
        'projects',
        'clients',
        'tasks',
        'project_areas',
        'project_activities',
        'partners',
        'document_templates',
        'generated_documents',
        'workspaces',
        'workspace_members'
      ];

      const { data, error } = await supabase
        .rpc('check_rls_enabled', { table_names: requiredTables })
        .single();

      if (error) {
        return { 
          passed: false, 
          details: `Erro ao verificar RLS: ${error.message}` 
        };
      }

      const tablesWithoutRLS = requiredTables.filter(
        table => !data?.includes(table)
      );

      if (tablesWithoutRLS.length > 0) {
        return {
          passed: false,
          details: `Tabelas sem RLS: ${tablesWithoutRLS.join(', ')}`
        };
      }

      return { passed: true };
    }
  },
  
  {
    name: 'workspace_id NOT NULL',
    description: 'Verifica que workspace_id é obrigatório em todas as tabelas',
    critical: true,
    check: async () => {
      const requiredTables = [
        'projects',
        'clients',
        'tasks',
        'project_areas',
        'project_activities',
        'partners',
        'document_templates',
        'generated_documents'
      ];

      // Verifica no schema que workspace_id é NOT NULL
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('table_name, is_nullable')
        .eq('column_name', 'workspace_id')
        .in('table_name', requiredTables);

      if (error) {
        return {
          passed: false,
          details: `Erro ao verificar colunas: ${error.message}`
        };
      }

      const nullableTables = data
        ?.filter(row => row.is_nullable === 'YES')
        .map(row => row.table_name) || [];

      if (nullableTables.length > 0) {
        return {
          passed: false,
          details: `Tabelas com workspace_id nullable: ${nullableTables.join(', ')}`
        };
      }

      return { passed: true };
    }
  },

  {
    name: 'CASCADE Deletes on workspace_id',
    description: 'Verifica que todas as foreign keys têm ON DELETE CASCADE',
    critical: true,
    check: async () => {
      // Verificar foreign keys
      const { data, error } = await supabase
        .rpc('check_cascade_deletes');

      if (error) {
        return {
          passed: false,
          details: `Erro ao verificar CASCADE: ${error.message}`
        };
      }

      const missingCascade = data?.filter(
        (fk: any) => fk.delete_rule !== 'CASCADE'
      ) || [];

      if (missingCascade.length > 0) {
        return {
          passed: false,
          details: `Foreign keys sem CASCADE: ${missingCascade.map((fk: any) => fk.constraint_name).join(', ')}`
        };
      }

      return { passed: true };
    }
  },

  {
    name: 'Indexes on workspace_id',
    description: 'Verifica que existem índices em workspace_id para performance',
    critical: false,
    check: async () => {
      const requiredTables = [
        'projects',
        'clients',
        'tasks',
        'project_areas',
        'project_activities',
        'partners'
      ];

      const { data, error } = await supabase
        .rpc('check_workspace_indexes', { table_names: requiredTables });

      if (error) {
        return {
          passed: false,
          details: `Erro ao verificar índices: ${error.message}`
        };
      }

      const tablesWithoutIndex = requiredTables.filter(
        table => !data?.includes(table)
      );

      if (tablesWithoutIndex.length > 0) {
        return {
          passed: false,
          details: `Tabelas sem índice em workspace_id: ${tablesWithoutIndex.join(', ')}`
        };
      }

      return { passed: true };
    }
  },

  {
    name: 'Security Definer Functions',
    description: 'Verifica que funções de segurança existem',
    critical: true,
    check: async () => {
      const requiredFunctions = [
        'is_workspace_member',
        'has_workspace_role',
        'is_platform_admin'
      ];

      const { data, error } = await supabase
        .rpc('list_functions')
        .in('function_name', requiredFunctions);

      if (error) {
        return {
          passed: false,
          details: `Erro ao verificar funções: ${error.message}`
        };
      }

      const missingFunctions = requiredFunctions.filter(
        fn => !data?.find((row: any) => row.function_name === fn)
      );

      if (missingFunctions.length > 0) {
        return {
          passed: false,
          details: `Funções não encontradas: ${missingFunctions.join(', ')}`
        };
      }

      return { passed: true };
    }
  },

  {
    name: 'No Orphaned Records',
    description: 'Verifica que não existem registros sem workspace válido',
    critical: true,
    check: async () => {
      const tables = [
        'projects',
        'clients',
        'tasks',
        'partners'
      ];

      const orphanedCounts: { table: string; count: number }[] = [];

      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .is('workspace_id', null);

        if (error) {
          return {
            passed: false,
            details: `Erro ao verificar ${table}: ${error.message}`
          };
        }

        if (count && count > 0) {
          orphanedCounts.push({ table, count });
        }
      }

      if (orphanedCounts.length > 0) {
        return {
          passed: false,
          details: `Registros órfãos encontrados: ${orphanedCounts.map(o => `${o.table}(${o.count})`).join(', ')}`
        };
      }

      return { passed: true };
    }
  }
];

async function runSecurityChecks() {
  console.log('🔒 Iniciando validação de segurança multi-tenant...\n');

  let passedCount = 0;
  let failedCount = 0;
  let criticalFailures = 0;

  for (const check of securityChecks) {
    process.stdout.write(`⏳ ${check.name}... `);
    
    try {
      const result = await check.check();
      
      if (result.passed) {
        console.log('✅ PASSOU');
        passedCount++;
      } else {
        console.log(`❌ FALHOU ${check.critical ? '(CRÍTICO)' : ''}`);
        if (result.details) {
          console.log(`   ${result.details}`);
        }
        failedCount++;
        if (check.critical) {
          criticalFailures++;
        }
      }
    } catch (error: any) {
      console.log(`⚠️ ERRO`);
      console.log(`   ${error.message}`);
      failedCount++;
      if (check.critical) {
        criticalFailures++;
      }
    }
    
    console.log(`   ${check.description}\n`);
  }

  console.log('━'.repeat(60));
  console.log(`\n📊 Resultado:`);
  console.log(`   ✅ Passou: ${passedCount}`);
  console.log(`   ❌ Falhou: ${failedCount}`);
  console.log(`   🚨 Falhas Críticas: ${criticalFailures}\n`);

  if (criticalFailures > 0) {
    console.log('🚨 ATENÇÃO: Falhas críticas de segurança detectadas!');
    console.log('   O sistema NÃO está seguro para produção.');
    console.log('   Corrija os problemas antes de fazer deploy.\n');
    process.exit(1);
  } else if (failedCount > 0) {
    console.log('⚠️ Avisos de segurança detectados.');
    console.log('   Recomenda-se corrigir antes de produção.\n');
    process.exit(0);
  } else {
    console.log('✅ Todas as verificações de segurança passaram!');
    console.log('   Sistema pronto para produção.\n');
    process.exit(0);
  }
}

// Executar verificações
runSecurityChecks().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});
