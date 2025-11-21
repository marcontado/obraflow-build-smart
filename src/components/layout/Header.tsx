import { Bell, LogOut, Settings, Building2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const roleColors = {
  owner: "bg-primary text-primary-foreground",
  admin: "bg-accent text-accent-foreground",
  member: "bg-secondary text-secondary-foreground",
};

export function Header({ title, subtitle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { role } = useUserRole();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { t, i18n, ready } = useTranslation('navigation');

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success(t('header.signOutSuccess'));
    } catch (error) {
      toast.error(t('header.signOutError'));
    }
  };

  // Memoize translations to force re-render on language change
  const translations = useMemo(() => {
    console.log('🎨 Header i18n ready:', ready);
    console.log('🎨 Header language:', i18n.language);
    console.log('🎨 Header translation test:', t('header.myAccount'));
    return {
      myAccount: t('header.myAccount'),
      themeLight: t('header.themeLight'),
      themeDark: t('header.themeDark'),
      settings: t('menu.settings'),
      workspace: t('workspace.title'),
      signOut: t('header.signOut'),
      roleOwner: t('roles.owner'),
      roleAdmin: t('roles.admin'),
      roleMember: t('roles.member')
    };
  }, [t, i18n.language, ready]);

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="relative"
            title={theme === "dark" ? translations.themeLight : translations.themeDark}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt={user?.email || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium">{translations.myAccount}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  {role && (
                    <Badge className={roleColors[role]} variant="secondary">
                      {role === 'owner' && translations.roleOwner}
                      {role === 'admin' && translations.roleAdmin}
                      {role === 'member' && translations.roleMember}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/app/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>{translations.settings}</span>
              </DropdownMenuItem>
              {currentWorkspace && (
                <DropdownMenuItem onClick={() => navigate(`/workspace/${currentWorkspace.id}/settings`)} className="cursor-pointer">
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>{translations.workspace}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{translations.signOut}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
