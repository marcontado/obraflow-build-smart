import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TEMPLATE_VARIABLES } from "@/types/template.types";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, Building2, Calendar } from "lucide-react";

interface VariablesPanelProps {
  onInsert: (variable: string) => void;
}

const categoryIcons = {
  cliente: User,
  projeto: Briefcase,
  empresa: Building2,
  data: Calendar,
};

const categoryColors = {
  cliente: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  projeto: "bg-green-500/10 text-green-700 dark:text-green-400",
  empresa: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  data: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

export function VariablesPanel({ onInsert }: VariablesPanelProps) {
  const groupedVariables = TEMPLATE_VARIABLES.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {} as Record<string, typeof TEMPLATE_VARIABLES>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Variáveis Dinâmicas</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {Object.entries(groupedVariables).map(([category, variables]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold capitalize text-foreground">
                      {category}
                    </h4>
                  </div>
                  <div className="space-y-1">
                    {variables.map((variable) => (
                      <Button
                        key={variable.key}
                        variant="ghost"
                        size="sm"
                        onClick={() => onInsert(variable.key)}
                        className="w-full justify-start h-auto py-2 px-3"
                      >
                        <Badge
                          variant="secondary"
                          className={`mr-2 ${categoryColors[category as keyof typeof categoryColors]}`}
                        >
                          {variable.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono truncate">
                          {variable.key}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
