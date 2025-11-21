import { Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/contexts/LocaleContext";
import { format } from "date-fns";

interface ProjectCardProps {
  id: string;
  name: string;
  client?: string;
  status: string;
  progress: number;
  budget?: number;
  spent?: number;
  startDate?: string;
  endDate?: string;
  onClick?: () => void;
}

const statusColors = {
  planning: "bg-blue-500/10 text-blue-600 border-blue-200",
  in_progress: "bg-green-500/10 text-green-600 border-green-200",
  review: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  completed: "bg-purple-500/10 text-purple-600 border-purple-200",
  on_hold: "bg-gray-500/10 text-gray-600 border-gray-200",
};

export function ProjectCard({
  name,
  client,
  status,
  progress,
  budget,
  spent,
  startDate,
  endDate,
  onClick,
}: ProjectCardProps) {
  const { t } = useTranslation('projects');
  const { currencySymbol, numberFormat, dateLocale } = useLocale();
  const budgetPercentage = budget && spent ? (spent / budget) * 100 : 0;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'P', { locale: dateLocale as any });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{name}</CardTitle>
          <Badge
            variant="outline"
            className={cn("border", statusColors[status as keyof typeof statusColors])}
          >
            {t(`status.${status}`)}
          </Badge>
        </div>
        {client && <p className="text-sm text-muted-foreground">{client}</p>}
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('card.progress')}</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {budget && spent !== undefined && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('card.budget')}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {currencySymbol} {numberFormat.format(spent)} / {currencySymbol} {numberFormat.format(budget)}
              </p>
              <p className="text-xs text-muted-foreground">{t('card.budgetUsed', { percent: budgetPercentage.toFixed(0) })}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {startDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(startDate)}</span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center gap-1">
              <span>{t('card.until')} {formatDate(endDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
