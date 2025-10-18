import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { workspacesService } from "@/services/workspaces.service";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { PLAN_NAMES } from "@/constants/plans";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["member", "admin", "owner"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workspaceId: string;
}

export function InviteModal({ open, onClose, onSuccess, workspaceId }: InviteModalProps) {
  const { toast } = useToast();
  const { getWorkspaceLimits, currentWorkspace } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    setSubmitting(true);

    // Validar limite de membros
    const limits = getWorkspaceLimits();
    const { data: members } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId);

    const currentCount = members?.length || 0;

    if (currentCount >= limits.membersPerWorkspace) {
      toast({
        title: "Limite atingido",
        description: `Você atingiu o limite de ${limits.membersPerWorkspace} membros do plano ${currentWorkspace?.subscription_plan.toUpperCase()}.`,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    const { error } = await workspacesService.inviteMember(workspaceId, data.email, data.role);

    if (error) {
      toast({
        title: "Erro ao enviar convite",
        description: error.message,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: "Convite enviado!",
      description: "O convite foi criado com sucesso.",
    });

    form.reset();
    setSubmitting(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar Membro</DialogTitle>
          <DialogDescription>
            Adicione um novo membro ao workspace. Um link de convite será gerado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissão</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma permissão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar Convite"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
