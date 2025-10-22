import { Link } from "react-router-dom";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { TestimonialCard } from "@/components/landing/TestimonialCard";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PlanCardPublic } from "@/components/landing/PlanCardPublic";
import { Button } from "@/components/ui/button";
import { Columns3, DollarSign, BarChart3, Sparkles, Users, Calendar, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-workspace.jpg";

export default function Landing() {
  const features = [
    {
      icon: Columns3,
      title: "Kanban Visual",
      description: "Organize tarefas com quadros visuais intuitivos e arraste para reorganizar",
    },
    {
      icon: DollarSign,
      title: "Orçamento Inteligente",
      description: "Controle custos e compare orçado vs. realizado em tempo real",
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Gere relatórios completos em segundos com gráficos e análises",
    },
    {
      icon: Sparkles,
      title: "Assistente IA",
      description: "Deixe a IA te ajudar a otimizar processos e tomar decisões",
    },
    {
      icon: Users,
      title: "Portal do Cliente",
      description: "Clientes acompanham seus projetos em tempo real",
    },
    {
      icon: Calendar,
      title: "Gantt Automático",
      description: "Visualize cronogramas e prazos facilmente com gráficos de Gantt",
    },
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Designer de Interiores",
      company: "Silva Design",
      testimonial: "Com Archestra, consegui organizar 5 obras simultâneas sem perder o controle. Essencial!",
      initials: "MS",
    },
    {
      name: "João Costa",
      role: "Arquiteto",
      company: "Costa Arquitetura",
      testimonial: "A melhor ferramenta para gestão de projetos. Economizo horas toda semana!",
      initials: "JC",
    },
    {
      name: "Ana Paula",
      role: "Designer",
      company: "AP Studio",
      testimonial: "Meus clientes adoram acompanhar o progresso. Profissionalismo e transparência!",
      initials: "AP",
    },
  ];

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
      ],
    },
    {
      name: "Studio",
      price: billingCycle === "monthly" ? 149 : 134,
      description: "Para designers e pequenos escritórios",
      planId: "studio",
      features: [
        "2 workspaces com até 10 membros",
        "Projetos e clientes ilimitados",
        "Dashboard completo com métricas",
        "Cronograma Gantt e orçamentos",
        "Relatórios automáticos",
        "Armazenamento de 10 GB",
      ],
    },
    {
      name: "Domus",
      price: billingCycle === "monthly" ? 399 : 359,
      description: "Para escritórios estabelecidos",
      planId: "domus",
      features: [
        "Workspaces e membros ilimitados",
        "Projetos e clientes ilimitados",
        "IA Assist para cronogramas",
        "Portal do Cliente",
        "Relatórios customizados",
        "100 GB de armazenamento",
        "Suporte prioritário",
      ],
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6">
                30 dias grátis • Sem cartão de crédito
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Gestão de obras simplificada para designers
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Organize projetos, gerencie orçamentos e acompanhe obras em um único lugar
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/auth?tab=signup">
                    Começar Grátis <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/plans">Ver Planos</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Workspace de design"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Recursos Poderosos</h2>
            <p className="text-xl text-muted-foreground">
              Tudo que você precisa para gerenciar suas obras com eficiência
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Resultados Reais</h2>
            <p className="text-xl text-muted-foreground">
              Veja o impacto na sua produtividade
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg bg-card border border-border">
              <div className="text-5xl font-bold text-primary mb-2">10h</div>
              <p className="text-muted-foreground">Economize até 10h/semana em gestão</p>
            </div>
            <div className="text-center p-8 rounded-lg bg-card border border-border">
              <div className="text-5xl font-bold text-accent mb-2">40%</div>
              <p className="text-muted-foreground">Reduza atrasos em até 40%</p>
            </div>
            <div className="text-center p-8 rounded-lg bg-card border border-border">
              <div className="text-5xl font-bold text-secondary mb-2">3x</div>
              <p className="text-muted-foreground">Clientes 3x mais satisfeitos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">O que dizem nossos clientes</h2>
            <p className="text-xl text-muted-foreground">
              Designers e arquitetos confiam no Archestra
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Plans Preview Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Escolha o plano ideal</h2>
            <p className="text-xl text-muted-foreground">
              Comece grátis e evolua conforme sua necessidade
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <PlanCardPublic key={index} {...plan} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/plans">Ver Todos os Planos e Detalhes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-primary-foreground">
            Pronto para transformar sua gestão de obras?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Não é necessário cartão de crédito
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth?tab=signup">
              Começar Grátis Agora <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
