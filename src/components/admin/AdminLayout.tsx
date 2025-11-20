import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { adminAuthService } from "@/services/admin-auth.service";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard,
  ArrowLeft,
  Shield,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { 
    title: "Dashboard", 
    href: "/admin/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    title: "Organizações", 
    href: "/admin/organizations", 
    icon: Building2 
  },
  { 
    title: "Usuários", 
    href: "/admin/users", 
    icon: Users 
  },
  { 
    title: "Assinaturas", 
    href: "/admin/subscriptions", 
    icon: CreditCard 
  },
  { 
    title: "Administradores", 
    href: "/admin/admins", 
    icon: Shield 
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutAdmin = () => {
    // Limpar token e sessão admin (NÃO faz logout do sistema)
    adminAuthService.clearAdminToken();
    sessionStorage.removeItem('admin_session');
    sessionStorage.removeItem('admin_session_timestamp');
    
    toast.info("Você saiu do painel administrativo");
    
    // Redirecionar para login admin
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </div>
          <Badge variant="secondary" className="w-full justify-center">
            Modo Administrador
          </Badge>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary font-medium"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogoutAdmin}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair do Painel Admin
          </Button>
          <Link to="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Sistema
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
