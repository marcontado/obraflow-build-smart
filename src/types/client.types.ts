import type { Database } from "@/integrations/supabase/types";

export type ClientType = "PF" | "PJ";

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ClientRepresentative = Database["public"]["Tables"]["client_representatives"]["Row"];

export interface ClientWithType {
  id: string;
  workspace_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
  cpf: string | null;
  rg: string | null;
  nationality: string | null;
  occupation: string | null;
  marital_status: string | null;
  
  // Campos PF/PJ
  client_type: ClientType;
  cnpj?: string | null;
  razao_social?: string | null;
  inscricao_estadual?: string | null;
  inscricao_municipal?: string | null;
}

export interface ClientWithRepresentatives extends ClientWithType {
  representatives?: ClientRepresentative[];
}

export const clientTypeLabels: Record<ClientType, string> = {
  PF: "Pessoa Física",
  PJ: "Pessoa Jurídica",
};

export const maritalStatusOptions = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "uniao_estavel", label: "União Estável" },
];
