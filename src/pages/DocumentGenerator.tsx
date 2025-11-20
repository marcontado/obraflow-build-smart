import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";
import { templatesService } from "@/services/templates.service";
import { documentsService } from "@/services/documents.service";
import { clientsService } from "@/services/clients.service";
import { projectsService } from "@/services/projects.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileDown, FileCheck } from "lucide-react";
import { toast } from "sonner";
import type { DocumentTemplate, TemplateContent } from "@/types/template.types";
import type { Client, Project } from "@/types";
import { DocumentPreview } from "@/components/templates/DocumentPreview";
import jsPDF from "jspdf";

function DocumentGeneratorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentWorkspace } = useWorkspace();
  
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [documentName, setDocumentName] = useState("");
  
  const [renderedContent, setRenderedContent] = useState<TemplateContent | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (template && selectedClientId) {
      generatePreview();
    }
  }, [template, selectedClientId, selectedProjectId]);

  const loadData = async () => {
    if (!currentWorkspace || !id) return;

    try {
      setLoading(true);
      
      // Carregar template
      const { data: templateData, error: templateError } = await templatesService.getById(id, currentWorkspace.id);
      if (templateError) throw templateError;
      setTemplate(templateData);
      setDocumentName(templateData?.name + " - " + new Date().toLocaleDateString("pt-BR"));

      // Carregar clientes
      const { data: clientsData, error: clientsError } = await clientsService.getAll(currentWorkspace.id);
      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Carregar projetos
      const { data: projectsData, error: projectsError } = await projectsService.getAll(currentWorkspace.id);
      if (projectsError) throw projectsError;
      setProjects(projectsData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
      navigate("/app/templates");
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = () => {
    if (!template) return;

    const selectedClient = clients.find((c) => c.id === selectedClientId);
    const selectedProject = projects.find((p) => p.id === selectedProjectId);

    const content = template.content as any;
    const replaced = documentsService.replaceVariables(content, selectedClient, selectedProject);
    
    setRenderedContent(replaced);
  };

  const handleSave = async () => {
    if (!currentWorkspace || !template || !renderedContent) return;

    if (!documentName.trim()) {
      toast.error("Digite um nome para o documento");
      return;
    }

    try {
      setLoading(true);

      const { error } = await documentsService.create(
        {
          template_id: template.id,
          project_id: selectedProjectId || null,
          client_id: selectedClientId || null,
          name: documentName,
          content_rendered: renderedContent as any,
          pdf_url: null,
        },
        currentWorkspace.id
      );

      if (error) throw error;

      toast.success("Documento salvo com sucesso");
      navigate("/app/templates");
    } catch (error) {
      console.error("Erro ao salvar documento:", error);
      toast.error("Erro ao salvar documento");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!renderedContent || !documentName) return;

    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    doc.setFont("helvetica");

    renderedContent.blocks.forEach((block) => {
      if (block.type === "pagebreak") {
        doc.addPage();
        yPosition = 20;
        return;
      }

      if (block.type === "signature") {
        yPosition += 20;
        doc.setFontSize(10);
        doc.text("_".repeat(50), margin, yPosition);
        yPosition += 5;
        doc.text(block.signatureField?.label || "Assinatura", margin, yPosition);
        yPosition += 15;
        return;
      }

      let fontSize = 12;
      let isBold = false;

      if (block.type === "heading1") {
        fontSize = 18;
        isBold = true;
      } else if (block.type === "heading2") {
        fontSize = 16;
        isBold = true;
      } else if (block.type === "heading3") {
        fontSize = 14;
        isBold = true;
      }

      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");

      const lines = doc.splitTextToSize(block.content, maxWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > doc.internal.pageSize.height - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });

      yPosition += 5;
    });

    doc.save(`${documentName}.pdf`);
    toast.success("PDF exportado com sucesso");
  };

  if (loading && !template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

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
                  Gerar Documento
                </h1>
                <p className="text-sm text-muted-foreground">
                  {template?.name}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF} disabled={!renderedContent}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button onClick={handleSave} disabled={loading || !renderedContent}>
                <FileCheck className="h-4 w-4 mr-2" />
                Salvar Documento
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Seleção de Dados */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-4 space-y-4">
              <div>
                <Label htmlFor="documentName">Nome do Documento</Label>
                <Input
                  id="documentName"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Nome do documento"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="client">Cliente</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger id="client" className="mt-1">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="project">Projeto (Opcional)</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger id="project" className="mt-1">
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3">
            {renderedContent ? (
              <DocumentPreview content={renderedContent} />
            ) : (
              <div className="bg-card rounded-lg border p-12 text-center">
                <p className="text-muted-foreground">
                  Selecione um cliente para visualizar o documento
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withWorkspaceGuard(DocumentGeneratorPage);
