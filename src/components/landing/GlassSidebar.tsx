import { Home, Layers, DollarSign, BarChart3, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Início", href: "#hero" },
  { icon: Layers, label: "Recursos", href: "#recursos" },
  { icon: DollarSign, label: "Planos", href: "#planos" },
  { icon: BarChart3, label: "Benefícios", href: "#beneficios" },
  { icon: Mail, label: "Contato", href: "#contato" },
];

export function GlassSidebar() {
  return (
    <aside className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:block">
      <nav className="relative">
        {/* Glass morphism container */}
        <div className="relative bg-white/70 dark:bg-background/60 backdrop-blur-glass rounded-2xl border border-white/20 dark:border-white/10 shadow-glass p-3">
          {/* Decorative light beam effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-b from-primary/20 via-transparent to-accent/20 rounded-2xl blur-sm -z-10 animate-glow" />
          
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-white/50 dark:bg-card/50 backdrop-blur-sm border border-transparent hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10 transition-all duration-500 hover:scale-110 hover:shadow-glow"
                  title={item.label}
                >
                  <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  
                  {/* Tooltip */}
                  <span className="absolute left-full ml-4 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-medium text-card-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-elegant">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
