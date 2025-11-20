import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Star, Lightbulb } from "lucide-react";

export function DefaultTemplatesBanner() {
  return (
    <Alert className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
      <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-900 dark:text-amber-200">
        Templates Padrão Disponíveis
      </AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-300">
        <div className="space-y-2 mt-2">
          <p className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              Criamos automaticamente 4 templates profissionais para você começar: Contrato de Serviços, 
              Proposta Comercial, Relatório Técnico e Termo de Entrega.
            </span>
          </p>
          <p className="text-sm">
            Todos os templates usam <strong>variáveis dinâmicas</strong> que são preenchidas automaticamente 
            com os dados dos seus clientes e projetos. Você pode editar, duplicar ou criar novos templates 
            do zero a qualquer momento.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
