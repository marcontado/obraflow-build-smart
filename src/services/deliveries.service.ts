import { supabase } from "@/integrations/supabase/client";
import type { 
  ProjectDeliveryInsert, 
  ProjectDeliveryUpdate,
  ProjectDeliveryWithRelations 
} from "@/types/delivery.types";

export const deliveriesService = {
  /**
   * Buscar todas as entregas de um projeto
   */
  async getByProject(projectId: string, workspaceId: string) {
    const { data, error } = await supabase
      .from("project_deliveries")
      .select(`
        *,
        budget_item:budget_items(id, item_name),
        area:project_areas(id, name),
        created_by_profile:profiles(id, full_name)
      `)
      .eq("project_id", projectId)
      .eq("workspace_id", workspaceId)
      .order("delivery_date", { ascending: false });

    if (error) throw error;
    return data as ProjectDeliveryWithRelations[];
  },

  /**
   * Criar nova entrega
   */
  async create(delivery: ProjectDeliveryInsert) {
    const { data, error } = await supabase
      .from("project_deliveries")
      .insert(delivery)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Atualizar entrega existente
   */
  async update(id: string, updates: ProjectDeliveryUpdate, workspaceId: string) {
    const { data, error } = await supabase
      .from("project_deliveries")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deletar entrega
   */
  async delete(id: string, workspaceId: string) {
    const { error } = await supabase
      .from("project_deliveries")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);

    if (error) throw error;
  },

  /**
   * Upload de foto de entrega
   */
  async uploadPhoto(file: File, userId: string, deliveryId: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${deliveryId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("delivery-photos")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("delivery-photos")
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  /**
   * Upload de anexo de entrega
   */
  async uploadAttachment(file: File, userId: string, deliveryId: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${deliveryId}/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from("delivery-attachments")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("delivery-attachments")
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  /**
   * Deletar foto do storage
   */
  async deletePhoto(photoUrl: string) {
    const path = photoUrl.split("/delivery-photos/")[1];
    if (!path) return;

    const { error } = await supabase.storage
      .from("delivery-photos")
      .remove([path]);

    if (error) throw error;
  },

  /**
   * Deletar anexo do storage
   */
  async deleteAttachment(attachmentUrl: string) {
    const path = attachmentUrl.split("/delivery-attachments/")[1];
    if (!path) return;

    const { error } = await supabase.storage
      .from("delivery-attachments")
      .remove([path]);

    if (error) throw error;
  },
};
