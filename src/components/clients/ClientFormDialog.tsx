import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientFormData } from "@/schemas/client.schema";
import { clientsService } from "@/services/clients.service";
import { clientRepresentativesService } from "@/services/client-representatives.service";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { clientTypeLabels, maritalStatusOptions, type ClientWithType } from "@/types/client.types";
import { Building2, User, X } from "lucide-react";

interface ClientFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId?: string;
  initialData?: ClientWithType | null;
}

export function ClientFormDialog({
  open,
  onClose,
  onSuccess,
  clientId,
  initialData,
}: ClientFormDialogProps) {
  const { currentWorkspace, getWorkspaceLimits } = useWorkspace();
  const { user } = useAuth();
  const [availableRepresentatives, setAvailableRepresentatives] = useState<ClientWithType[]>([]);
  const [selectedRepresentatives, setSelectedRepresentatives] = useState<string[]>([]);
  
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      client_type: "PF",
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      notes: "",
      cpf: "",
      rg: "",
      nationality: "Brasileiro(a)",
      occupation: "",
      marital_status: "",
      cnpj: "",
      razao_social: "",
      inscricao_estadual: "",
      inscricao_municipal: "",
    },
  });

  const clientType = form.watch("client_type");

  // Carregar representantes disponíveis (apenas clientes PF)
  useEffect(() => {
    if (open && currentWorkspace && clientType === "PJ") {
      fetchAvailableRepresentatives();
    }
  }, [open, currentWorkspace, clientType]);

  // Carregar representantes vinculados ao editar
  useEffect(() => {
    if (open && clientId && currentWorkspace && clientType === "PJ") {
      fetchLinkedRepresentatives();
    }
  }, [open, clientId, currentWorkspace, clientType]);

  const fetchAvailableRepresentatives = async () => {
    if (!currentWorkspace) return;

    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("workspace_id", currentWorkspace.id)
        .eq("client_type", "PF")
        .order("name");

      if (error) throw error;
      setAvailableRepresentatives((data || []) as ClientWithType[]);
    } catch (error) {
      console.error("Erro ao carregar representantes:", error);
    }
  };

  const fetchLinkedRepresentatives = async () => {
    if (!clientId || !currentWorkspace) return;

    try {
      const reps = await clientRepresentativesService.getByCompany(clientId, currentWorkspace.id);
      const repIds = reps.map((r: any) => r.representative_client_id);
      setSelectedRepresentatives(repIds);
      form.setValue("representative_ids", repIds);
    } catch (error) {
      console.error("Erro ao carregar representantes vinculados:", error);
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        client_type: initialData.client_type || "PF",
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        zip_code: initialData.zip_code || "",
        notes: initialData.notes || "",
        cpf: initialData.cpf || "",
        rg: initialData.rg || "",
        nationality: initialData.nationality || "Brasileiro(a)",
        occupation: initialData.occupation || "",
        marital_status: initialData.marital_status || "",
        cnpj: initialData.cnpj || "",
        razao_social: initialData.razao_social || "",
        inscricao_estadual: initialData.inscricao_estadual || "",
        inscricao_municipal: initialData.inscricao_municipal || "",
      });
    } else {
      form.reset({
        client_type: "PF",
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        notes: "",
        cpf: "",
        rg: "",
        nationality: "Brasileiro(a)",
        occupation: "",
        marital_status: "",
        cnpj: "",
        razao_social: "",
        inscricao_estadual: "",
        inscricao_municipal: "",
      });
      setSelectedRepresentatives([]);
    }
  }, [initialData, form, open]);

  const addRepresentative = (repId: string) => {
    if (!selectedRepresentatives.includes(repId)) {
      const newReps = [...selectedRepresentatives, repId];
      setSelectedRepresentatives(newReps);
      form.setValue("representative_ids", newReps);
    }
  };

  const removeRepresentative = (repId: string) => {
    const newReps = selectedRepresentatives.filter(id => id !== repId);
    setSelectedRepresentatives(newReps);
    form.setValue("representative_ids", newReps);
  };

  const onSubmit = async (data: ClientFormData) => {
    if (!currentWorkspace || !user) {
      toast.error("Nenhum workspace selecionado");
      return;
    }

    // Validar PJ sem representante
    if (data.client_type === "PJ" && (!selectedRepresentatives || selectedRepresentatives.length === 0)) {
      toast.error("Pessoa Jurídica deve ter pelo menos um representante legal vinculado");
      return;
    }

    try {
      // Validar limite de clientes apenas na criação
      if (!clientId) {
        const limits = getWorkspaceLimits();
        const { data: existingClients } = await supabase
          .from("clients")
          .select("id")
          .eq("workspace_id", currentWorkspace.id);

        const currentCount = existingClients?.length || 0;

        if (currentCount >= limits.maxClients) {
          toast.error(`Limite atingido: você atingiu o limite de ${limits.maxClients} clientes do plano ${currentWorkspace.subscription_plan.toUpperCase()}.`);
          return;
        }
      }

      const cleanData = {
        client_type: data.client_type,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zip_code || null,
        notes: data.notes || null,
        workspace_id: currentWorkspace.id,
        created_by: user.id,
        
        // Campos PF
        ...(data.client_type === "PF" && {
          cpf: data.cpf || null,
          rg: data.rg || null,
          nationality: data.nationality || null,
          occupation: data.occupation || null,
          marital_status: data.marital_status || null,
        }),

        // Campos PJ
        ...(data.client_type === "PJ" && {
          cnpj: data.cnpj || null,
          razao_social: data.razao_social || null,
          inscricao_estadual: data.inscricao_estadual || null,
          inscricao_municipal: data.inscricao_municipal || null,
        }),
      };

      let savedClientId = clientId;

      if (clientId) {
        // Atualizar no Supabase
        const { error: supabaseError } = await clientsService.update(clientId, cleanData, currentWorkspace.id);
        if (supabaseError) throw supabaseError;

        // Atualizar no DynamoDB
        await fetch(`https://archestra-backend.onrender.com/clients/${clientId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...cleanData,
            id: clientId, 
            representative_ids: selectedRepresentatives,
          }),
        });

        toast.success("Cliente atualizado com sucesso!");
      } else {
        // 1. Criar no Supabase
        const { data: newClient, error } = await clientsService.create(cleanData, currentWorkspace.id);
        if (error) throw error;
        const supabaseId = newClient.id; // ID gerado pelo Supabase

        // 2. Criar no DynamoDB usando o mesmo ID
        await fetch("https://archestra-backend.onrender.com/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...cleanData,
            id: supabaseId, // Use o mesmo ID do Supabase como PK no DynamoDB
            representative_ids: selectedRepresentatives,
          }),
        });

        // Vincular representantes se for PJ
        if (data.client_type === "PJ" && savedClientId) {
          await clientRepresentativesService.sync(
            savedClientId,
            selectedRepresentatives,
            currentWorkspace.id
          );
        }

        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error);
      toast.error(error.message || "Erro ao salvar cliente");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {clientId ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo de Cliente */}
            <FormField
              control={form.control}
              name="client_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cliente *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!clientId} // Não pode mudar tipo ao editar
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PF">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {clientTypeLabels.PF}
                        </div>
                      </SelectItem>
                      <SelectItem value="PJ">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {clientTypeLabels.PJ}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {clientId && (
                    <FormDescription className="text-xs">
                      O tipo de cliente não pode ser alterado após criação
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Dados Básicos */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Dados Básicos</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {clientType === "PJ" ? "Nome Fantasia" : "Nome Completo"} *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={clientType === "PJ" ? "Nome comercial da empresa" : "Nome completo"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {clientType === "PJ" && (
                <FormField
                  control={form.control}
                  name="razao_social"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Razão social registrada" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 98765-4321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Documentação */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Documentação</h3>
              
              {clientType === "PF" ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input placeholder="00.000.000-0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nacionalidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Brasileiro(a)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profissão</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Engenheiro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="marital_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado Civil</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {maritalStatusOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="inscricao_estadual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Estadual</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000.000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="inscricao_municipal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Municipal</FormLabel>
                          <FormControl>
                            <Input placeholder="00000000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Representantes Legais (apenas PJ) */}
            {clientType === "PJ" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">Representantes Legais *</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vincule pessoas físicas que representam esta empresa
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Select onValueChange={addRepresentative}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecionar representante..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRepresentatives
                          .filter(rep => !selectedRepresentatives.includes(rep.id))
                          .map(rep => (
                            <SelectItem key={rep.id} value={rep.id}>
                              {rep.name} {rep.cpf && `(${rep.cpf})`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRepresentatives.length > 0 && (
                    <div className="space-y-2">
                      {selectedRepresentatives.map(repId => {
                        const rep = availableRepresentatives.find(r => r.id === repId);
                        if (!rep) return null;

                        return (
                          <div
                            key={repId}
                            className="flex items-center justify-between p-3 border rounded-md bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{rep.name}</p>
                                {rep.cpf && (
                                  <p className="text-xs text-muted-foreground">CPF: {rep.cpf}</p>
                                )}
                              </div>
                              {selectedRepresentatives[0] === repId && (
                                <Badge variant="secondary" className="text-xs">
                                  Principal
                                </Badge>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRepresentative(repId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedRepresentatives.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum representante vinculado
                    </p>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Endereço</h3>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logradouro</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="SP" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="12345-678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionais sobre o cliente"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {clientId ? "Salvar Alterações" : "Criar Cliente"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
