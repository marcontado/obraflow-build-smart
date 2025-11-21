import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Edit, Trash2, Save, X } from "lucide-react";
import { StarRating } from "./StarRating";
import type { Database } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Partner = Database["public"]["Tables"]["partners"]["Row"];

interface PartnerDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Partner | null;
  onEdit: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
  onUpdateNotes: (partnerId: string, notes: string) => Promise<void>;
}

export function PartnerDetailModal({
  open,
  onOpenChange,
  partner,
  onEdit,
  onDelete,
  onUpdateNotes,
}: PartnerDetailModalProps) {
  const { t } = useTranslation('partners');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  if (!partner) return null;

  const handleEditNotes = () => {
    setNotes(partner.notes || "");
    setEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await onUpdateNotes(partner.id, notes);
      setEditingNotes(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNotes(false);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header com Logo e Nome */}
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {partner.logo_url ? (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-accent/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-accent font-heading font-bold text-3xl">
                  {partner.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="font-heading text-2xl mb-2">{partner.name}</DialogTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant={partner.status === "ativo" ? "default" : "secondary"}
                  className={
                    partner.status === "ativo"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {partner.status === "ativo" ? t('status.active') : t('status.inactive')}
                </Badge>
                <StarRating value={partner.rating || 0} readonly />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Contato */}
          <section>
            <h3 className="font-heading font-semibold text-lg mb-3 text-primary">{t('details.contact')}</h3>
            <div className="space-y-2">
              {partner.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{partner.phone}</span>
                </div>
              )}
              {partner.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span>{partner.email}</span>
                </div>
              )}
              {(partner.address || partner.city) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    {partner.address && <div>{partner.address}</div>}
                    {(partner.city || partner.state) && (
                      <div className="text-muted-foreground">
                        {partner.city}
                        {partner.state && `, ${partner.state}`}
                        {partner.zip_code && ` - ${partner.zip_code}`}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Sobre */}
          <section>
            <h3 className="font-heading font-semibold text-lg mb-3 text-primary">{t('details.about')}</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">{t('details.category')}:</span>
                <div className="font-medium mt-1">{t(`categories.${partner.category}`)}</div>
              </div>

              {partner.tags && partner.tags.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">{t('details.specialties')}:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {partner.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {partner.diferencial && (
                <div>
                  <span className="text-sm text-muted-foreground">{t('details.differential')}:</span>
                  <p className="mt-1 text-foreground">{partner.diferencial}</p>
                </div>
              )}
            </div>
          </section>

          {/* Notas Internas */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-lg text-primary">{t('details.internalNotes')}</h3>
              {!editingNotes && (
                <Button size="sm" variant="outline" onClick={handleEditNotes}>
                  <Edit className="w-4 h-4 mr-1" />
                  {t('details.editNotes')}
                </Button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-3">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder={t('form.notesPlaceholder')}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveNotes} disabled={saving}>
                    <Save className="w-4 h-4 mr-1" />
                    {saving ? t('actions.saving') : t('actions.save')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-1" />
                    {t('actions.cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-4 min-h-[100px]">
                {partner.notes ? (
                  <p className="text-foreground whitespace-pre-wrap">{partner.notes}</p>
                ) : (
                  <p className="text-muted-foreground italic">{t('details.noNotes')}</p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="destructive" onClick={() => onDelete(partner)}>
            <Trash2 className="w-4 h-4 mr-2" />
            {t('actions.delete')}
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('actions.close')}
            </Button>
            <Button onClick={() => onEdit(partner)}>
              <Edit className="w-4 h-4 mr-2" />
              {t('actions.edit')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
