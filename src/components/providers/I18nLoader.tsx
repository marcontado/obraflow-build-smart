import { ReactNode, useEffect, useState } from 'react';
import i18n from '@/lib/i18n';
import { ensureI18nReady } from '@/lib/i18n-ready';
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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 50; // 5 seconds max

  useEffect(() => {
    const init = async () => {
      console.log('🔍 I18nLoader: Starting initialization check');
      
      // First, wait for i18n to be ready
      await ensureI18nReady();
      
      const checkNamespaces = async () => {
        console.log('🔍 Checking i18n namespaces... (attempt', retryCount + 1, ')');
        console.log('Current language:', i18n.language);
        console.log('Is initialized:', i18n.isInitialized);
        
        // Verify actual translation data exists
        const currentLang = i18n.language?.split('-')[0] || 'pt';
        const translationsExist = i18n.store?.data?.[currentLang];
        
        console.log('Translations exist for', currentLang, ':', !!translationsExist);
        console.log('Available languages:', Object.keys(i18n.store?.data || {}));
        
        if (translationsExist) {
          console.log('Available namespaces for', currentLang, ':', Object.keys(translationsExist));
        }
        
        const allLoaded = REQUIRED_NAMESPACES.every(ns => {
          const hasNs = i18n.hasLoadedNamespace(ns);
          // Also check if actual translation data exists
          const hasData = translationsExist && translationsExist[ns];
          const isFullyLoaded = hasNs && hasData;
          console.log(`  - ${ns}: hasLoadedNamespace=${hasNs}, hasData=${!!hasData}, fullyLoaded=${isFullyLoaded}`);
          return isFullyLoaded;
        });

        if (allLoaded && i18n.isInitialized) {
          console.log('✅ All namespaces fully loaded with data, rendering app');
          console.log('Sample translation tests:');
          console.log('  - settings/security.title:', i18n.t('security.title', { ns: 'settings' }));
          console.log('  - settings/security.changePassword.title:', i18n.t('security.changePassword.title', { ns: 'settings' }));
          console.log('  - navigation/menu.support:', i18n.t('menu.support', { ns: 'navigation' }));
          setIsReady(true);
        } else if (retryCount < MAX_RETRIES) {
          console.log('⏳ Waiting for namespaces to load... will retry');
          setRetryCount(prev => prev + 1);
          // Check again in 100ms
          setTimeout(checkNamespaces, 100);
        } else {
          console.error('❌ Failed to load i18n after', MAX_RETRIES, 'attempts');
          console.error('This should not happen. Forcing render anyway.');
          // Force render anyway to prevent infinite loading
          setIsReady(true);
        }
      };

      await checkNamespaces();
    };

    init();
  }, [retryCount]);

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
