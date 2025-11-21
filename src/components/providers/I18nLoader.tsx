import { ReactNode, useEffect, useState } from 'react';
import i18n from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

interface I18nLoaderProps {
  children: ReactNode;
}

const REQUIRED_NAMESPACES = [
  'common',
  'navigation',
  'settings',
  'projects',
  'auth',
  'clients',
  'dashboard',
  'tasks',
  'errors',
  'partners'
];

export function I18nLoader({ children }: I18nLoaderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkNamespaces = () => {
      console.log('🔍 Checking i18n namespaces...');
      console.log('Current language:', i18n.language);
      
      const allLoaded = REQUIRED_NAMESPACES.every(ns => {
        const hasNs = i18n.hasLoadedNamespace(ns);
        console.log(`  - ${ns}: ${hasNs ? '✅' : '❌'}`);
        return hasNs;
      });

      if (allLoaded && i18n.isInitialized) {
        console.log('✅ All namespaces loaded, rendering app');
        setIsReady(true);
      } else {
        console.log('⏳ Waiting for namespaces to load...');
        // Check again in 100ms
        setTimeout(checkNamespaces, 100);
      }
    };

    // Start checking after a small delay to ensure i18n starts loading
    setTimeout(checkNamespaces, 50);
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando traduções...</p>
          <div className="space-y-2 w-64">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
