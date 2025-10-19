import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-bold text-primary mb-3">Archestra</div>
            <p className="text-sm text-muted-foreground">
              Plataforma completa de gestão de obras para designers de interiores.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-card-foreground">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#recursos" className="text-muted-foreground hover:text-primary transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <Link to="/plans" className="text-muted-foreground hover:text-primary transition-colors">
                  Planos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-card-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-card-foreground">Contato</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <a href="mailto:contato@archestra.com" className="hover:text-primary transition-colors">
                contato@archestra.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Archestra. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
