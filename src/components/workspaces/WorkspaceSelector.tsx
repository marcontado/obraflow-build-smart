import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronDown, Settings, Plus, Check } from "lucide-react";
import { PLAN_NAMES } from "@/constants/plans";

export function WorkspaceSelector() {
  const navigate = useNavigate();
  const { currentWorkspace, workspaces, switchWorkspace, canCreateWorkspace } = useWorkspace();

  if (!currentWorkspace) return null;

  const handleSwitchWorkspace = async (workspaceId: string) => {
    await switchWorkspace(workspaceId);
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Building2 className="h-4 w-4" />
          <span className="max-w-[150px] truncate">{currentWorkspace.name}</span>
          <Badge variant="secondary" className="text-xs">
            {PLAN_NAMES[currentWorkspace.subscription_plan as keyof typeof PLAN_NAMES]}
          </Badge>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleSwitchWorkspace(workspace.id)}
            className={workspace.id === currentWorkspace.id ? "bg-accent" : ""}
          >
            <div className="flex items-center gap-2 flex-1">
              {workspace.id === currentWorkspace.id ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              <span className="flex-1 truncate">{workspace.name}</span>
              <Badge variant="outline" className="text-xs">
                {PLAN_NAMES[workspace.subscription_plan as keyof typeof PLAN_NAMES]}
              </Badge>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {canCreateWorkspace() && (
          <DropdownMenuItem onClick={() => navigate("/workspace/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Workspace
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate(`/workspace/${currentWorkspace.id}/settings`)}>
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
