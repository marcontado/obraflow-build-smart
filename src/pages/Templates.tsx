import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";
import { templatesService } from "@/services/templates.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { DocumentTemplate, TemplateCategory } from "@/types/template.types";
import { TEMPLATE_CATEGORIES } from "@/types/template.types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function TemplatesPage() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | "all">("all");

  useEffect(() => {
    fetchTemplates();
  }, [currentWorkspace, categoryFilter]);

  const fetchTemplates = async () => {
    if (!currentWorkspace) return;

    try {
      setLoading(true);
      const { data, error } = await templatesService.getAll(
        currentWorkspace.id,
        categoryFilter === "all" ? undefined : categoryFilter
      );

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      toast.error("Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentWorkspace) return;

    try {
      const { error } = await templatesService.delete(id, currentWorkspace.id);
      if (error) throw error;

      toast.success("Template excluído com sucesso");
      fetchTemplates();
    } catch (error) {
      console.error("Erro ao excluir template:", error);
      toast.error("Erro ao excluir template");
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!currentWorkspace) return;

    try {
      const { error } = await templatesService.duplicate(id, currentWorkspace.id);
      if (error) throw error;

      toast.success("Template duplicado com sucesso");
      fetchTemplates();
    } catch (error) {
      console.error("Erro ao duplicar template:", error);
      toast.error("Erro ao duplicar template");
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Modelos e Documentos</h1>
          <p className="text-muted-foreground">
            Crie e gerencie templates para seus documentos profissionais
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => navigate("/app/templates/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Modelo
              </Button>
            </div>
          </div>

          <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              {TEMPLATE_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum template encontrado"
            description="Crie seu primeiro template para começar"
            actionLabel="Criar Primeiro Modelo"
            onAction={() => navigate("/app/templates/new")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => navigate(`/app/templates/${template.id}/edit`)}
                onGenerate={() => navigate(`/app/templates/${template.id}/generate`)}
                onDuplicate={() => handleDuplicate(template.id)}
                onDelete={() => handleDelete(template.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withWorkspaceGuard(TemplatesPage);
