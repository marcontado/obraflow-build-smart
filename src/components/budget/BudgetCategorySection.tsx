import { Badge } from "@/components/ui/badge";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BudgetItemsTable } from "./BudgetItemsTable";
import type { BudgetCategory, BudgetItemWithRelations } from "@/types/budget.types";

interface BudgetCategorySectionProps {
  category: BudgetCategory;
  items: BudgetItemWithRelations[];
  onEditItem: (item: BudgetItemWithRelations) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem: (item: BudgetItemWithRelations) => void;
}

export function BudgetCategorySection({
  category,
  items,
  onEditItem,
  onDeleteItem,
  onDuplicateItem,
}: BudgetCategorySectionProps) {
  const categoryTotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);

  return (
    <AccordionItem 
      value={category.id}
      className="border rounded-md mb-2"
      style={{ borderLeftWidth: '3px', borderLeftColor: category.color || 'hsl(var(--border))' }}
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
        <div className="flex items-center justify-between w-full pr-3">
          <div className="flex items-center gap-2">
            <span className="text-lg opacity-70">{category.icon}</span>
            <span className="font-medium text-sm">{category.name}</span>
            <Badge variant="outline" className="ml-1 text-xs h-5">
              {items.length}
            </Badge>
          </div>
          <div className="text-sm font-semibold text-foreground/80">
            R$ {categoryTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {items.length > 0 ? (
          <BudgetItemsTable
            items={items}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            onDuplicate={onDuplicateItem}
          />
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Nenhum item nesta categoria
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
