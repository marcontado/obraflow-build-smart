import { Mail, Phone, MapPin, Edit, Trash2, FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface ActiveProject {
  id: string;
  name: string;
  status: string;
}

interface ClientCardProps {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  projectCount?: number;
  activeProjects?: ActiveProject[];
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientCard({
  name,
  email,
  phone,
  city,
  state,
  projectCount = 0,
  activeProjects = [],
  onEdit,
  onDelete,
}: ClientCardProps) {
  const { t } = useTranslation('clients');

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{email}</span>
          </div>
        )}

        {phone && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <a
                href={`https://wa.me/55${phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded bg-green-500 text-white flex items-center gap-2 hover:bg-green-600 text-xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.657.336 3.236.956 4.684L2 22l5.455-1.797A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.528 0-3.018-.437-4.29-1.262l-.306-.192-3.237 1.067 1.07-3.155-.198-.324A7.963 7.963 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-5.845c-.242-.121-1.432-.707-1.653-.788-.221-.081-.382-.121-.543.121-.161.242-.623.788-.763.95-.14.161-.282.181-.523.06-.242-.121-1.022-.377-1.947-1.201-.72-.642-1.207-1.435-1.35-1.677-.141-.242-.015-.373.106-.494.109-.108.242-.282.363-.423.121-.141.161-.242.242-.403.081-.161.04-.302-.02-.423-.06-.121-.543-1.312-.744-1.797-.196-.471-.396-.406-.543-.414l-.462-.008c-.161 0-.423.06-.646.282-.221.221-.86.841-.86 2.049 0 1.208.88 2.377 1.002 2.54.121.161 1.73 2.646 4.187 3.601.586.201 1.042.321 1.399.411.587.149 1.122.128 1.545.078.471-.057 1.432-.586 1.634-1.152.202-.566.202-1.051.141-1.152-.06-.101-.221-.161-.463-.282z"/></svg>
                WhatsApp
              </a>
            </div>
          </>
        )}

        {(city || state) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{[city, state].filter(Boolean).join(", ")}</span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t('card.projectCount', { count: projectCount })}
            </p>
          </div>
          
          {activeProjects.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {activeProjects.map((project) => (
                <Badge 
                  key={project.id} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {project.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
