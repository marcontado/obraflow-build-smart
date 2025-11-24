import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ExternalLink, Copy, ChevronDown, ChevronUp } from "lucide-react";
import type { BudgetItemWithRelations } from "@/types/budget.types";
import { budgetItemStatus } from "@/types/budget.types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface BudgetItemsTableProps {
  items: BudgetItemWithRelations[];
  onEdit: (item: BudgetItemWithRelations) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (item: BudgetItemWithRelations) => void;
}

export function BudgetItemsTable({ items, onEdit, onDelete, onDuplicate }: BudgetItemsTableProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum item cadastrado nesta categoria ainda.</p>
        <p className="text-sm mt-2">Clique em "Novo Item" para começar.</p>
      </div>
    );
  }

  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusInfo = (status: string) => {
    const info = budgetItemStatus.find((s) => s.value === status);
    return info || budgetItemStatus[0];
  };

  const calculateSavings = (item: BudgetItemWithRelations) => {
    const mainPrice = item.unit_price || 0;
    const altPrice = item.alternative_unit_price || 0;
    
    if (mainPrice > 0 && altPrice > 0) {
      const diff = ((mainPrice - altPrice) / mainPrice) * 100;
      return diff;
    }
    return 0;
  };

  const totals = items.reduce(
    (acc, item) => {
      const price = item.total_price || 0;
      acc.total += price;
      
      if (item.status === "comprado" || item.status === "aplicado") {
        acc.spent += price;
      }
      
      return acc;
    },
    { total: 0, spent: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const statusInfo = getStatusInfo(item.status);
              const savings = calculateSavings(item);
              const isExpanded = expandedItems.includes(item.id);

              return (
                <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleItem(item.id)}>
                  <TableRow>
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </TableCell>
                    
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div>{item.item_name}</div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {item.category && (
                        <Badge
                          variant="outline"
                          style={{ borderColor: item.category.color, color: item.category.color }}
                        >
                          {item.category.icon} {item.category.name}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-bold">
                        {item.total_price
                          ? Number(item.total_price).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : "-"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {onDuplicate && (
                          <Button variant="ghost" size="icon" onClick={() => onDuplicate(item)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  <CollapsibleContent asChild>
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/50">
                        <div className="p-4 space-y-4">
                          {/* Informações Gerais */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {item.area && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Ambiente</p>
                                <Badge variant="secondary">{item.area.name}</Badge>
                              </div>
                            )}
                            {item.executor && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Executor</p>
                                <p className="text-sm font-medium">{item.executor}</p>
                              </div>
                            )}
                            {item.deadline && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Prazo</p>
                                <p className="text-sm font-medium">
                                  {new Date(item.deadline).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            )}
                            {item.quantity && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Quantidade</p>
                                <p className="text-sm font-medium">{item.quantity}</p>
                              </div>
                            )}
                          </div>

                          {/* Medições */}
                          {(item.measurement_base || item.measurement_purchased) && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Medições</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {item.measurement_base && (
                                  <div>
                                    <span className="text-muted-foreground">Base:</span>{" "}
                                    <span className="font-medium">
                                      {item.measurement_base} {item.measurement_unit}
                                    </span>
                                  </div>
                                )}
                                {item.measurement_purchased && (
                                  <div>
                                    <span className="text-muted-foreground">Comprada:</span>{" "}
                                    <span className="font-medium">
                                      {item.measurement_purchased} {item.measurement_unit}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Lojas */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Loja Principal */}
                            {item.store_name && (
                              <div className="rounded-lg border p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-muted-foreground">
                                    Loja Principal
                                  </p>
                                  {item.selected_store === "main" && (
                                    <Badge variant="default" className="text-xs">
                                      Selecionada
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-medium">{item.store_name}</p>
                                {item.product_code && (
                                  <p className="text-xs text-muted-foreground">
                                    Cód: {item.product_code}
                                  </p>
                                )}
                                {item.unit_price && (
                                  <p className="text-lg font-bold">
                                    R$ {Number(item.unit_price).toFixed(2)}
                                  </p>
                                )}
                                {item.store_link && (
                                  <a
                                    href={item.store_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Ver na loja
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Loja Alternativa */}
                            {item.alternative_store_name && (
                              <div className="rounded-lg border p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-muted-foreground">
                                    Loja Alternativa
                                  </p>
                                  {item.selected_store === "alternative" && (
                                    <Badge variant="default" className="text-xs">
                                      Selecionada
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-medium">{item.alternative_store_name}</p>
                                {item.alternative_product_code && (
                                  <p className="text-xs text-muted-foreground">
                                    Cód: {item.alternative_product_code}
                                  </p>
                                )}
                                {item.alternative_unit_price && (
                                  <div className="flex items-center gap-2">
                                    <p className="text-lg font-bold">
                                      R$ {Number(item.alternative_unit_price).toFixed(2)}
                                    </p>
                                    {savings !== 0 && (
                                      <Badge
                                        variant={savings > 0 ? "default" : "destructive"}
                                        className="text-xs"
                                      >
                                        {savings > 0 ? "-" : "+"}
                                        {Math.abs(savings).toFixed(0)}%
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                {item.alternative_store_link && (
                                  <a
                                    href={item.alternative_store_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Ver na loja
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Notas */}
                          {item.notes && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Observações</p>
                              <p className="text-sm">{item.notes}</p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Totalizadores */}
      <div className="flex justify-end gap-8 p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Total Cotado</p>
          <p className="text-lg font-bold">
            {totals.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Gasto (Comprado + Aplicado)</p>
          <p className="text-lg font-bold text-destructive">
            {totals.spent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Itens</p>
          <p className="text-lg font-bold">{items.length}</p>
        </div>
      </div>
    </div>
  );
}
