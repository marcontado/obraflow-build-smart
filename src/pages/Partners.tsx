import { useState, useEffect, useMemo } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { partnersService } from "@/services/partners.service";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { PartnerFormDialog } from "@/components/partners/PartnerFormDialog";
import { PartnerDetailModal } from "@/components/partners/PartnerDetailModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { PARTNER_CATEGORIES, type PartnerFormData } from "@/schemas/partner.schema";
import type { Database } from "@/integrations/supabase/types";

type Partner = Database["public"]["Tables"]["partners"]["Row"];

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function Partners() {
  const { currentWorkspace } = useWorkspace();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

  useEffect(() => {
    if (currentWorkspace) {
      fetchPartners();
    }
  }, [currentWorkspace]);

  const fetchPartners = async () => {
    if (!currentWorkspace) return;

    setLoading(true);
    const { data, error } = await partnersService.getAll(currentWorkspace.id);

    if (error) {
      toast.error("Erro ao carregar parceiros");
      console.error(error);
    } else {
      setPartners(data || []);
    }
    setLoading(false);
  };

  const filteredPartners = useMemo(() => {
    let filtered = partners;

    // Filtro de busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filtro de categoria
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    return filtered;
  }, [partners, searchQuery, selectedCategory]);

  const handleAddPartner = () => {
    setEditingPartner(null);
    setFormOpen(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setDetailOpen(false);
    setFormOpen(true);
  };

  const handleViewDetails = (partner: Partner) => {
    setSelectedPartner(partner);
    setDetailOpen(true);
  };

  const handleDeletePartner = (partner: Partner) => {
    setPartnerToDelete(partner);
    setDetailOpen(false);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!partnerToDelete || !currentWorkspace) return;

    const { error } = await partnersService.delete(partnerToDelete.id, currentWorkspace.id);

    if (error) {
      toast.error("Erro ao excluir parceiro");
      console.error(error);
    } else {
      toast.success("Parceiro excluído com sucesso");
      setPartners(partners.filter((p) => p.id !== partnerToDelete.id));
    }

    setDeleteOpen(false);
    setPartnerToDelete(null);
  };

  const handleSubmitForm = async (data: PartnerFormData) => {
    if (!currentWorkspace) return;

    if (editingPartner) {
      // Atualizar
      const { data: updated, error } = await partnersService.update(
        editingPartner.id,
        data,
        currentWorkspace.id
      );

      if (error) {
        toast.error("Erro ao atualizar parceiro");
        console.error(error);
      } else if (updated) {
        toast.success("Parceiro atualizado com sucesso");
        setPartners(partners.map((p) => (p.id === updated.id ? updated : p)));
      }
    } else {
      // Criar - garantir que campos required estão presentes
      const { data: created, error } = await partnersService.create(
        data as Required<Pick<PartnerFormData, "name" | "category">> & Partial<PartnerFormData>,
        currentWorkspace.id
      );

      if (error) {
        toast.error("Erro ao criar parceiro");
        console.error(error);
      } else if (created) {
        toast.success("Parceiro adicionado com sucesso");
        setPartners([...partners, created]);
      }
    }
  };

  const handleUpdateNotes = async (partnerId: string, notes: string) => {
    if (!currentWorkspace) return;

    const { data: updated, error } = await partnersService.update(
      partnerId,
      { notes },
      currentWorkspace.id
    );

    if (error) {
      toast.error("Erro ao atualizar notas");
      console.error(error);
    } else if (updated) {
      toast.success("Notas atualizadas com sucesso");
      setPartners(partners.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedPartner(updated);
    }
  };

  if (!currentWorkspace) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Parceiros e Fornecedores"
          subtitle="Gerencie seus parceiros e fornecedores"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {PARTNER_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleAddPartner} className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Parceiro
          </Button>
        </div>
      </div>

      {/* Grid de Parceiros */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filteredPartners.length === 0 ? (
        <EmptyState
          icon={Search}
          title={searchQuery ? "Nenhum parceiro encontrado" : "Nenhum parceiro cadastrado"}
          description={
            searchQuery
              ? "Tente buscar com outros termos"
              : "Adicione parceiros e fornecedores para gerenciar seus contatos profissionais"
          }
          actionLabel={!searchQuery ? "Adicionar Parceiro" : undefined}
          onAction={!searchQuery ? handleAddPartner : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredPartners.map((partner, index) => (
            <div
              key={partner.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <PartnerCard partner={partner} onViewDetails={handleViewDetails} />
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      <PartnerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmitForm}
        partner={editingPartner}
      />

      <PartnerDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        partner={selectedPartner}
        onEdit={handleEditPartner}
        onDelete={handleDeletePartner}
        onUpdateNotes={handleUpdateNotes}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Parceiro"
        description={`Tem certeza que deseja excluir ${partnerToDelete?.name}? Esta ação não pode ser desfeita.`}
      />
          </div>
        </main>
      </div>
    </div>
  );
}
