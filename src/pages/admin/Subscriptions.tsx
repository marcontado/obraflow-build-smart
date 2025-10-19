import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";

export default function AdminSubscriptions() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assinaturas</h1>
          <p className="text-muted-foreground">Gerenciar assinaturas e pagamentos</p>
        </div>

        <div className="border rounded-lg p-8 text-center">
          <Badge variant="secondary" className="mb-4">Em Desenvolvimento</Badge>
          <p className="text-muted-foreground">
            Esta funcionalidade estará disponível em breve.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
