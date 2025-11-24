import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, AlertCircle } from "lucide-react";
import { DeliveryFormDialog } from "./DeliveryFormDialog";
import { DeliveriesTable } from "./DeliveriesTable";
import { deliveriesService } from "@/services/deliveries.service";
import type { ProjectDeliveryWithRelations } from "@/types/delivery.types";
import type { DeliveryFormData } from "@/schemas/delivery.schema";
import type { ProjectArea } from "@/types";
import type { BudgetItemWithRelations } from "@/types/budget.types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProjectDeliveriesViewProps {
  projectId: string;
  areas: ProjectArea[];
  budgetItems: BudgetItemWithRelations[];
}

export function ProjectDeliveriesView({
  projectId,
  areas,
  budgetItems,
}: ProjectDeliveriesViewProps) {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  
  const [deliveries, setDeliveries] = useState<ProjectDeliveryWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<ProjectDeliveryWithRelations | null>(null);

  useEffect(() => {
    if (currentWorkspace) {
      fetchDeliveries();
    }
  }, [projectId, currentWorkspace]);

  const fetchDeliveries = async () => {
    if (!currentWorkspace) return;
    
    try {
      setIsLoading(true);
      const data = await deliveriesService.getByProject(projectId, currentWorkspace.id);
      setDeliveries(data);
    } catch (error: any) {
      console.error("Erro ao carregar entregas:", error);
      toast.error("Erro ao carregar entregas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (
    data: DeliveryFormData,
    photos: File[],
    attachments: File[]
  ) => {
    if (!user || !currentWorkspace) return;

    try {
      let deliveryId = editingDelivery?.id;

      // Se está criando, criar o registro primeiro
      if (!editingDelivery) {
        const newDelivery = await deliveriesService.create({
          project_id: data.project_id,
          workspace_id: currentWorkspace.id,
          created_by: user.id,
          delivery_date: data.delivery_date,
          supplier_name: data.supplier_name,
          budget_item_id: data.budget_item_id || null,
          area_id: data.area_id || null,
          status: data.status,
          notes: data.notes || null,
          photos: [],
          attachments: [],
        });
        deliveryId = newDelivery.id;
      }

      if (!deliveryId) throw new Error("ID da entrega não disponível");

      // Upload de fotos
      const photoUrls = [];
      for (const photo of photos) {
        try {
          const url = await deliveriesService.uploadPhoto(photo, user.id, deliveryId);
          photoUrls.push({
            url,
            name: photo.name,
            uploadedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Erro ao fazer upload da foto:", error);
          toast.error(`Erro ao fazer upload de ${photo.name}`);
        }
      }

      // Upload de anexos
      const attachmentUrls = [];
      for (const attachment of attachments) {
        try {
          const url = await deliveriesService.uploadAttachment(attachment, user.id, deliveryId);
          attachmentUrls.push({
            url,
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
            uploadedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Erro ao fazer upload do anexo:", error);
          toast.error(`Erro ao fazer upload de ${attachment.name}`);
        }
      }

      // Combinar com fotos/anexos existentes se estiver editando
      const existingPhotos = editingDelivery?.photos as any[] || [];
      const existingAttachments = editingDelivery?.attachments as any[] || [];

      // Atualizar delivery com as URLs
      await deliveriesService.update(
        deliveryId,
        {
          ...data,
          photos: [...existingPhotos, ...photoUrls],
          attachments: [...existingAttachments, ...attachmentUrls],
        },
        currentWorkspace.id
      );

      toast.success(
        editingDelivery
          ? "Entrega atualizada com sucesso!"
          : "Entrega registrada com sucesso!"
      );
      
      fetchDeliveries();
      setEditingDelivery(null);
    } catch (error: any) {
      console.error("Erro ao salvar entrega:", error);
      toast.error("Erro ao salvar entrega");
    }
  };

  const handleEdit = (delivery: ProjectDeliveryWithRelations) => {
    const formData: Partial<DeliveryFormData> = {
      project_id: delivery.project_id,
      budget_item_id: delivery.budget_item_id,
      area_id: delivery.area_id,
      delivery_date: delivery.delivery_date,
      supplier_name: delivery.supplier_name,
      status: delivery.status as "recebido" | "conferido" | "armazenado" | "aplicado",
      notes: delivery.notes,
    };
    
    setEditingDelivery(delivery);
    setDialogOpen(true);
  };

  const handleDelete = async (deliveryId: string) => {
    if (!currentWorkspace) return;
    
    if (!confirm("Tem certeza que deseja excluir esta entrega?")) return;

    try {
      await deliveriesService.delete(deliveryId, currentWorkspace.id);
      toast.success("Entrega excluída com sucesso!");
      fetchDeliveries();
    } catch (error: any) {
      console.error("Erro ao excluir entrega:", error);
      toast.error("Erro ao excluir entrega");
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingDelivery(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Carregando entregas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Entregas e Demandas
              </CardTitle>
              <CardDescription>
                Controle de produtos e materiais recebidos no projeto
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Entrega
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhuma entrega registrada ainda. Clique em "Nova Entrega" para começar.
              </AlertDescription>
            </Alert>
          ) : (
            <DeliveriesTable
              deliveries={deliveries}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <DeliveryFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleSubmit}
        areas={areas}
        budgetItems={budgetItems}
        initialData={editingDelivery ? {
          project_id: editingDelivery.project_id,
          budget_item_id: editingDelivery.budget_item_id,
          area_id: editingDelivery.area_id,
          delivery_date: editingDelivery.delivery_date,
          supplier_name: editingDelivery.supplier_name,
          status: editingDelivery.status as "recebido" | "conferido" | "armazenado" | "aplicado",
          notes: editingDelivery.notes,
        } : undefined}
        isEditing={!!editingDelivery}
      />
    </div>
  );
}
