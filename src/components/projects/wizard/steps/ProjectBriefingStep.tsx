import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { styleOptions } from "@/types/project.types";
import type { ProjectWizardData } from "@/schemas/project.schema";
import { Separator } from "@/components/ui/separator";

interface ProjectBriefingStepProps {
  form: UseFormReturn<ProjectWizardData>;
}

export function ProjectBriefingStep({ form }: ProjectBriefingStepProps) {
  const watchedStyles = form.watch("briefing.styles") || [];

  const handleStyleToggle = (style: string) => {
    const currentStyles = watchedStyles;
    const newStyles = currentStyles.includes(style)
      ? currentStyles.filter(s => s !== style)
      : [...currentStyles, style];
    form.setValue("briefing.styles", newStyles);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Informações do Briefing</h3>
        <p className="text-sm text-muted-foreground">
          Preencha as informações do projeto para alinhar expectativas e objetivos.
        </p>
      </div>

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

      <div className="space-y-3">
        <Label>Estilos Desejados (selecione um ou mais)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {styleOptions.map((style) => (
            <div key={style} className="flex items-center space-x-2">
              <Checkbox
                id={`style-${style}`}
                checked={watchedStyles.includes(style)}
                onCheckedChange={() => handleStyleToggle(style)}
              />
              <label
                htmlFor={`style-${style}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {style}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-base font-semibold mb-3">Perfil do Cliente</h4>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="briefing.client_profile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Perfil Detalhado</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o perfil do cliente (idade, profissão, estilo de vida...)"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="briefing.client_desires"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desejos do Cliente</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="O que o cliente deseja alcançar com este projeto?"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="briefing.client_pains"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dores e Problemas</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Quais problemas o cliente enfrenta atualmente?"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="briefing.client_essence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Essência / Identidade</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Qual é a essência e identidade do cliente?"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="briefing.client_objectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objetivos e Prioridades</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Quais são os objetivos e prioridades principais?"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      <FormField
        control={form.control}
        name="briefing.audience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Público-alvo / Usuários do Espaço</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Casal jovem, 2 filhos e 1 pet"
                className="min-h-[60px]"
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

      <Separator />

      <FormField
        control={form.control}
        name="briefing.field_research"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pesquisa de Campo / Visita Técnica</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Registre informações importantes da visita ao local..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Observações importantes sobre o local, medidas, estrutura atual, etc.
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
