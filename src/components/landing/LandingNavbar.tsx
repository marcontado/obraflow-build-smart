import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold text-primary">Archestra</div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#recursos" className="text-sm text-foreground hover:text-primary transition-colors">
            Recursos
          </a>
          <a href="#beneficios" className="text-sm text-foreground hover:text-primary transition-colors">
            Benefícios
          </a>
          <Link to="/plans" className="text-sm text-foreground hover:text-primary transition-colors">
            Planos
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/auth">Entrar</Link>
          </Button>
          <Button asChild>
            <Link to="/auth?tab=signup">Começar Grátis</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
