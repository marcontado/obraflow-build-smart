import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { StarRating } from "./StarRating";
import { partnerSchema, PARTNER_CATEGORIES, type PartnerFormData } from "@/schemas/partner.schema";
import type { Database } from "@/integrations/supabase/types";

type Partner = Database["public"]["Tables"]["partners"]["Row"];

interface PartnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PartnerFormData) => Promise<void>;
  partner?: Partner | null;
}

export function PartnerFormDialog({ open, onOpenChange, onSubmit, partner }: PartnerFormDialogProps) {
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: partner
      ? {
          name: partner.name,
          category: partner.category,
          tags: partner.tags || [],
          status: partner.status as "ativo" | "inativo",
          phone: partner.phone || "",
          email: partner.email || "",
          address: partner.address || "",
          city: partner.city || "",
          state: partner.state || "",
          zip_code: partner.zip_code || "",
          rating: partner.rating || 0,
          logo_url: partner.logo_url || "",
          diferencial: partner.diferencial || "",
          notes: partner.notes || "",
        }
      : {
          tags: [],
          status: "ativo",
          rating: 0,
        },
  });

  const tags = watch("tags") || [];
  const rating = watch("rating") || 0;
  const category = watch("category");
  const status = watch("status");

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 10) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setValue(
      "tags",
      tags.filter((_, i) => i !== index)
    );
  };

  const onSubmitForm = async (data: PartnerFormData) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {partner ? "Editar Parceiro" : "Adicionar Parceiro"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Nome */}
          <div>
            <Label htmlFor="name">Nome da Empresa ou Profissional *</Label>
            <Input id="name" {...register("name")} className="mt-1" />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Categoria e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={category} onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {PARTNER_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setValue("status", value as "ativo" | "inativo")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Etiquetas (especialidades)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Digite e pressione Enter"
                disabled={tags.length >= 10}
              />
              <Button type="button" onClick={handleAddTag} disabled={!tagInput.trim() || tags.length >= 10}>
                Adicionar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Máximo de 10 etiquetas ({tags.length}/10)
            </p>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} className="mt-1" placeholder="(11) 99999-9999" />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} className="mt-1" />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" {...register("address")} className="mt-1" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...register("city")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input id="state" {...register("state")} className="mt-1" placeholder="SP" maxLength={2} />
            </div>
            <div>
              <Label htmlFor="zip_code">CEP</Label>
              <Input id="zip_code" {...register("zip_code")} className="mt-1" placeholder="00000-000" />
            </div>
          </div>

          {/* Avaliação */}
          <div>
            <Label>Avaliação</Label>
            <div className="mt-2">
              <StarRating value={rating} onChange={(value) => setValue("rating", value)} size="lg" />
            </div>
          </div>

          {/* Diferencial */}
          <div>
            <Label htmlFor="diferencial">Diferencial / Experiência</Label>
            <Textarea
              id="diferencial"
              {...register("diferencial")}
              className="mt-1"
              rows={2}
              maxLength={200}
              placeholder="Ex: Especialista em obras residenciais de alto padrão"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(watch("diferencial") || "").length}/200 caracteres
            </p>
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notes">Notas Internas</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              className="mt-1"
              rows={3}
              placeholder="Observações internas sobre o parceiro..."
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
