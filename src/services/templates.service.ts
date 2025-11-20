import { createWorkspaceQuery } from "@/lib/workspace-query";
import { supabase } from "@/integrations/supabase/client";
import type { 
  DocumentTemplateInsert, 
  DocumentTemplateUpdate,
  TemplateCategory 
} from "@/types/template.types";

class TemplatesService {
  async getAll(workspaceId: string, category?: TemplateCategory) {
    let query = supabase
      .from("document_templates")
      .select("*")
      .eq("workspace_id", workspaceId);
    
    if (category) {
      query = query.eq("category", category);
    }
    
    return query.order("updated_at", { ascending: false });
  }

  async getById(id: string, workspaceId: string) {
    return supabase
      .from("document_templates")
      .select("*")
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .single();
  }

  async create(template: Omit<DocumentTemplateInsert, "workspace_id" | "created_by">, workspaceId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    return supabase
      .from("document_templates")
      .insert({
        ...template,
        workspace_id: workspaceId,
        created_by: user?.id,
      })
      .select()
      .single();
  }

  async update(id: string, updates: DocumentTemplateUpdate, workspaceId: string) {
    return supabase
      .from("document_templates")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();
  }

  async delete(id: string, workspaceId: string) {
    return supabase
      .from("document_templates")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);
  }

  async duplicate(id: string, workspaceId: string) {
    const { data: template, error } = await this.getById(id, workspaceId);
    
    if (error || !template) {
      return { data: null, error: error || new Error("Template não encontrado") };
    }

    return this.create(
      {
        name: `${template.name} (Cópia)`,
        category: template.category as any,
        content: template.content,
        variables_used: template.variables_used,
        signatures: template.signatures,
      },
      workspaceId
    );
  }
}

export const templatesService = new TemplatesService();
