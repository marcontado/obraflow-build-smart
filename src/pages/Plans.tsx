import { useState } from "react";
import { Link } from "react-router-dom";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PlanCardPublic } from "@/components/landing/PlanCardPublic";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Plans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Atelier",
      planId: "atelier",
      price: 0,
      description: "Para começar sua jornada",
      features: [
        "1 workspace",
        "2 projetos ativos",
        "Kanban básico",
        "Relatórios simples",
        "Armazenamento 500MB",
        "Suporte por email",
      ],
    },
    {
      name: "Studio",
      planId: "studio",
      price: billingCycle === "monthly" ? 97 : 970,
      description: "Para profissionais em crescimento",
      features: [
        "1 workspace",
        "10 projetos ativos",
        "Kanban completo com automações",
        "Relatórios avançados com gráficos",
        "Portal do cliente personalizado",
        "Até 5 membros da equipe",
        "Armazenamento 5GB",
        "Suporte prioritário",
        "Integrações básicas",
      ],
      highlighted: true,
    },
    {
      name: "Dommus",
      planId: "dommus",
      price: billingCycle === "monthly" ? 297 : 2970,
      description: "Para escritórios estabelecidos",
      features: [
        "Workspaces ilimitados",
        "Projetos ilimitados",
        "Todos os recursos do Studio",
        "Assistente IA para otimização",
        "Membros ilimitados",
        "Armazenamento 50GB",
        "Suporte prioritário 24/7",
        "API personalizada",
        "White-label disponível",
        "Treinamento personalizado",
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
        "O plano Atelier é totalmente gratuito para sempre. Nos planos pagos, você tem 30 dias grátis para testar todos os recursos antes de ser cobrado.",
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
        "Sim! Ao optar pelo pagamento anual, você economiza 20% em comparação ao pagamento mensal. São 10 meses pelo preço de 12!",
    },
    {
      question: "Precisam de ajuda personalizada?",
      answer:
        "Nosso time de suporte está sempre disponível. Planos Studio têm suporte prioritário por email, e planos Dommus têm suporte 24/7 incluindo WhatsApp.",
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
                  -20%
                </span>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {plans.map((plan, index) => (
              <PlanCardPublic key={index} {...plan} />
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
