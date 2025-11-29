import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TRIAL_DAYS } from "@/constants/plans";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Como funciona o período de teste gratuito?",
    answer: `Todos os planos oferecem ${TRIAL_DAYS} dias grátis para você testar todos os recursos antes de ser cobrado. Você também pode optar por começar pagando imediatamente, sem período de teste, se preferir.`
  },
  {
    question: "Posso mudar de plano a qualquer momento?",
    answer: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. Ao fazer upgrade, você terá acesso imediato às novas funcionalidades. No downgrade, as mudanças entram em vigor no próximo ciclo de cobrança."
  },
  {
    question: "Como funciona a colaboração em equipe?",
    answer: "Você pode convidar membros para seu workspace através de email. Cada membro pode ter diferentes permissões (Owner, Admin ou Member) e acessar projetos compartilhados em tempo real. Todas as mudanças são sincronizadas instantaneamente."
  },
  {
    question: "Os dados dos meus projetos estão seguros?",
    answer: "Sim, levamos a segurança muito a sério. Todos os dados são criptografados em trânsito e em repouso. Fazemos backups automáticos diários e você pode exportar seus dados a qualquer momento. Nossos servidores seguem padrões internacionais de segurança."
  },
  {
    question: "Posso integrar com outras ferramentas?",
    answer: "No plano Domus, oferecemos API de integração que permite conectar a plataforma com outras ferramentas que você já usa, como sistemas de gestão financeira, CRM e ferramentas de design. Também exportamos dados em diversos formatos."
  },
  {
    question: "Como funciona o Gantt interativo?",
    answer: "Nosso Gantt permite visualizar e gerenciar o cronograma de forma visual e intuitiva. Você pode arrastar tarefas, criar dependências, ajustar prazos e ver o progresso em tempo real. Tudo com interface responsiva e fácil de usar."
  },
  {
    question: "Existe suporte técnico disponível?",
    answer: "Sim! Todos os planos têm acesso ao nosso suporte por email. O plano Domus inclui suporte prioritário com tempo de resposta mais rápido. Também temos uma base de conhecimento completa com tutoriais e guias."
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura quando quiser, sem multas ou taxas. Você continuará tendo acesso até o final do período já pago. Após o cancelamento, seus dados ficam salvos por 30 dias caso queira reativar."
  }
];

export function FAQSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              Perguntas Frequentes
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
              Tire suas Dúvidas
            </h2>
            <p className="text-xl text-muted-foreground">
              Encontre respostas para as perguntas mais comuns sobre a plataforma
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="relative">
            {/* Glass morphism container */}
            <div className="absolute inset-0 bg-white/50 dark:bg-card/50 backdrop-blur-sm border border-white/20 dark:border-border/30 rounded-3xl shadow-glass" />
            
            <div className="relative z-10 p-8 md:p-12">
              <Accordion type="single" collapsible className="space-y-6">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-b border-border/30 last:border-0 group"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-6 hover:text-primary transition-colors duration-300">
                      <div className="flex items-start gap-4 pr-4">
                        {/* Question number badge */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                          {index + 1}
                        </div>
                        <span className="text-lg font-heading font-semibold text-card-foreground">
                          {faq.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground leading-relaxed pl-12 pr-4 pb-6 pt-2">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Não encontrou o que procurava?
            </p>
            <a
              href="#contato"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors duration-300"
            >
              Entre em contato conosco
              <Plus className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
