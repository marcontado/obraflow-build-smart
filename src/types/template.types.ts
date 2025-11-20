import type { Database } from "@/integrations/supabase/types";

export type DocumentTemplate = Database["public"]["Tables"]["document_templates"]["Row"];
export type DocumentTemplateInsert = Database["public"]["Tables"]["document_templates"]["Insert"];
export type DocumentTemplateUpdate = Database["public"]["Tables"]["document_templates"]["Update"];

export type GeneratedDocument = Database["public"]["Tables"]["generated_documents"]["Row"];
export type GeneratedDocumentInsert = Database["public"]["Tables"]["generated_documents"]["Insert"];

export type TemplateCategory = 'contrato' | 'proposta' | 'termo' | 'relatorio' | 'outro';

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'contrato', label: 'Contrato' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'termo', label: 'Termo' },
  { value: 'relatorio', label: 'Relatório' },
  { value: 'outro', label: 'Outro' },
];

export interface TemplateVariable {
  key: string;
  label: string;
  category: 'cliente' | 'projeto' | 'empresa' | 'data';
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  // Variáveis do Cliente
  { key: '{{cliente.nome_completo}}', label: 'Nome Completo', category: 'cliente' },
  { key: '{{cliente.telefone}}', label: 'Telefone', category: 'cliente' },
  { key: '{{cliente.email}}', label: 'E-mail', category: 'cliente' },
  { key: '{{cliente.endereco}}', label: 'Endereço', category: 'cliente' },
  { key: '{{cliente.cidade}}', label: 'Cidade', category: 'cliente' },
  { key: '{{cliente.estado}}', label: 'Estado', category: 'cliente' },
  
  // Variáveis do Projeto
  { key: '{{projeto.nome}}', label: 'Nome do Projeto', category: 'projeto' },
  { key: '{{projeto.endereco}}', label: 'Endereço', category: 'projeto' },
  { key: '{{projeto.data_inicio}}', label: 'Data de Início', category: 'projeto' },
  { key: '{{projeto.data_conclusao}}', label: 'Data de Conclusão', category: 'projeto' },
  { key: '{{projeto.orcamento}}', label: 'Orçamento', category: 'projeto' },
  { key: '{{projeto.tipo}}', label: 'Tipo', category: 'projeto' },
  { key: '{{projeto.descricao}}', label: 'Descrição', category: 'projeto' },
  
  // Variáveis da Empresa
  { key: '{{empresa.nome}}', label: 'Nome da Empresa', category: 'empresa' },
  { key: '{{empresa.endereco}}', label: 'Endereço', category: 'empresa' },
  { key: '{{empresa.telefone}}', label: 'Telefone', category: 'empresa' },
  
  // Variáveis de Data/Tempo
  { key: '{{data.hoje}}', label: 'Data de Hoje', category: 'data' },
  { key: '{{data.mes}}', label: 'Mês Atual', category: 'data' },
  { key: '{{data.ano}}', label: 'Ano Atual', category: 'data' },
];

export interface SignatureField {
  id: string;
  type: 'cliente' | 'responsavel' | 'terceiro';
  label: string;
  name?: string;
  signatureData?: string;
  date?: string;
}

export interface TemplateContent {
  blocks: ContentBlock[];
}

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'list' | 'signature' | 'pagebreak';
  content: string;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    align?: 'left' | 'center' | 'right' | 'justify';
  };
  signatureField?: SignatureField;
}
