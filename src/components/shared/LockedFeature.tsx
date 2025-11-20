import { Lock } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { withWorkspaceGuard } from "@/hoc/withWorkspaceGuard";

interface LockedFeatureProps {
  title: string;
  subtitle: string;
  featureName: string;
}

function LockedFeature({ title, subtitle, featureName }: LockedFeatureProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Lock className="h-24 w-24 text-muted-foreground mb-6" />
            <h2 className="text-3xl font-bold mb-2">Recurso Bloqueado</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {featureName} está disponível somente nos planos <span className="font-semibold">Studio</span> e <span className="font-semibold">Domus</span>.
            </p>
            <Button 
              onClick={() => navigate("/plans")}
              size="lg"
            >
              Clique aqui para contratar um plano
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withWorkspaceGuard(LockedFeature);
