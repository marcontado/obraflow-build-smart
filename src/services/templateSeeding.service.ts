import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_TEMPLATES } from "@/data/defaultTemplates";

class TemplateSeedingService {
  /**
   * Verifica se o workspace já possui templates.
   * Retorna true se já existem templates (incluindo os padrão).
   */
  async hasTemplates(workspaceId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("document_templates")
      .select("id")
      .eq("workspace_id", workspaceId)
      .limit(1);

    if (error) {
      console.error("Erro ao verificar templates existentes:", error);
      return false;
    }

    return (data?.length || 0) > 0;
  }

  /**
   * Cria os templates padrão para um workspace.
   * Esta função é idempotente - só cria se não existirem templates ainda.
   */
  async seedDefaultTemplates(workspaceId: string): Promise<void> {
    try {
      // Verificar se já existem templates
      const hasExisting = await this.hasTemplates(workspaceId);
      if (hasExisting) {
        console.log("Workspace já possui templates, pulando seeding.");
        return;
      }

      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Preparar templates para inserção
      const templatesToInsert = DEFAULT_TEMPLATES.map((template) => {
        // Extrair variáveis usadas do conteúdo
        const variablesUsed = this.extractVariablesFromContent(template.content);
        
        // Extrair assinaturas
        const signatures = template.content.blocks
          .filter((b) => b.type === "signature")
          .map((b) => b.signatureField);

        return {
          workspace_id: workspaceId,
          name: template.name,
          category: template.category,
          content: template.content as any,
          variables_used: variablesUsed,
          signatures: signatures as any,
          created_by: user.id,
        };
      });

      // Inserir todos os templates de uma vez
      const { error } = await supabase
        .from("document_templates")
        .insert(templatesToInsert);

      if (error) {
        throw error;
      }

      console.log(`${templatesToInsert.length} templates padrão criados com sucesso para workspace ${workspaceId}`);
    } catch (error) {
      console.error("Erro ao criar templates padrão:", error);
      throw error;
    }
  }

  /**
   * Extrai todas as variáveis usadas no conteúdo do template.
   */
  private extractVariablesFromContent(content: any): string[] {
    const variables = new Set<string>();
    const regex = /\{\{[^}]+\}\}/g;

    if (content?.blocks && Array.isArray(content.blocks)) {
      content.blocks.forEach((block: any) => {
        const matches = block.content?.match(regex);
        if (matches) {
          matches.forEach((match: string) => variables.add(match));
        }

        // Também verificar nas assinaturas
        if (block.signatureField?.label) {
          const sigMatches = block.signatureField.label.match(regex);
          if (sigMatches) {
            sigMatches.forEach((match: string) => variables.add(match));
          }
        }
      });
    }

    return Array.from(variables);
  }

  /**
   * Verifica se um template é um template padrão pelo nome.
   */
  isDefaultTemplate(templateName: string): boolean {
    return DEFAULT_TEMPLATES.some((t) => t.name === templateName);
  }
}

export const templateSeedingService = new TemplateSeedingService();
