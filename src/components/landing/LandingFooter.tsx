import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-gradient-to-b from-card to-background border-t border-border/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Archestra
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plataforma completa de gestão de obras para designers de interiores e arquitetos.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4 text-card-foreground">Produto</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#recursos" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  Recursos
                </a>
              </li>
              <li>
                <Link to="/plans" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  Planos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4 text-card-foreground">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4 text-card-foreground">Contato</h4>
            <div className="flex items-center gap-3 text-sm text-muted-foreground group">
              <Mail className="w-4 h-4 group-hover:text-primary transition-colors duration-300" />
              <a href="mailto:contato@archestra.com" className="hover:text-primary transition-colors duration-300">
                contato@archestra.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Archestra. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
