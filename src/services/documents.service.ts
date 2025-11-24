import { supabase } from "@/integrations/supabase/client";
import { createWorkspaceQuery } from "@/lib/workspace-query";
import type { GeneratedDocumentInsert } from "@/types/template.types";
import type { Client } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

class DocumentsService {
  async getAll(workspaceId: string, projectId?: string) {
    let query = supabase
      .from("generated_documents")
      .select("*, document_templates(name), projects(name), clients!generated_documents_client_id_fkey(name)")
      .eq("workspace_id", workspaceId);
    
    if (projectId) {
      query = query.eq("project_id", projectId);
    }
    
    return query.order("created_at", { ascending: false });
  }

  async getById(id: string, workspaceId: string) {
    return supabase
      .from("generated_documents")
      .select("*, document_templates(*), projects(*), clients!generated_documents_client_id_fkey(*)")
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .single();
  }

  async create(document: Omit<GeneratedDocumentInsert, "workspace_id" | "created_by">, workspaceId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    return supabase
      .from("generated_documents")
      .insert({
        ...document,
        client_id: document.client_id || null,
        project_id: document.project_id || null,
        workspace_id: workspaceId,
        created_by: user?.id,
      })
      .select()
      .single();
  }

  async delete(id: string, workspaceId: string) {
    return supabase
      .from("generated_documents")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);
  }

  // Substitui variáveis no conteúdo do template
  replaceVariables(
    content: any,
    client?: Client | null,
    project?: any | null
  ): any {
    const replaceInString = (str: string): string => {
      let result = str;

      // Variáveis do cliente
      if (client) {
        result = result.replace(/\{\{cliente\.nome_completo\}\}/g, client.name || '');
        result = result.replace(/\{\{cliente\.telefone\}\}/g, client.phone || '');
        result = result.replace(/\{\{cliente\.email\}\}/g, client.email || '');
        result = result.replace(/\{\{cliente\.endereco\}\}/g, client.address || '');
        result = result.replace(/\{\{cliente\.cidade\}\}/g, client.city || '');
        result = result.replace(/\{\{cliente\.estado\}\}/g, client.state || '');
      }

      // Variáveis do projeto
      if (project) {
        result = result.replace(/\{\{projeto\.nome\}\}/g, project.name || '');
        result = result.replace(/\{\{projeto\.endereco\}\}/g, project.location || '');
        result = result.replace(/\{\{projeto\.data_inicio\}\}/g, project.start_date ? format(new Date(project.start_date), "dd/MM/yyyy", { locale: ptBR }) : '');
        result = result.replace(/\{\{projeto\.data_conclusao\}\}/g, project.end_date ? format(new Date(project.end_date), "dd/MM/yyyy", { locale: ptBR }) : '');
        result = result.replace(/\{\{projeto\.orcamento\}\}/g, project.budget ? `R$ ${project.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '');
        result = result.replace(/\{\{projeto\.tipo\}\}/g, project.type || '');
        result = result.replace(/\{\{projeto\.descricao\}\}/g, project.description || '');
      }

      // Variáveis de data
      const hoje = new Date();
      result = result.replace(/\{\{data\.hoje\}\}/g, format(hoje, "dd/MM/yyyy", { locale: ptBR }));
      result = result.replace(/\{\{data\.mes\}\}/g, format(hoje, "MMMM", { locale: ptBR }));
      result = result.replace(/\{\{data\.ano\}\}/g, format(hoje, "yyyy"));

      // Variáveis da empresa (placeholder - pode ser configurado depois)
      result = result.replace(/\{\{empresa\.nome\}\}/g, 'Archestra');
      result = result.replace(/\{\{empresa\.endereco\}\}/g, '');
      result = result.replace(/\{\{empresa\.telefone\}\}/g, '');

      return result;
    };

    // Se o conteúdo tem blocks, processa cada block
    if (content?.blocks && Array.isArray(content.blocks)) {
      return {
        ...content,
        blocks: content.blocks.map((block: any) => ({
          ...block,
          content: replaceInString(block.content || ''),
        })),
      };
    }

    // Se for string simples
    if (typeof content === 'string') {
      return replaceInString(content);
    }

    return content;
  }
}

export const documentsService = new DocumentsService();
