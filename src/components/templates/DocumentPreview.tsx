import { Card, CardContent } from "@/components/ui/card";
import type { TemplateContent } from "@/types/template.types";
import { FileSignature } from "lucide-react";

interface DocumentPreviewProps {
  content: TemplateContent;
}

export function DocumentPreview({ content }: DocumentPreviewProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="bg-white text-black p-12 min-h-[800px] shadow-lg mx-auto max-w-4xl space-y-6">
          {content.blocks.map((block) => {
            if (block.type === "pagebreak") {
              return (
                <div
                  key={block.id}
                  className="border-t-2 border-dashed border-gray-300 my-8 py-4 text-center text-sm text-gray-500"
                >
                  Quebra de Página
                </div>
              );
            }

            if (block.type === "signature") {
              return (
                <div key={block.id} className="mt-12 pt-8">
                  <div className="border-2 border-dashed border-gray-300 p-6 text-center">
                    <FileSignature className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                      {block.signatureField?.label || "Campo de Assinatura"}
                    </p>
                    <p className="text-xs text-gray-500 mt-4">
                      _________________________________________
                    </p>
                  </div>
                </div>
              );
            }

            let className = "text-black";
            
            if (block.type === "heading1") {
              className = "text-3xl font-bold mb-4 text-black";
            } else if (block.type === "heading2") {
              className = "text-2xl font-semibold mb-3 text-black";
            } else if (block.type === "heading3") {
              className = "text-xl font-semibold mb-2 text-black";
            } else if (block.type === "paragraph") {
              className = "text-base leading-relaxed mb-4 text-black";
            } else if (block.type === "list") {
              className = "text-base leading-relaxed mb-4 ml-6 text-black";
            }

            if (block.formatting?.bold) className += " font-bold";
            if (block.formatting?.italic) className += " italic";
            if (block.formatting?.underline) className += " underline";

            const textAlign = block.formatting?.align || "left";

            return (
              <div
                key={block.id}
                className={className}
                style={{ textAlign }}
              >
                {block.type === "list" ? (
                  <ul className="list-disc space-y-1">
                    {block.content.split("\n").map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="whitespace-pre-wrap">{block.content}</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
