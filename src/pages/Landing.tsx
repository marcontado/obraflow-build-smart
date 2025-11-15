import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { GlassSidebar } from "@/components/landing/GlassSidebar";
import { StorySection } from "@/components/landing/StorySection";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { TestimonialCard } from "@/components/landing/TestimonialCard";
import { PlanCardPublic } from "@/components/landing/PlanCardPublic";
import { ArrowRight, Sparkles, Calendar, Users, BarChart3, FileText, Palette, Ruler } from "lucide-react";
import architectWoman from "@/assets/architect-woman.jpg";
import designerMan from "@/assets/designer-man.jpg";
import workspaceModern from "@/assets/workspace-modern.jpg";
import teamCollaboration from "@/assets/team-collaboration.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <GlassSidebar />

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-glow" />
        
        {/* Architectural grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb)/0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb)/0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-card/60 backdrop-blur-glass border border-white/20 shadow-glass">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-foreground">Gestão Arquitetônica Inteligente</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold leading-tight">
              <span className="bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                Projete o Futuro
              </span>
              <br />
              <span className="bg-gradient-to-br from-primary via-accent to-arch-gold bg-clip-text text-transparent animate-shimmer">
                da sua Arquitetura
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A plataforma completa que transforma a gestão de projetos arquitetônicos em uma experiência fluida, visual e colaborativa
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/auth">
                <Button size="lg" className="group relative overflow-hidden bg-gradient-to-br from-primary to-accent hover:shadow-glow transition-all duration-500 text-lg px-8 py-6">
                  <span className="relative z-10 flex items-center gap-2">
                    Começar Gratuitamente
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Button>
              </Link>
              <Link to="/plans">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/50 dark:bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10 transition-all duration-500">
                  Ver Planos
                </Button>
              </Link>
            </div>

            {/* Architectural accent lines */}
            <div className="flex justify-center gap-4 pt-8">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-pulse" />
              <div className="h-1 w-16 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full animate-pulse delay-75" />
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-arch-gold to-transparent rounded-full animate-pulse delay-150" />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center p-2">
            <div className="w-1.5 h-3 bg-primary rounded-full animate-slide-down" />
          </div>
        </div>
      </section>

      {/* Story Sections */}
      <section id="recursos" className="py-20 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
              Como Transformamos Seu Trabalho
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma jornada visual através das funcionalidades que fazem a diferença
            </p>
          </div>

          <StorySection
            step="1"
            title="Visualize Cada Detalhe"
            description="Gantt interativo que transforma cronogramas complexos em visualizações claras e intuitivas. Acompanhe cada fase do projeto com precisão arquitetônica, ajuste prazos com facilidade e identifique dependências instantaneamente."
            image={workspaceModern}
            imageAlt="Workspace moderno de arquitetura com múltiplas telas mostrando projetos"
          />

          <StorySection
            step="2"
            title="Colabore em Tempo Real"
            description="Sua equipe, seus clientes e fornecedores conectados em uma única plataforma. Compartilhe progresso, receba feedback instantâneo e mantenha todos alinhados com o conceito do projeto, do primeiro esboço à entrega final."
            image={teamCollaboration}
            imageAlt="Equipe de arquitetos colaborando em projeto"
            reverse
          />

          <StorySection
            step="3"
            title="Controle Financeiro Preciso"
            description="Orçamentos detalhados por área do projeto, acompanhamento de gastos em tempo real e relatórios visuais que simplificam decisões complexas. Mantenha a rentabilidade sem perder a criatividade."
            image={architectWoman}
            imageAlt="Arquiteta trabalhando com plantas e orçamentos"
          />

          <StorySection
            step="4"
            title="Gestão Profissional"
            description="De briefings a entregas finais, organize cada etapa com elegância. Cadastre clientes, gerencie múltiplos projetos simultaneamente e acesse relatórios detalhados que impressionam e informam."
            image={designerMan}
            imageAlt="Designer de interiores apresentando projeto para cliente"
            reverse
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              Recursos Completos
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
              Ferramentas para Arquitetos Modernos
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <FeatureCard
              icon={Calendar}
              title="Gantt Interativo"
              description="Cronogramas visuais que se adaptam ao seu fluxo de trabalho. Arraste, ajuste e visualize dependências com facilidade."
            />
            <FeatureCard
              icon={Users}
              title="Gestão de Equipes"
              description="Atribua tarefas, defina permissões e acompanhe o progresso de cada membro em tempo real."
            />
            <FeatureCard
              icon={BarChart3}
              title="Relatórios Visuais"
              description="Dashboards elegantes que transformam dados em insights acionáveis para seus projetos."
            />
            <FeatureCard
              icon={FileText}
              title="Documentação Organizada"
              description="Centralize briefings, contratos e documentos técnicos em um único lugar acessível."
            />
            <FeatureCard
              icon={Palette}
              title="Interface Refinada"
              description="Design pensado para arquitetos. Interface limpa, moderna e intuitiva como seus projetos."
            />
            <FeatureCard
              icon={Ruler}
              title="Controle de Orçamento"
              description="Gerencie custos por área, acompanhe despesas e mantenha a rentabilidade dos projetos."
            />
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="py-20 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
              Planos para Cada Ateliê
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Do freelancer ao grande escritório, temos o plano perfeito para você
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PlanCardPublic
              name="Atelier"
              price={0}
              description="Perfeito para arquitetos iniciantes"
              features={[
                "1 projeto simultâneo",
                "3 membros da equipe",
                "Gantt básico",
                "5GB de armazenamento"
              ]}
              planId="atelier"
              highlighted={false}
            />
            <PlanCardPublic
              name="Studio"
              price={97}
              description="Para escritórios em crescimento"
              features={[
                "10 projetos simultâneos",
                "10 membros da equipe",
                "Gantt avançado com dependências",
                "50GB de armazenamento",
                "Relatórios personalizados"
              ]}
              planId="studio"
              highlighted={true}
            />
            <PlanCardPublic
              name="Domus"
              price={297}
              description="Solução empresarial completa"
              features={[
                "Projetos ilimitados",
                "Membros ilimitados",
                "Todas as funcionalidades",
                "200GB de armazenamento",
                "Suporte prioritário",
                "API de integração"
              ]}
              planId="domus"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="beneficios" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
              Arquitetos que Confiam
            </h2>
            <p className="text-xl text-muted-foreground">
              Veja o que profissionais estão dizendo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              testimonial="Revolucionou a forma como gerencio meus projetos. O Gantt interativo é simplesmente perfeito."
              name="Marina Silva"
              role="Arquiteta"
              company="Studio MS"
              initials="MS"
            />
            <TestimonialCard
              testimonial="A colaboração com minha equipe ficou muito mais fluida. Todos sabem exatamente o que fazer."
              name="Carlos Mendes"
              role="Diretor"
              company="Mendes Arquitetura"
              initials="CM"
            />
            <TestimonialCard
              testimonial="Os relatórios financeiros me ajudam a tomar decisões mais assertivas e manter os projetos rentáveis."
              name="Ana Paula Costa"
              role="Arquiteta e Urbanista"
              company="APC Design"
              initials="AC"
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="contato" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-arch-gold/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-foreground leading-tight">
              Pronto para Transformar
              <br />
              <span className="bg-gradient-to-br from-primary via-accent to-arch-gold bg-clip-text text-transparent">
                Sua Gestão Arquitetônica?
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Junte-se a centenas de arquitetos que já elevaram sua produtividade
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/auth">
                <Button size="lg" className="group relative overflow-hidden bg-gradient-to-br from-primary to-accent hover:shadow-glow transition-all duration-500 text-lg px-8 py-6">
                  <span className="relative z-10 flex items-center gap-2">
                    Criar Conta Gratuita
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Sem cartão de crédito
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Setup em 2 minutos
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-arch-gold rounded-full animate-pulse" />
                Suporte em português
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
