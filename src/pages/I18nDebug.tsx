import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";

export default function I18nDebug() {
  const { t: tSettings, i18n: i18nSettings } = useTranslation('settings');
  const { t: tNav, i18n: i18nNav } = useTranslation('navigation');
  const { t: tProjects, i18n: i18nProjects } = useTranslation('projects');
  const { t: tCommon, i18n: i18nCommon } = useTranslation('common');
  const { locale, setLocale } = useLocale();

  const allNamespaces = ['common', 'auth', 'navigation', 'settings', 'projects', 'clients', 'errors', 'dashboard', 'tasks', 'partners'];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="🔍 i18n Debug" subtitle="Sistema de diagnóstico de traduções" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            
            {/* Current State */}
            <Card>
              <CardHeader>
                <CardTitle>Estado Atual do i18n</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Idioma Atual:</strong> {i18nCommon.language}
                  </div>
                  <div>
                    <strong>Idioma do LocaleContext:</strong> {locale}
                  </div>
                  <div>
                    <strong>Inicializado:</strong>{' '}
                    {i18nCommon.isInitialized ? (
                      <Badge variant="default" className="bg-green-500">✅ Sim</Badge>
                    ) : (
                      <Badge variant="destructive">❌ Não</Badge>
                    )}
                  </div>
                  <div>
                    <strong>Fallback Language:</strong> {i18nCommon.options.fallbackLng as string}
                  </div>
                </div>

                <div className="mt-4">
                  <strong>Trocar Idioma:</strong>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => setLocale('pt')} variant={locale === 'pt' ? 'default' : 'outline'}>
                      PT
                    </Button>
                    <Button size="sm" onClick={() => setLocale('en')} variant={locale === 'en' ? 'default' : 'outline'}>
                      EN
                    </Button>
                    <Button size="sm" onClick={() => setLocale('es')} variant={locale === 'es' ? 'default' : 'outline'}>
                      ES
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Namespace Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Namespaces</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {allNamespaces.map(ns => {
                    const isLoaded = i18nCommon.hasLoadedNamespace(ns);
                    const hasData = i18nCommon.store?.data?.[i18nCommon.language]?.[ns];
                    return (
                      <div key={ns} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-mono text-sm">{ns}</span>
                        {isLoaded && hasData ? (
                          <Badge variant="default" className="bg-green-500">✅</Badge>
                        ) : (
                          <Badge variant="destructive">❌</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Translation Tests */}
            <Card>
              <CardHeader>
                <CardTitle>Testes de Tradução</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="font-semibold">Namespace: settings</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-mono text-muted-foreground">security.title</div>
                    <div className="font-bold">"{tSettings('security.title')}"</div>
                    
                    <div className="font-mono text-muted-foreground">security.changePassword.title</div>
                    <div className="font-bold">"{tSettings('security.changePassword.title')}"</div>
                    
                    <div className="font-mono text-muted-foreground">security.changePassword.button</div>
                    <div className="font-bold">"{tSettings('security.changePassword.button')}"</div>
                    
                    <div className="font-mono text-muted-foreground">security.changePassword.current</div>
                    <div className="font-bold">"{tSettings('security.changePassword.current')}"</div>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="font-semibold">Namespace: navigation</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-mono text-muted-foreground">menu.support</div>
                    <div className="font-bold">"{tNav('menu.support')}"</div>
                    
                    <div className="font-mono text-muted-foreground">menu.financial</div>
                    <div className="font-bold">"{tNav('menu.financial')}"</div>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="font-semibold">Namespace: projects</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-mono text-muted-foreground">card.progress</div>
                    <div className="font-bold">"{tProjects('card.progress')}"</div>
                    
                    <div className="font-mono text-muted-foreground">card.until</div>
                    <div className="font-bold">"{tProjects('card.until')}"</div>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="font-semibold">Namespace: common</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-mono text-muted-foreground">welcome</div>
                    <div className="font-bold">"{tCommon('welcome')}"</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raw Data Inspection */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Brutos do i18n.store</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(i18nCommon.store.data, null, 2)}
                </pre>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}
