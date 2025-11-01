import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

export function LandingNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  // Função para scroll suave ou redirecionamento
  const handleSmoothOrRedirect = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      localStorage.setItem("scrollToSection", sectionId);
      navigate("/");
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location, navigate]);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-soft">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
            Archestra
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <a
            href="#recursos"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            onClick={e => handleSmoothOrRedirect(e, "recursos")}
          >
            Recursos
          </a>
          <a
            href="#beneficios"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            onClick={e => handleSmoothOrRedirect(e, "beneficios")}
          >
            Benefícios
          </a>
          <a
            href="#planos"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            onClick={e => handleSmoothOrRedirect(e, "planos")}
          >
            Planos
          </a>
        </div>

        <div className="flex items-center gap-4">
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
