import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { budgetCategorySchema, type BudgetCategoryFormData } from "@/schemas/budget-category.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface BudgetCategoryManagerProps {
  onCreateCategory: (data: BudgetCategoryFormData) => Promise<void>;
}

const iconOptions = [
  { value: "Layers", label: "Camadas" },
  { value: "Lightbulb", label: "Lâmpada" },
  { value: "Square", label: "Quadrado" },
  { value: "Hammer", label: "Martelo" },
  { value: "Package", label: "Pacote" },
  { value: "Droplet", label: "Gota" },
  { value: "Zap", label: "Raio" },
  { value: "Paintbrush", label: "Pincel" },
  { value: "Sparkles", label: "Brilho" },
  { value: "Armchair", label: "Poltrona" },
  { value: "Trees", label: "Árvores" },
  { value: "MoreHorizontal", label: "Mais" },
];

const colorOptions = [
  { value: "#ef4444", label: "Vermelho" },
  { value: "#f59e0b", label: "Laranja" },
  { value: "#eab308", label: "Amarelo" },
  { value: "#84cc16", label: "Verde Claro" },
  { value: "#22c55e", label: "Verde" },
  { value: "#14b8a6", label: "Turquesa" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#6366f1", label: "Índigo" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#a855f7", label: "Púrpura" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#64748b", label: "Cinza" },
];

export function BudgetCategoryManager({ onCreateCategory }: BudgetCategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BudgetCategoryFormData>({
    resolver: zodResolver(budgetCategorySchema),
    defaultValues: {
      color: "#6366f1",
      icon: "Package",
    },
  });

  const handleSubmit = async (data: BudgetCategoryFormData) => {
    setIsSubmitting(true);
    try {
      await onCreateCategory(data);
      form.reset();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Categoria</DialogTitle>
          <DialogDescription>
            Adicione uma nova categoria personalizada para organizar seus itens orçamentários.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Gesso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição opcional da categoria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: color.value }}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            {icon.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar Categoria"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
