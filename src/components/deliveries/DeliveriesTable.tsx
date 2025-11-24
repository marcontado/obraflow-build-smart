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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Image as ImageIcon, FileText, ExternalLink } from "lucide-react";
import type { ProjectDeliveryWithRelations } from "@/types/delivery.types";
import { deliveryStatus } from "@/types/delivery.types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeliveriesTableProps {
  deliveries: ProjectDeliveryWithRelations[];
  onEdit: (delivery: ProjectDeliveryWithRelations) => void;
  onDelete: (deliveryId: string) => void;
}

export function DeliveriesTable({
  deliveries,
  onEdit,
  onDelete,
}: DeliveriesTableProps) {
  const [selectedDelivery, setSelectedDelivery] = useState<ProjectDeliveryWithRelations | null>(null);
  const [photosDialogOpen, setPhotosDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = deliveryStatus.find((s) => s.value === status);
    return (
      <Badge variant="outline" className={statusConfig?.color}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const handleViewPhotos = (delivery: ProjectDeliveryWithRelations) => {
    setSelectedDelivery(delivery);
    setPhotosDialogOpen(true);
  };

  const photos = selectedDelivery?.photos as any[] || [];
  const attachments = selectedDelivery?.attachments as any[] || [];

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Ambiente</TableHead>
              <TableHead>Item Vinculado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Fotos</TableHead>
              <TableHead className="text-center">Anexos</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhuma entrega registrada
                </TableCell>
              </TableRow>
            ) : (
              deliveries.map((delivery) => {
                const photos = delivery.photos as any[] || [];
                const attachments = delivery.attachments as any[] || [];
                
                return (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">
                      {format(new Date(delivery.delivery_date), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{delivery.supplier_name}</TableCell>
                    <TableCell>
                      {delivery.area?.name || (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {delivery.budget_item?.item_name || (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                    <TableCell className="text-center">
                      {photos.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPhotos(delivery)}
                        >
                          <ImageIcon className="h-4 w-4 mr-1" />
                          {photos.length}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {attachments.length > 0 ? (
                        <span className="text-sm">{attachments.length}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(delivery)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(delivery.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de Fotos */}
      <Dialog open={photosDialogOpen} onOpenChange={setPhotosDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fotos da Entrega</DialogTitle>
          </DialogHeader>
          
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo: any, index: number) => (
                <div key={index} className="relative group">
                  <img
                    src={photo.url}
                    alt={photo.name || `Foto ${index + 1}`}
                    className="w-full h-48 object-cover rounded-md border"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => window.open(photo.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma foto disponível
            </p>
          )}

          {attachments.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Anexos</h4>
              <div className="space-y-2">
                {attachments.map((attachment: any, index: number) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 border rounded-md hover:bg-muted transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1">{attachment.name}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
