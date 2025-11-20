import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Construction } from "lucide-react";
import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";

function Financeiro() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Financeiro" subtitle="Controle financeiro do escritório" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Construction className="h-24 w-24 text-muted-foreground mb-6" />
            <h2 className="text-3xl font-bold mb-2">Em Desenvolvimento</h2>
            <p className="text-muted-foreground max-w-md">
              Este módulo está sendo desenvolvido e estará disponível em breve.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withWorkspaceGuard(Financeiro);
