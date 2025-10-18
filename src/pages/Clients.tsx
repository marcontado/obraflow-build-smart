import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { clientsService } from "@/services/clients.service";
import { toast } from "sonner";

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchClients();
    };
    checkAuth();
  }, [navigate]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = searchQuery
        ? await clientsService.search(searchQuery)
        : await clientsService.getAll();

      if (error) throw error;

      // Count projects for each client
      const clientsWithProjects = await Promise.all(
        (data || []).map(async (client) => {
          const { data: projects } = await supabase
            .from("projects")
            .select("id", { count: "exact" })
            .eq("client_id", client.id);

          return {
            ...client,
            projectCount: projects?.length || 0,
          };
        })
      );

      setClients(clientsWithProjects);
    } catch (error: any) {
      toast.error("Erro ao carregar clientes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchClients();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleEdit = (client: any) => {
    setSelectedClient(client);
    setFormOpen(true);
  };

  const handleDelete = (client: any) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedClient) return;

    try {
      setDeleting(true);
      const { error } = await clientsService.delete(selectedClient.id);
      if (error) throw error;

      toast.success("Cliente excluído com sucesso!");
      fetchClients();
      setDeleteDialogOpen(false);
      setSelectedClient(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir cliente");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Clientes" subtitle="Gerencie seus clientes" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => { setSelectedClient(null); setFormOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                {searchQuery ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setFormOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  id={client.id}
                  name={client.name}
                  email={client.email}
                  phone={client.phone}
                  city={client.city}
                  state={client.state}
                  projectCount={client.projectCount}
                  onEdit={() => handleEdit(client)}
                  onDelete={() => handleDelete(client)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <ClientFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedClient(null); }}
        onSuccess={fetchClients}
        clientId={selectedClient?.id}
        initialData={selectedClient}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setSelectedClient(null); }}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente "${selectedClient?.name}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
