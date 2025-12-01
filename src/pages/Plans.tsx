import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PlanCardPublic } from "@/components/landing/PlanCardPublic";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TRIAL_DAYS } from "@/constants/plans";

export default function Plans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Forçar tema claro na página de planos
  useEffect(() => {
    const htmlElement = document.documentElement;
    const hadDarkClass = htmlElement.classList.contains('dark');
    htmlElement.classList.remove('dark');
    
    return () => {
      if (hadDarkClass) {
        htmlElement.classList.add('dark');
      }
    };
  }, []);

  const plans = [
    {
      name: "Atelier",
      planId: "atelier",
      price: billingCycle === "monthly" ? 39.90 : 430.92,
      description: "Para começar sua jornada",
      recommendation: "Perfeito para testar a plataforma",
      features: [
        "1 workspace",
        "Até 3 membros",
        "2 projetos ativos",
        "Até 5 clientes",
        "Kanban básico",
        "Relatórios simples",
        "Uploads até 2 GB",
        "Suporte por email",
      ],
    },
    {
      name: "Studio",
      planId: "studio",
      price: billingCycle === "monthly" ? 149.90 : 1618.92,
      description: "Para designers e pequenos escritórios",
      recommendation: "Ideal para autonômos e profissionais independetes",
      features: [
        "2 workspaces com até 10 membros",
        "Projetos e clientes ilimitados",
        "Dashboard completo com métricas",
        "Cronograma Gantt e orçamentos por área",
        "Relatórios automáticos e exportáveis",
        "Armazenamento de 10 GB",
        "Sistema de convites e permissões",
        "Suporte por e-mail",
      ],
      highlighted: true,
    },
    {
      name: "Domus",
      planId: "domus",
      price: billingCycle === "monthly" ? 399.90 : 4318.92,
      description: "Para escritórios estabelecidos",
      recommendation: "Para escritórios ou equipes maiores",
      features: [
        "Workspaces e membros ilimitados",
        "Projetos e clientes ilimitados",
        "Dashboard completo e customizado",
        "Cronograma Gantt e orçamentos",
        "Relatórios avançados e exportáveis",
        "IA Assist para cronogramas e orçamentos",
        "Portal do Cliente com aprovações digitais",
        "Automação de tarefas e alertas",
        "Armazenamento de 100 GB",
        "Marca branca (logo e cores do escritório)",
        "Suporte prioritário",
        "Documentos e controle de versões (LGPD)",
      ],
    },
  ];

  const faqs = [
    {
      question: "Posso mudar de plano depois?",
      answer:
        "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas imediatamente e o valor é ajustado proporcionalmente.",
    },
    {
      question: "Como funciona o período gratuito?",
      answer:
        `Todos os planos oferecem ${TRIAL_DAYS} dias grátis para você testar todos os recursos antes de ser cobrado. Você também pode optar por começar pagando imediatamente, sem período de teste.`,
    },
    {
      question: "Posso começar pagando sem período de teste?",
      answer:
        "Sim! Ao escolher um plano pago, você pode optar por testar por 15 dias grátis ou começar pagando imediatamente. As duas opções estão disponíveis na página de planos.",
    },
    {
      question: "Qual plano é ideal para mim?",
      answer:
        "O plano Studio é ideal para autônomos e profissionais independentes que precisam gerenciar múltiplos projetos. Já o plano Domus é perfeito para escritórios ou equipes maiores que necessitam de recursos avançados como IA Assist e Portal do Cliente.",
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer:
        "Sim, não há período de fidelidade. Você pode cancelar sua assinatura quando quiser e continuará tendo acesso até o final do período pago.",
    },
    {
      question: "O que acontece se eu exceder os limites?",
      answer:
        "Você receberá notificações quando estiver próximo dos limites. Para continuar criando projetos ou adicionando membros, basta fazer upgrade para um plano superior.",
    },
    {
      question: "Quais formas de pagamento vocês aceitam?",
      answer:
        "Aceitamos cartão de crédito (Visa, Mastercard, Amex) e PIX. Para planos anuais, também oferecemos boleto bancário.",
    },
    {
      question: "Há desconto para pagamento anual?",
      answer:
        "Sim! Ao optar pelo pagamento anual, você economiza 10% em comparação ao pagamento mensal.",
    },
    {
      question: "Precisam de ajuda personalizada?",
      answer:
        "Nosso time de suporte está sempre disponível. Planos Studio têm suporte prioritário por email, e planos Domus têm suporte 24/7 incluindo WhatsApp.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-foreground">Escolha seu plano</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Comece grátis e evolua conforme sua necessidade
            </p>

            <div className="inline-flex items-center gap-4 bg-muted p-1 rounded-lg">
              <Button
                variant={billingCycle === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingCycle("monthly")}
              >
                Mensal
              </Button>
              <Button
                variant={billingCycle === "yearly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingCycle("yearly")}
              >
                Anual
                <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                  -10%
                </span>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {plans.map((plan, index) => (
              <PlanCardPublic key={index} {...plan} billingCycle={billingCycle} />
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Perguntas Frequentes</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Ainda com dúvidas?</p>
            <Button variant="outline" asChild>
              <a href="mailto:contato@archestra.com">Entre em Contato</a>
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
