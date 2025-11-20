import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { styleOptions } from "@/types/project.types";
import type { ProjectWizardData } from "@/schemas/project.schema";

interface ProjectBriefingStepProps {
  form: UseFormReturn<ProjectWizardData>;
}

export function ProjectBriefingStep({ form }: ProjectBriefingStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Estas informações ajudarão a contextualizar o projeto e alinhar expectativas.
      </p>

      <FormField
        control={form.control}
        name="briefing.goal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objetivo Principal do Projeto</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva o principal objetivo deste projeto..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Ex: Renovar apartamento para modernizar espaços e melhorar funcionalidade
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="briefing.style"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estilo Desejado</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estilo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {styleOptions.map(style => (
                  <SelectItem key={style} value={style}>
                    {style}
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
        name="briefing.audience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Público-alvo / Usuários</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Casal jovem, 2 filhos e 1 pet"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Quem usará este espaço?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="briefing.needs"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Principais Necessidades e Expectativas</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Liste as principais necessidades do cliente..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Ex: Mais espaço de armazenamento, home office, iluminação natural
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="briefing.restrictions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Restrições Técnicas ou Orçamentárias</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva limitações do projeto..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Ex: Não pode alterar estrutura, orçamento limitado a R$ 50k
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="briefing.preferred_materials"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Materiais Preferidos / A Evitar</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Liste materiais preferidos ou que devem ser evitados..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Ex: Preferir madeira natural, evitar plástico e materiais sintéticos
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="briefing.references_links"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Links de Referência</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Cole links de inspiração (Pinterest, Behance, ArchDaily, Instagram...)"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Um link por linha
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
