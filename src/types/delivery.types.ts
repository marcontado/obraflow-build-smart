import type { Database } from "@/integrations/supabase/types";

export type ProjectDelivery = Database["public"]["Tables"]["project_deliveries"]["Row"];
export type ProjectDeliveryInsert = Database["public"]["Tables"]["project_deliveries"]["Insert"];
export type ProjectDeliveryUpdate = Database["public"]["Tables"]["project_deliveries"]["Update"];

export interface ProjectDeliveryWithRelations extends ProjectDelivery {
  budget_item?: {
    id: string;
    item_name: string;
  } | null;
  area?: {
    id: string;
    name: string;
  } | null;
  created_by_profile?: {
    id: string;
    full_name: string;
  } | null;
}

export const deliveryStatus = [
  { value: "recebido", label: "Recebido", color: "bg-blue-500" },
  { value: "conferido", label: "Conferido", color: "bg-yellow-500" },
  { value: "armazenado", label: "Armazenado", color: "bg-purple-500" },
  { value: "aplicado", label: "Aplicado", color: "bg-green-500" },
] as const;

export interface DeliveryPhoto {
  url: string;
  name: string;
  uploadedAt: string;
}

export interface DeliveryAttachment {
  url: string;
  name: string;
  type: string;
  size?: number;
  uploadedAt: string;
}
