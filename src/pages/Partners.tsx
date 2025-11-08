import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export interface Partner {
  id: string;
  name: string;
  category: string;
  contact: string;
  location?: string;
  rating?: number;
  logoUrl?: string;
  status?: "ativo" | "inativo";
  specialties?: string[];
  notes?: string;
}

const mockPartners: Partner[] = [
  {
    id: "1",
    name: "Construtora Alpha",
    category: "Materiais de Construção",
    contact: "(11) 99999-8888",
    location: "São Paulo, SP",
    rating: 4.7,
    logoUrl: "https://placehold.co/48x48",
    status: "ativo",
    specialties: ["Cimento", "Areia", "Blocos"],
    notes: "Entrega rápida e preço competitivo."
  },
  {
    id: "2",
    name: "Elétrica Luz",
    category: "Serviços Elétricos",
    contact: "(11) 98888-7777",
    location: "Guarulhos, SP",
    rating: 4.9,
    logoUrl: "https://placehold.co/48x48",
    status: "ativo",
    specialties: ["Instalação", "Manutenção"],
    notes: "Especialista em obras residenciais."
  },
  {
    id: "3",
    name: "Pinturas Brasil",
    category: "Pintura",
    contact: "(11) 97777-6666",
    location: "Osasco, SP",
    rating: 4.5,
    logoUrl: "https://placehold.co/48x48",
    status: "inativo",
    specialties: ["Pintura interna", "Textura"],
    notes: "Disponível apenas para grandes projetos."
  }
];

const PartnerCard: React.FC<{ partner: Partner }> = ({ partner }) => (
  <div className="flex gap-4 items-center p-5 bg-card rounded-xl shadow-elegant mb-6 border border-border hover:shadow-lg transition-all">
    <img src={partner.logoUrl} alt={partner.name} className="w-14 h-14 rounded-full object-cover border border-accent/30" />
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-heading font-bold text-xl text-foreground">{partner.name}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${partner.status === "ativo" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{partner.status}</span>
      </div>
      <div className="text-sm text-muted-foreground mb-2">{partner.category} • {partner.location}</div>
      <div className="flex flex-wrap gap-2 text-xs mb-2">
        {partner.specialties?.map((spec, i) => (
          <span key={i} className="px-2 py-1 rounded bg-accent/10 text-accent font-medium">{spec}</span>
        ))}
      </div>
      <div className="text-sm mb-1">Contato: <span className="font-medium text-primary">{partner.contact}</span></div>
      <div className="text-xs text-yellow-700">Avaliação: <span className="font-semibold">{partner.rating} ⭐</span></div>
      {partner.notes && <div className="text-xs text-muted-foreground mt-2 italic">{partner.notes}</div>}
    </div>
    <Button size="sm" variant="outline" className="font-semibold">Ver detalhes</Button>
  </div>
);

const PartnersPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const categories = [
    { value: "all", label: "Todas as categorias" },
    { value: "Materiais de Construção", label: "Materiais de Construção" },
    { value: "Serviços Elétricos", label: "Serviços Elétricos" },
    { value: "Pintura", label: "Pintura" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="font-heading text-3xl font-bold mb-8 text-primary">Parceiros e Fornecedores</h1>
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <Input className="w-full md:w-72" placeholder="Buscar por nome ou categoria..." />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-56 bg-background border border-border rounded px-3 py-2 text-foreground shadow-elegant">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent className="bg-card border border-border rounded shadow-elegant">
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value} className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-muted hover:text-foreground">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="w-full md:w-auto font-semibold shadow-elegant">Adicionar Parceiro</Button>
      </div>
      {mockPartners.map(partner => (
        <PartnerCard key={partner.id} partner={partner} />
      ))}
    </div>
  );
};

export default PartnersPage;
