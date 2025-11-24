export const projectTypes = [
  { value: 'residential', label: 'Residencial' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'corporate', label: 'Corporativo' },
  { value: 'interior', label: 'Interiores' },
  { value: 'renovation', label: 'Reforma' },
  { value: 'other', label: 'Outros' },
] as const;

export const technicalFileCategories = [
  { value: 'floor_plan', label: 'Planta Baixa' },
  { value: 'elevation', label: 'Corte / Elevação' },
  { value: 'render', label: 'Render / Perspectiva' },
  { value: 'layout', label: 'Layout de Mobiliário' },
  { value: 'other', label: 'Outros' },
] as const;

export const moodboardCategories = [
  { value: 'reference', label: 'Referência Geral' },
  { value: 'colors', label: 'Paleta de Cores' },
  { value: 'furniture', label: 'Mobiliário' },
  { value: 'materials', label: 'Materiais e Texturas' },
  { value: 'lighting', label: 'Iluminação' },
  { value: 'decor', label: 'Decoração' },
  { value: 'layout', label: 'Layout e Distribuição' },
  { value: 'other', label: 'Outros' },
] as const;

export const styleOptions = [
  'Moderno',
  'Industrial',
  'Clássico',
  'Minimalista',
  'Contemporâneo',
  'Rústico',
  'Escandinavo',
  'Tropical',
  'Eclético',
  'Art Déco',
] as const;

export interface MoodboardItem {
  url: string;
  description?: string;
  tags?: string[];
  file_name?: string;
  category?: string;
}

export interface SitePhoto {
  url: string;
  date?: string;
  area?: string;
  labels?: string[];
  description?: string;
  file_name: string;
}

export interface TechnicalFile {
  file_url: string;
  category: string;
  notes?: string;
  file_name: string;
  file_size?: number;
}

export interface BriefingData {
  goal?: string;
  styles?: string[];
  audience?: string;
  needs?: string;
  restrictions?: string;
  preferred_materials?: string;
  references_links?: string;
  client_profile?: string;
  client_desires?: string;
  client_pains?: string;
  client_essence?: string;
  client_objectives?: string;
  field_research?: string;
}
