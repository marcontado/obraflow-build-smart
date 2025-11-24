import { supabase } from "@/integrations/supabase/client";
import type { ClientRepresentative } from "@/types/client.types";

export const clientRepresentativesService = {
  /**
   * Buscar representantes de uma PJ
   */
  async getByCompany(companyClientId: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("client_representatives")
      .select(`
        *,
        representative:clients!representative_client_id(
          id,
          name,
          cpf,
          email,
          phone
        )
      `)
      .eq("company_client_id", companyClientId)
      .eq("workspace_id", workspaceId)
      .order("is_primary", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Adicionar representante a uma PJ
   */
  async create(data: {
    company_client_id: string;
    representative_client_id: string;
    workspace_id: string;
    role?: string;
    is_primary?: boolean;
  }) {
    const { data: result, error } = await supabase
      .from("client_representatives")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  /**
   * Atualizar representante
   */
  async update(
    id: string,
    updates: Partial<ClientRepresentative>,
    workspaceId: string
  ) {
    const { data, error } = await supabase
      .from("client_representatives")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remover representante
   */
  async delete(id: string, workspaceId: string) {
    const { error } = await supabase
      .from("client_representatives")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);

    if (error) throw error;
  },

  /**
   * Definir representante como principal
   */
  async setPrimary(
    representativeId: string,
    companyClientId: string,
    workspaceId: string
  ) {
    // Primeiro, remover is_primary de todos os outros
    await supabase
      .from("client_representatives")
      .update({ is_primary: false })
      .eq("company_client_id", companyClientId)
      .eq("workspace_id", workspaceId);

    // Depois, definir o selecionado como primary
    const { data, error } = await supabase
      .from("client_representatives")
      .update({ is_primary: true })
      .eq("id", representativeId)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Vincular múltiplos representantes a uma PJ
   */
  async bulkCreate(
    companyClientId: string,
    representativeIds: string[],
    workspaceId: string
  ) {
    const records = representativeIds.map((repId, index) => ({
      company_client_id: companyClientId,
      representative_client_id: repId,
      workspace_id: workspaceId,
      is_primary: index === 0, // Primeiro é o principal
    }));

    const { data, error } = await supabase
      .from("client_representatives")
      .insert(records)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Sincronizar representantes (remove os antigos e adiciona novos)
   */
  async sync(
    companyClientId: string,
    representativeIds: string[],
    workspaceId: string
  ) {
    // Buscar representantes atuais
    const { data: current } = await supabase
      .from("client_representatives")
      .select("id, representative_client_id")
      .eq("company_client_id", companyClientId)
      .eq("workspace_id", workspaceId);

    const currentIds = new Set(current?.map(r => r.representative_client_id) || []);
    const newIds = new Set(representativeIds);

    // Remover os que não estão mais na lista
    const toRemove = current?.filter(r => !newIds.has(r.representative_client_id)) || [];
    for (const rep of toRemove) {
      await this.delete(rep.id, workspaceId);
    }

    // Adicionar os novos
    const toAdd = representativeIds.filter(id => !currentIds.has(id));
    if (toAdd.length > 0) {
      await this.bulkCreate(companyClientId, toAdd, workspaceId);
    }
  },
};
