import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectWizardSchema, type ProjectWizardData } from "@/schemas/project.schema";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { projectsService } from "@/services/projects.service";
import type { MoodboardItem, TechnicalFile, SitePhoto } from "@/types/project.types";

import { ProjectBasicInfoStep } from "./steps/ProjectBasicInfoStep";
import { ProjectBriefingStep } from "./steps/ProjectBriefingStep";
import { ProjectSitePhotosStep } from "./steps/ProjectSitePhotosStep";
import { ProjectMoodboardStep } from "./steps/ProjectMoodboardStep";
import { ProjectTechnicalFilesStep } from "./steps/ProjectTechnicalFilesStep";
import { ProjectSummaryStep } from "./steps/ProjectSummaryStep";
import { WizardStepper } from "./WizardStepper";

interface ProjectWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId?: string;
  initialData?: any;
}

const STEPS = [
  { id: 1, title: "Informações Básicas", description: "Nome, cliente, datas e orçamento" },
  { id: 2, title: "Briefing", description: "Objetivos, perfil do cliente e pesquisa" },
  { id: 3, title: "Registro Fotográfico", description: "Fotos do local antes da reforma" },
  { id: 4, title: "Referências Visuais", description: "Moodboard e inspirações" },
  { id: 5, title: "Materiais Técnicos", description: "Plantas, renders e documentos" },
  { id: 6, title: "Resumo", description: "Revisão e confirmação" },
];

export function ProjectWizard({ open, onClose, onSuccess, projectId, initialData }: ProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [moodboardItems, setMoodboardItems] = useState<MoodboardItem[]>([]);
  const [technicalFiles, setTechnicalFiles] = useState<TechnicalFile[]>([]);
  const [sitePhotos, setSitePhotos] = useState<SitePhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(projectId || null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { currentWorkspace } = useWorkspace();

  const form = useForm<ProjectWizardData>({
    resolver: zodResolver(projectWizardSchema),
    defaultValues: {
      name: "",
      description: "",
      client_id: "",
      status: "planning",
      start_date: "",
      end_date: "",
      budget: "",
      progress: 0,
      type: undefined,
      location: "",
      briefing: {
        goal: "",
        styles: [],
        audience: "",
        needs: "",
        restrictions: "",
        preferred_materials: "",
        references_links: "",
        client_profile: "",
        client_desires: "",
        client_pains: "",
        client_essence: "",
        client_objectives: "",
        field_research: "",
      },
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        client_id: initialData.client_id || "",
        status: initialData.status || "planning",
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
        budget: initialData.budget?.toString() || "",
        progress: initialData.progress || 0,
        type: initialData.type,
        location: initialData.location || "",
        briefing: initialData.briefing || {},
      });
      setMoodboardItems(initialData.moodboard || []);
      setTechnicalFiles(initialData.technical_files || []);
      setSitePhotos(initialData.site_photos || []);
      setCreatedProjectId(projectId || null);
      setHasUnsavedChanges(false);
    }
  }, [initialData, projectId, form]);

  // Detectar mudanças no formulário
  useEffect(() => {
    if (projectId) {
      const subscription = form.watch(() => {
        setHasUnsavedChanges(true);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, projectId]);

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = async () => {
    // Validar apenas os campos da etapa atual
    let fieldsToValidate: (keyof ProjectWizardData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'status'];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    // Se está editando e no Step 1, salvar as informações básicas
    if (currentStep === 1 && projectId) {
      await saveBasicInfo();
    }

    // Se está no Step 1 e ainda não criou o projeto, criar agora
    if (currentStep === 1 && !createdProjectId && !projectId) {
      try {
        setIsSubmitting(true);
        const formData = form.getValues();
        
        if (!currentWorkspace) {
          toast.error("Workspace não selecionado");
          return;
        }

        const projectData = {
          name: formData.name,
          description: formData.description,
          client_id: formData.client_id || null,
          status: formData.status,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          progress: formData.progress || 0,
          type: formData.type || null,
          location: formData.location || null,
          workspace_id: currentWorkspace.id,
        };

        const { data, error } = await projectsService.create(projectData, currentWorkspace.id);
        
        if (error) throw error;
        
        setCreatedProjectId(data.id);
        toast.success("Projeto criado! Continue preenchendo os detalhes.");
      } catch (error: any) {
        toast.error("Erro ao criar projeto");
        console.error(error);
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const saveBasicInfo = async () => {
    if (!projectId || !currentWorkspace) return;

    try {
      setIsSubmitting(true);
      const formData = form.getValues();
      
      const updateData = {
        name: formData.name,
        description: formData.description,
        client_id: formData.client_id || null,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        progress: formData.progress || 0,
        type: formData.type || null,
        location: formData.location || null,
      };

      const { error } = await projectsService.update(projectId, updateData, currentWorkspace.id);
      
      if (error) throw error;
      
      toast.success("Informações salvas!");
      setHasUnsavedChanges(false);
      onSuccess();
    } catch (error: any) {
      toast.error("Erro ao salvar informações");
      console.error(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges && projectId) {
      const confirmed = window.confirm(
        "Você tem alterações não salvas. Deseja sair sem salvar?"
      );
      if (!confirmed) return;
    }
    
    form.reset();
    setCurrentStep(1);
    setMoodboardItems([]);
    setTechnicalFiles([]);
    setSitePhotos([]);
    setCreatedProjectId(null);
    setHasUnsavedChanges(false);
    onClose();
  };

  const onSubmit = async (data: ProjectWizardData) => {
    if (!currentWorkspace) {
      toast.error("Workspace não selecionado");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalProjectId = createdProjectId || projectId;
      
      if (!finalProjectId) {
        toast.error("Erro: ID do projeto não encontrado");
        return;
      }

      // Atualizar projeto com briefing, site_photos, moodboard e technical_files
      const updateData = {
        briefing: data.briefing,
        site_photos: sitePhotos as any,
        moodboard: moodboardItems as any,
        technical_files: technicalFiles as any,
      };

      const { error } = await projectsService.update(
        finalProjectId,
        updateData,
        currentWorkspace.id
      );
      
      if (error) throw error;
      
      toast.success(projectId ? "Projeto atualizado!" : "Projeto criado com sucesso!");
      setHasUnsavedChanges(false);
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar projeto");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const activeProjectId = createdProjectId || projectId || 'temp';
    
    switch (currentStep) {
      case 1:
        return <ProjectBasicInfoStep form={form} />;
      case 2:
        return <ProjectBriefingStep form={form} />;
      case 3:
        return (
          <ProjectSitePhotosStep
            projectId={activeProjectId}
            photos={sitePhotos}
            onPhotosChange={setSitePhotos}
          />
        );
      case 4:
        return (
          <ProjectMoodboardStep
            projectId={activeProjectId}
            items={moodboardItems}
            onItemsChange={setMoodboardItems}
          />
        );
      case 5:
        return (
          <ProjectTechnicalFilesStep
            projectId={activeProjectId}
            files={technicalFiles}
            onFilesChange={setTechnicalFiles}
          />
        );
      case 6:
        return (
          <ProjectSummaryStep
            formData={form.getValues()}
            sitePhotos={sitePhotos}
            moodboardItems={moodboardItems}
            technicalFiles={technicalFiles}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {projectId ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
        </DialogHeader>

        <WizardStepper steps={STEPS} currentStep={currentStep} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
            <div className="p-1">{renderStep()}</div>
          </form>
        </Form>

        <div className="flex items-center justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {hasUnsavedChanges ? "Sair sem Salvar" : "Cancelar"}
            </Button>

            {projectId && currentStep === 1 && (
              <Button 
                type="button" 
                variant="outline"
                onClick={saveBasicInfo} 
                disabled={isSubmitting || !hasUnsavedChanges}
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            )}

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                <Check className="mr-2 h-4 w-4" />
                {isSubmitting ? (projectId ? "Salvando..." : "Criando...") : (projectId ? "Salvar Projeto" : "Criar Projeto Completo")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
