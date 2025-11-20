import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Type, FileText, List, Scissors, FileSignature, Trash2 } from "lucide-react";
import type { TemplateContent, ContentBlock } from "@/types/template.types";

interface TemplateEditorProps {
  content: TemplateContent;
  onChange: (content: TemplateContent) => void;
}

export function TemplateEditor({ content, onChange }: TemplateEditorProps) {
  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: type === "signature" ? "" : "Digite aqui...",
      ...(type === "signature" && {
        signatureField: {
          id: crypto.randomUUID(),
          type: "cliente",
          label: "Assinatura do Cliente",
        },
      }),
    };

    onChange({
      blocks: [...content.blocks, newBlock],
    });
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange({
      blocks: content.blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      ),
    });
  };

  const deleteBlock = (id: string) => {
    onChange({
      blocks: content.blocks.filter((block) => block.id !== id),
    });
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = content.blocks.findIndex((b) => b.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === content.blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...content.blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];

    onChange({ blocks: newBlocks });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBlock("heading1")}
            >
              <Type className="h-4 w-4 mr-2" />
              Título H1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBlock("heading2")}
            >
              <Type className="h-4 w-4 mr-2" />
              Título H2
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBlock("paragraph")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Parágrafo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBlock("list")}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBlock("pagebreak")}
            >
              <Scissors className="h-4 w-4 mr-2" />
              Quebra de Página
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBlock("signature")}
            >
              <FileSignature className="h-4 w-4 mr-2" />
              Campo de Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Blocks */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {content.blocks.map((block, index) => (
              <div
                key={block.id}
                className="border rounded-lg p-4 space-y-3 bg-background"
              >
                <div className="flex items-center justify-between">
                  <Select
                    value={block.type}
                    onValueChange={(value) =>
                      updateBlock(block.id, { type: value as any })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heading1">Título H1</SelectItem>
                      <SelectItem value="heading2">Título H2</SelectItem>
                      <SelectItem value="heading3">Título H3</SelectItem>
                      <SelectItem value="paragraph">Parágrafo</SelectItem>
                      <SelectItem value="list">Lista</SelectItem>
                      <SelectItem value="signature">Assinatura</SelectItem>
                      <SelectItem value="pagebreak">Quebra de Página</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveBlock(block.id, "up")}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveBlock(block.id, "down")}
                      disabled={index === content.blocks.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteBlock(block.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {block.type === "pagebreak" ? (
                  <div className="border-t-2 border-dashed py-4 text-center text-sm text-muted-foreground">
                    Quebra de Página
                  </div>
                ) : block.type === "signature" ? (
                  <div className="border-2 border-dashed p-4 text-center">
                    <FileSignature className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {block.signatureField?.label || "Campo de Assinatura"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      _________________________________________
                    </p>
                  </div>
                ) : (
                  <Textarea
                    value={block.content}
                    onChange={(e) =>
                      updateBlock(block.id, { content: e.target.value })
                    }
                    placeholder="Digite o conteúdo..."
                    className={`min-h-[100px] ${
                      block.type === "heading1"
                        ? "text-3xl font-bold"
                        : block.type === "heading2"
                        ? "text-2xl font-semibold"
                        : block.type === "heading3"
                        ? "text-xl font-semibold"
                        : ""
                    }`}
                  />
                )}
              </div>
            ))}

            {content.blocks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum bloco adicionado ainda</p>
                <p className="text-sm">Use os botões acima para adicionar conteúdo</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
