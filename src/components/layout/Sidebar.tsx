import { Home, FolderKanban, Users, BarChart3, LogOut, Lock, Handshake, MessageCircle, FileText, DollarSign } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export function Sidebar() {
  const navigate = useNavigate();
  const { hasFeature } = useFeatureAccess();
  const { t, ready } = useTranslation('navigation');

  const navigation = useMemo(() => {
    console.log('🔧 Sidebar i18n ready:', ready);
    console.log('🔧 Sidebar translation test:', t('menu.home'));
    return [
      { name: t('menu.home'), href: "/app", icon: Home },
      { name: t('menu.projects'), href: "/app/projects", icon: FolderKanban },
      { name: t('menu.clients'), href: "/app/clients", icon: Users },
      { name: t('menu.partners'), href: "/app/partners", icon: Handshake, feature: "partners" as const },
      { name: t('menu.reports'), href: "/app/reports", icon: BarChart3, feature: "reports" as const },
      { name: t('menu.financial'), href: "/app/financeiro", icon: DollarSign, alwaysLocked: true },
      { name: t('menu.templates'), href: "/app/templates", icon: FileText, feature: "templates" as const },
      { name: t('menu.support'), href: "/app/suporte", icon: MessageCircle },
    ];
  }, [t, ready]);

  const handleLogout = async () => {
    const { error } = await authService.signOut();
    if (error) {
      toast.error(t('header.signOutError'));
    } else {
      toast.success(t('header.signOutSuccess'));
      navigate("/auth");
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-2xl font-bold text-primary">Archestra</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <TooltipProvider>
          {navigation.map((item) => {
            const isLocked = item.alwaysLocked || (item.feature && !hasFeature(item.feature));

            if (isLocked) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer",
                        "text-muted-foreground/50"
                      )}
                      onClick={() => navigate(item.href)}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      <Lock className="h-3 w-3 flex-shrink-0" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {item.alwaysLocked 
                        ? t('locked.development')
                        : t('locked.upgradeRequired')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/app"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
              </NavLink>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="border-t p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
        >
          <LogOut className="h-5 w-5" />
          {t('menu.logout')}
        </button>
      </div>
    </div>
  );
}
