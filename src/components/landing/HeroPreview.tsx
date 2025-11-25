import { ScreenshotFrame } from "./ScreenshotFrame";
import dashboardImage from "@/assets/screenshots/dashboard-overview.jpg";

export const HeroPreview = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Interface Moderna
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Veja o Archestra em Ação
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma completa e intuitiva para gerenciar todos os aspectos dos seus projetos de arquitetura e design de interiores
          </p>
        </div>

        {/* Main preview */}
        <div className="relative">
          {/* Floating decorative elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Screenshot with special effects */}
          <div className="relative transform hover:scale-[1.01] transition-transform duration-500">
            <ScreenshotFrame 
              image={dashboardImage}
              alt="Dashboard do Archestra mostrando estatísticas e gráficos de projetos"
              variant="browser"
            />
          </div>
        </div>

        {/* Feature highlights below preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Visualização em Tempo Real</h3>
            <p className="text-sm text-muted-foreground">Acompanhe o progresso dos projetos com dashboards atualizados instantaneamente</p>
          </div>

          <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Totalmente Personalizável</h3>
            <p className="text-sm text-muted-foreground">Adapte a plataforma ao seu fluxo de trabalho e necessidades específicas</p>
          </div>

          <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Performance Rápida</h3>
            <p className="text-sm text-muted-foreground">Interface responsiva e rápida para uma experiência fluida</p>
          </div>
        </div>
      </div>
    </section>
  );
};
