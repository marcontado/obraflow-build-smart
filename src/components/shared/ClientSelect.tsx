import { useEffect, useState } from "react";
import { clientsService } from "@/services/clients.service";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function ClientSelect({ value, onValueChange }: ClientSelectProps) {
  const { currentWorkspace } = useWorkspace();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    if (!currentWorkspace) return;
    
    try {
      const { data, error } = await clientsService.getAll(currentWorkspace.id);
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando clientes..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um cliente" />
      </SelectTrigger>
      <SelectContent>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            {client.name} {client.email && `(${client.email})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
