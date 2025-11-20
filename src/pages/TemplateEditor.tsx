import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";
import { templatesService } from "@/services/templates.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { TEMPLATE_CATEGORIES } from "@/types/template.types";
import type { TemplateCategory, TemplateContent, ContentBlock } from "@/types/template.types";
import { TemplateEditor as Editor } from "@/components/templates/TemplateEditor";
import { VariablesPanel } from "@/components/templates/VariablesPanel";

function TemplateEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("contrato");
  const [content, setContent] = useState<TemplateContent>({ blocks: [] });

  useEffect(() => {
    if (id && id !== "new") {
      loadTemplate();
    } else {
      // Template inicial vazio
      setContent({
        blocks: [
          {
            id: crypto.randomUUID(),
            type: "heading1",
            content: "Título do Documento",
          },
          {
            id: crypto.randomUUID(),
            type: "paragraph",
            content: "Digite o conteúdo do seu documento aqui...",
          },
        ],
      });
    }
  }, [id]);

  const loadTemplate = async () => {
    if (!currentWorkspace || !id) return;

    try {
      setLoading(true);
      const { data, error } = await templatesService.getById(id, currentWorkspace.id);
      if (error) throw error;

      if (data) {
        setName(data.name);
        setCategory(data.category as TemplateCategory);
        const contentData = data.content as any;
        setContent(contentData && contentData.blocks ? contentData : { blocks: [] });
      }
    } catch (error) {
      console.error("Erro ao carregar template:", error);
      toast.error("Erro ao carregar template");
      navigate("/app/templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentWorkspace) return;

    if (!name.trim()) {
      toast.error("Digite um nome para o template");
      return;
    }

    try {
      setLoading(true);

      // Extrair variáveis usadas
      const variablesUsed = extractVariablesFromContent(content);

      const templateData = {
        name,
        category,
        content: content as any,
        variables_used: variablesUsed,
        signatures: content.blocks
          .filter((b) => b.type === "signature")
          .map((b) => b.signatureField) as any,
      };

      if (id && id !== "new") {
        const { error } = await templatesService.update(id, templateData, currentWorkspace.id);
        if (error) throw error;
        toast.success("Template atualizado com sucesso");
      } else {
        const { error } = await templatesService.create(templateData, currentWorkspace.id);
        if (error) throw error;
        toast.success("Template criado com sucesso");
      }

      navigate("/app/templates");
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      toast.error("Erro ao salvar template");
    } finally {
      setLoading(false);
    }
  };

  const extractVariablesFromContent = (content: TemplateContent): string[] => {
    const variables = new Set<string>();
    const regex = /\{\{[^}]+\}\}/g;

    content.blocks.forEach((block) => {
      const matches = block.content.match(regex);
      if (matches) {
        matches.forEach((match) => variables.add(match));
      }
    });

    return Array.from(variables);
  };

  const insertVariable = (variable: string) => {
    // Adiciona a variável no último bloco editável
    const lastBlock = content.blocks[content.blocks.length - 1];
    if (lastBlock && lastBlock.type !== "signature" && lastBlock.type !== "pagebreak") {
      const updatedBlocks = [...content.blocks];
      updatedBlocks[updatedBlocks.length - 1] = {
        ...lastBlock,
        content: lastBlock.content + " " + variable,
      };
      setContent({ blocks: updatedBlocks });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/app/templates")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {id === "new" ? "Novo Modelo" : "Editar Modelo"}
                </h1>
              </div>
            </div>

            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Modelo
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Configurações e Variáveis */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-lg border p-4 space-y-4">
              <div>
                <Label htmlFor="name">Nome do Modelo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Contrato de Prestação de Serviços"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
                  <SelectTrigger id="category" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <VariablesPanel onInsert={insertVariable} />
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <Editor content={content} onChange={setContent} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withWorkspaceGuard(TemplateEditorPage);
