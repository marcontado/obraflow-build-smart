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
      className="border rounded-lg mb-3"
      style={{ borderColor: category.color || 'hsl(var(--border))' }}
    >
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{category.icon}</span>
            <span className="font-semibold text-lg">{category.name}</span>
            <Badge variant="secondary" className="ml-2">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </Badge>
          </div>
          <div className="text-lg font-bold text-primary">
            R$ {categoryTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        {items.length > 0 ? (
          <BudgetItemsTable
            items={items}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            onDuplicate={onDuplicateItem}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum item nesta categoria
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
