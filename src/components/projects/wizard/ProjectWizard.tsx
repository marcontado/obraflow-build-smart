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
import type { MoodboardItem, TechnicalFile } from "@/types/project.types";

import { ProjectBasicInfoStep } from "./steps/ProjectBasicInfoStep";
import { ProjectBriefingStep } from "./steps/ProjectBriefingStep";
import { ProjectMoodboardStep } from "./steps/ProjectMoodboardStep";
import { ProjectTechnicalFilesStep } from "./steps/ProjectTechnicalFilesStep";
import { ProjectSummaryStep } from "./steps/ProjectSummaryStep";

interface ProjectWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId?: string;
  initialData?: any;
}

const STEPS = [
  { id: 1, title: "Informações Básicas", description: "Nome, cliente, datas e orçamento" },
  { id: 2, title: "Briefing Inicial", description: "Objetivos e contexto do projeto" },
  { id: 3, title: "Referências Visuais", description: "Moodboard e inspirações" },
  { id: 4, title: "Materiais Técnicos", description: "Plantas, renders e documentos" },
  { id: 5, title: "Resumo", description: "Revisão e confirmação" },
];

export function ProjectWizard({ open, onClose, onSuccess, projectId, initialData }: ProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [moodboardItems, setMoodboardItems] = useState<MoodboardItem[]>([]);
  const [technicalFiles, setTechnicalFiles] = useState<TechnicalFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        style: "",
        audience: "",
        needs: "",
        restrictions: "",
        preferred_materials: "",
        references_links: "",
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
    }
  }, [initialData, form]);

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

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    form.reset();
    setMoodboardItems([]);
    setTechnicalFiles([]);
    onClose();
  };

  const onSubmit = async (data: ProjectWizardData) => {
    if (!currentWorkspace) {
      toast.error("Nenhum workspace selecionado");
      return;
    }

    setIsSubmitting(true);

    try {
      if (projectId) {
        await projectsService.updateWithWizardData(
          projectId,
          data,
          moodboardItems,
          technicalFiles,
          currentWorkspace.id
        );
        toast.success("Projeto atualizado com sucesso!");
      } else {
        await projectsService.createWithWizardData(
          data,
          moodboardItems,
          technicalFiles,
          currentWorkspace.id
        );
        toast.success("Projeto criado com sucesso!");
      }

      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error saving project:", error);
      toast.error(error.message || "Erro ao salvar projeto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gerar um ID temporário para upload de arquivos antes de criar o projeto
  const tempProjectId = projectId || `temp-${Date.now()}`;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ProjectBasicInfoStep form={form} />;
      case 2:
        return <ProjectBriefingStep form={form} />;
      case 3:
        return (
          <ProjectMoodboardStep
            projectId={tempProjectId}
            items={moodboardItems}
            onItemsChange={setMoodboardItems}
          />
        );
      case 4:
        return (
          <ProjectTechnicalFilesStep
            projectId={tempProjectId}
            files={technicalFiles}
            onFilesChange={setTechnicalFiles}
          />
        );
      case 5:
        return (
          <ProjectSummaryStep
            formData={form.getValues()}
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

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{STEPS[currentStep - 1].title}</span>
            <span className="text-muted-foreground">
              Etapa {currentStep} de {STEPS.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{STEPS[currentStep - 1].description}</p>
        </div>

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
              Cancelar
            </Button>

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
                {isSubmitting ? "Criando..." : "Criar Projeto Completo"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
