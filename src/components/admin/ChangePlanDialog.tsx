import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/admin.service";
import { useToast } from "@/hooks/use-toast";
import { PLAN_NAMES } from "@/constants/plans";

interface ChangePlanDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workspaceId: string;
  workspaceName: string;
  currentPlan: string;
}

export function ChangePlanDialog({
  open,
  onClose,
  onSuccess,
  workspaceId,
  workspaceName,
  currentPlan,
}: ChangePlanDialogProps) {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlan);
  const [loading, setLoading] = useState(false);

  const handleChangePlan = async () => {
    if (selectedPlan === currentPlan) {
      toast({
        title: "Nenhuma mudança",
        description: "O plano selecionado é o mesmo que o atual.",
        variant: "default",
      });
      return;
    }

    setLoading(true);
    try {
      await adminService.changeWorkspacePlan(workspaceId, selectedPlan);
      toast({
        title: "Plano alterado com sucesso!",
        description: `${workspaceName} agora está no plano ${PLAN_NAMES[selectedPlan as keyof typeof PLAN_NAMES]}.`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error changing plan:", error);
      toast({
        title: "Erro ao alterar plano",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Plano do Workspace</DialogTitle>
          <DialogDescription>
            Alterar o plano de <strong>{workspaceName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Plano Atual</label>
            <div>
              <Badge variant="secondary">
                {PLAN_NAMES[currentPlan as keyof typeof PLAN_NAMES]}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Novo Plano</label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o novo plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atelier">Atelier (Gratuito)</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="domus">Domus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleChangePlan} disabled={loading}>
            {loading ? "Alterando..." : "Confirmar Alteração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
