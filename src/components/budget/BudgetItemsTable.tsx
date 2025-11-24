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
import { Pencil, Trash2, ExternalLink, Copy } from "lucide-react";
import type { BudgetItemWithRelations } from "@/types/budget.types";
import { budgetItemStatus } from "@/types/budget.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BudgetItemsTableProps {
  items: BudgetItemWithRelations[];
  onEdit: (item: BudgetItemWithRelations) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (item: BudgetItemWithRelations) => void;
}

export function BudgetItemsTable({ items, onEdit, onDelete, onDuplicate }: BudgetItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum item cadastrado nesta categoria ainda.</p>
        <p className="text-sm mt-2">Clique em "Novo Item" para começar.</p>
      </div>
    );
  }

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
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Ambiente</TableHead>
              <TableHead>Executor</TableHead>
              <TableHead>Medições</TableHead>
              <TableHead>Loja Principal</TableHead>
              <TableHead>Loja Alternativa</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const statusInfo = getStatusInfo(item.status);
              const savings = calculateSavings(item);
              const selectedPrice = item.selected_store === "main" ? item.unit_price : item.alternative_unit_price;

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span>{item.item_name}</span>
                        {item.category && (
                          <Badge
                            variant="outline"
                            style={{ borderColor: item.category.color, color: item.category.color }}
                          >
                            {item.category.name}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px] cursor-help">
                                {item.description}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{item.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {item.area ? (
                      <Badge variant="secondary">{item.area.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="text-sm">{item.executor || "-"}</span>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm space-y-1">
                      {item.measurement_base && (
                        <div>
                          Base: {item.measurement_base} {item.measurement_unit}
                        </div>
                      )}
                      {item.measurement_purchased && (
                        <div className="text-muted-foreground">
                          Comprada: {item.measurement_purchased} {item.measurement_unit}
                        </div>
                      )}
                      {item.quantity && (
                        <div className="font-medium">Qty: {item.quantity}</div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm space-y-1">
                      {item.store_name && <div className="font-medium">{item.store_name}</div>}
                      {item.product_code && (
                        <div className="text-muted-foreground">{item.product_code}</div>
                      )}
                      {item.unit_price && (
                        <div>
                          R$ {Number(item.unit_price).toFixed(2)}
                          {item.selected_store === "main" && (
                            <Badge variant="default" className="ml-2 text-xs">
                              Selecionada
                            </Badge>
                          )}
                        </div>
                      )}
                      {item.store_link && (
                        <a
                          href={item.store_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {item.alternative_store_name ? (
                      <div className="text-sm space-y-1">
                        <div className="font-medium">{item.alternative_store_name}</div>
                        {item.alternative_unit_price && (
                          <div className="flex items-center gap-2">
                            R$ {Number(item.alternative_unit_price).toFixed(2)}
                            {savings !== 0 && (
                              <Badge variant={savings > 0 ? "default" : "destructive"} className="text-xs">
                                {savings > 0 ? "-" : "+"}
                                {Math.abs(savings).toFixed(0)}%
                              </Badge>
                            )}
                            {item.selected_store === "alternative" && (
                              <Badge variant="default" className="ml-2 text-xs">
                                Selecionada
                              </Badge>
                            )}
                          </div>
                        )}
                        {item.alternative_store_link && (
                          <a
                            href={item.alternative_store_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Link
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
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
                    {item.deadline && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(item.deadline).toLocaleDateString("pt-BR")}
                      </div>
                    )}
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
