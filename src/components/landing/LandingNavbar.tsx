import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Glass morphism navbar */}
      <div className="relative bg-white/70 dark:bg-background/60 backdrop-blur-glass border-b border-white/20 dark:border-white/10 shadow-glass">
        {/* Subtle glow effect */}
        <div className="absolute inset-x-0 -top-px h-px bg-primary/50" />
        
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group relative">
            <div className="absolute -inset-2 bg-primary/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative text-3xl font-heading font-bold text-primary group-hover:scale-105 transition-transform duration-300">
              Archestra
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <a href="#recursos" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
              Recursos
            </a>
            <a href="#beneficios" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
              Benefícios
            </a>
            <a href="#planos" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
              Planos
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="backdrop-blur-sm">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild className="shadow-glow">
              <Link to="/auth?tab=signup">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
