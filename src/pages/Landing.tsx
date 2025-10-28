import { Link, Navigate } from "react-router-dom";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { TestimonialCard } from "@/components/landing/TestimonialCard";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PlanCardPublic } from "@/components/landing/PlanCardPublic";
import { Button } from "@/components/ui/button";
import { Columns3, DollarSign, BarChart3, Sparkles, Users, Calendar, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-workspace.jpg";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const { user } = useAuth();
  
  // Redirect authenticated users to the app
  if (user) return <Navigate to="/app" replace />;
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
        "Até 3 membros e 5 clientes",
        "2 projetos ativos",
        "Kanban básico",
        "Relatórios simples",
        "Uploads até 2 GB",
      ],
    },
    {
      name: "Studio",
      price: 149,
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
      price: 399,
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <div className="container mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 text-accent rounded-full text-sm font-medium mb-8 shadow-soft">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                30 dias grátis • Sem cartão de crédito
              </div>
              <h1 className="font-heading font-bold mb-8 text-foreground leading-tight">
                Seu atelier digital para gestão de obras
              </h1>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
                Organize projetos, gerencie orçamentos e acompanhe obras em um único lugar — com a elegância que seu trabalho merece.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Button size="lg" asChild className="shadow-elegant">
                  <Link to="/auth?tab=signup">
                    Começar Grátis <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/plans">Ver Planos</Link>
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in-scale">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-30" />
              <img
                src={heroImage}
                alt="Workspace de design"
                className="relative rounded-2xl shadow-elegant hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-24 px-4 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="font-heading font-bold mb-6 text-foreground">Recursos Poderosos</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tudo que você precisa para gerenciar suas obras com eficiência e elegância
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="animate-fade-in-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="font-heading font-bold mb-6 text-foreground">Resultados Reais</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Veja o impacto na sua produtividade e na satisfação dos seus clientes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-10 rounded-2xl bg-gradient-to-br from-card to-background border border-border/50 shadow-md hover:shadow-elegant transition-all duration-500 hover:-translate-y-2">
              <div className="text-6xl font-heading font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">10h</div>
              <p className="text-muted-foreground leading-relaxed">Economize até 10h/semana em gestão</p>
            </div>
            <div className="group text-center p-10 rounded-2xl bg-gradient-to-br from-card to-background border border-border/50 shadow-md hover:shadow-elegant transition-all duration-500 hover:-translate-y-2">
              <div className="text-6xl font-heading font-bold bg-gradient-to-br from-accent to-accent/70 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">40%</div>
              <p className="text-muted-foreground leading-relaxed">Reduza atrasos em até 40%</p>
            </div>
            <div className="group text-center p-10 rounded-2xl bg-gradient-to-br from-card to-background border border-border/50 shadow-md hover:shadow-elegant transition-all duration-500 hover:-translate-y-2">
              <div className="text-6xl font-heading font-bold bg-gradient-to-br from-secondary to-secondary/70 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">3x</div>
              <p className="text-muted-foreground leading-relaxed">Clientes 3x mais satisfeitos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="font-heading font-bold mb-6 text-foreground">O que dizem nossos clientes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Designers e arquitetos confiam no Archestra para transformar sua gestão
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="animate-fade-in-scale"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Preview Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="font-heading font-bold mb-6 text-foreground">Escolha o plano ideal</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comece grátis e evolua conforme sua necessidade — sem compromisso
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className="animate-fade-in-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PlanCardPublic {...plan} />
              </div>
            ))}
          </div>
          <div className="text-center mt-16 animate-fade-in">
            <Button size="lg" variant="outline" asChild>
              <Link to="/plans">Ver Todos os Planos e Detalhes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        
        <div className="container mx-auto text-center relative z-10 animate-fade-in">
          <h2 className="font-heading font-bold mb-6 text-white max-w-3xl mx-auto leading-tight">
            Pronto para transformar sua gestão de obras?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Junte-se a centenas de designers e arquitetos que confiam no Archestra — Não é necessário cartão de crédito
          </p>
          <Button size="lg" variant="secondary" asChild className="shadow-elegant scale-110">
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
