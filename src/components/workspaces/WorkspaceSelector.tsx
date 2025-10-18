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
import { Building2, ChevronDown, Settings, Plus } from "lucide-react";

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
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleSwitchWorkspace(workspace.id)}
            className={workspace.id === currentWorkspace.id ? "bg-accent" : ""}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <span className="flex-1 truncate">{workspace.name}</span>
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
