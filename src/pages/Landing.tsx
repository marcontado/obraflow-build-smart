import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { GlassSidebar } from "@/components/landing/GlassSidebar";
import { StorySection } from "@/components/landing/StorySection";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { TestimonialCard } from "@/components/landing/TestimonialCard";
import { PlanCardPublic } from "@/components/landing/PlanCardPublic";
import { FAQSection } from "@/components/landing/FAQSection";
import { ArrowRight, Sparkles, Calendar, Users, BarChart3, FileText, Palette, Ruler } from "lucide-react";
import architectWoman from "@/assets/architect-woman.jpg";
import designerMan from "@/assets/designer-man.jpg";
import workspaceModern from "@/assets/workspace-modern.jpg";
import teamCollaboration from "@/assets/team-collaboration.jpg";
import { useEffect, useState } from "react";

export default function Landing() {
  const [showWhatsappLabel, setShowWhatsappLabel] = useState(true);
  
  // Forçar tema claro na Landing Page
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

  useEffect(() => {
    const timer = setTimeout(() => setShowWhatsappLabel(false), 10000);
    // Scroll suave se houver intenção salva
    const tryScroll = () => {
      const scrollToSection = localStorage.getItem("scrollToSection");
      if (scrollToSection) {
        const section = document.getElementById(scrollToSection);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(() => {
            // Ajuste de offset para header fixo (ex: 64px)
            window.scrollBy({ top: -64, left: 0, behavior: "smooth" });
          }, 400); // tempo para scrollIntoView terminar
          localStorage.removeItem("scrollToSection");
        } else {
          setTimeout(tryScroll, 150);
        }
      }
    };
    tryScroll();
    return () => clearTimeout(timer);
  }, []);
  return (
  <div className="min-h-screen bg-gradient-to-b from-background via-background to-card relative">
  <LandingNavbar />
  {/* âncora invisível para scroll do botão Início */}
  <div id="hero" style={{ position: "relative", top: "-96px", height: 0 }} aria-hidden="true" />
  <GlassSidebar />

      {/* Botão flutuante WhatsApp com label temporária */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {showWhatsappLabel && (
          <div className="px-4 py-2 rounded-lg bg-white text-green-700 font-semibold shadow-lg animate-fade-in whitespace-nowrap">
            Fale com um dos nossos consultores
          </div>
        )}
        <a
          href="https://wa.me/5511979594378"
          target="_blank"
          rel="noopener noreferrer"
          className="shadow-lg rounded-full bg-green-500 hover:bg-green-600 transition w-16 h-16 flex items-center justify-center"
          aria-label="Fale com um dos nossos consultores pelo WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.657.336 3.236.956 4.684L2 22l5.455-1.797A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.528 0-3.018-.437-4.29-1.262l-.306-.192-3.237 1.067 1.07-3.155-.198-.324A7.963 7.963 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-5.845c-.242-.121-1.432-.707-1.653-.788-.221-.081-.382-.121-.543.121-.161.242-.623.788-.763.95-.14.161-.282.181-.523.06-.242-.121-1.022-.377-1.947-1.201-.72-.642-1.207-1.435-1.35-1.677-.141-.242-.015-.373.106-.494.109-.108.242-.282.363-.423.121-.141.161-.242.242-.403.081-.161.04-.302-.02-.423-.06-.121-.543-1.312-.744-1.797-.196-.471-.396-.406-.543-.414l-.462-.008c-.161 0-.423.06-.646.282-.221.221-.86.841-.86 2.049 0 1.208.88 2.377 1.002 2.54.121.161 1.73 2.646 4.187 3.601.586.201 1.042.321 1.399.411.587.149 1.122.128 1.545.078.471-.057 1.432-.586 1.634-1.152.202-.566.202-1.051.141-1.152-.06-.101-.221-.161-.463-.282z"/></svg>
        </a>
      </div>
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
  <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-card/60 backdrop-blur-glass border border-white/20 shadow-glass">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-foreground">Gestão Arquitetônica Inteligente</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold leading-tight">
              <span className="text-foreground">
                Projete o Futuro
              </span>
              <br />
              <span className="text-primary animate-shimmer">
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
                <Button size="lg" className="group relative overflow-hidden bg-primary hover:bg-primary/90 hover:shadow-glow transition-all duration-500 text-lg px-8 py-6">
                  <span className="relative z-10 flex items-center gap-2">
                    Começar Gratuitamente
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Link to="/plans">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/50 dark:bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-500">
                  Ver Planos
                </Button>
              </Link>
            </div>

            {/* Architectural accent lines */}
            <div className="flex justify-center gap-4 pt-8">
              <div className="h-1 w-24 bg-primary/50 rounded-full animate-pulse" />
              <div className="h-1 w-16 bg-accent/50 rounded-full animate-pulse delay-75" />
              <div className="h-1 w-20 bg-arch-gold/50 rounded-full animate-pulse delay-150" />
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
      <section id="recursos" className="py-20 bg-primary/5">
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
        <div className="absolute inset-0 bg-accent/5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            {/* âncora invisível para scroll com offset */}
            <div id="ferramentas" style={{ position: "relative", top: "-96px", height: 0 }} aria-hidden="true" />
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
      <section id="planos" className="py-20 bg-primary/5">
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
              recommendation="Ideal para testar a plataforma"
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
              price={149}
              description="Para escritórios em crescimento"
              recommendation="Ideal para autônomos e profissionais independentes"
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
              price={399}
              description="Solução empresarial completa"
              recommendation="Para escritórios ou equipes maiores"
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

  {/* Plans Preview Section */}
  <section id="planos" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="font-heading font-bold mb-6 text-foreground">Escolha o plano ideal</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comece grátis e evolua conforme sua necessidade — sem compromisso
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

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <section id="contato" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-foreground leading-tight">
              Pronto para Transformar
              <br />
              <span className="text-primary">
                Sua Gestão Arquitetônica?
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Junte-se a centenas de arquitetos que já elevaram sua produtividade
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/auth">
                <Button size="lg" className="group bg-primary hover:bg-primary/90 hover:shadow-glow transition-all duration-500 text-lg px-8 py-6">
                  <span className="flex items-center gap-2">
                    Criar Conta Gratuita
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
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
