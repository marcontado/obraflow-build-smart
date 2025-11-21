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

// Critical nested keys that MUST exist for the app to work properly
const CRITICAL_NESTED_KEYS = [
  { ns: 'settings', keys: ['security.title', 'security.changePassword.title', 'security.changePassword.button', 'security.changePassword.new'] },
  { ns: 'navigation', keys: ['menu.support', 'menu.financial', 'roles.owner', 'roles.admin'] },
  { ns: 'projects', keys: ['card.progress', 'card.until', 'card.budgetUsed'] },
];

/**
 * Helper function to safely access nested keys
 */
function deepGet(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return current;
}

export function I18nLoader({ children }: I18nLoaderProps) {
  const [isReady, setIsReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const MAX_RETRIES = 25; // 5 seconds max (25 * 200ms)

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
        
        // Step 1: Check if all namespaces are loaded (shallow check)
        const allNamespacesLoaded = REQUIRED_NAMESPACES.every(ns => {
          const hasNs = i18n.hasLoadedNamespace(ns);
          const hasData = translationsExist && translationsExist[ns];
          const isFullyLoaded = hasNs && hasData;
          console.log(`  - ${ns}: hasLoadedNamespace=${hasNs}, hasData=${!!hasData}, fullyLoaded=${isFullyLoaded}`);
          return isFullyLoaded;
        });

        if (!allNamespacesLoaded) {
          if (retryCount < MAX_RETRIES) {
            console.log('⏳ Waiting for namespaces to load... will retry');
            setRetryCount(prev => prev + 1);
            setTimeout(checkNamespaces, 200);
          } else {
            const errorMsg = `Failed to load all namespaces after ${MAX_RETRIES} attempts`;
            console.error('❌', errorMsg);
            setError(errorMsg);
          }
          return;
        }

        // Step 2: Deep verification - check critical nested keys
        console.log('🔍 All namespaces loaded. Verifying critical nested keys...');
        let allKeysValid = true;
        
        for (const test of CRITICAL_NESTED_KEYS) {
          const nsData = i18n.store?.data?.[currentLang]?.[test.ns];
          console.log(`  📦 Checking namespace: ${test.ns}`);
          
          if (!nsData) {
            console.error(`    ❌ Namespace ${test.ns} data not found in store`);
            allKeysValid = false;
            continue;
          }
          
          for (const key of test.keys) {
            const value = deepGet(nsData, key);
            const tValue = i18n.t(key, { ns: test.ns });
            const isValid = value && typeof value === 'string' && tValue !== key;
            
            if (isValid) {
              console.log(`    ✅ ${test.ns}.${key} = "${value}"`);
            } else {
              console.error(`    ❌ ${test.ns}.${key} MISSING or INVALID`, { 
                storeValue: value, 
                tValue, 
                fullNsData: nsData 
              });
              allKeysValid = false;
            }
          }
        }

        if (allKeysValid && i18n.isInitialized) {
          console.log('✅ All critical nested keys verified successfully!');
          console.log('Sample translation tests:');
          console.log('  - settings/security.title:', i18n.t('security.title', { ns: 'settings' }));
          console.log('  - settings/security.changePassword.title:', i18n.t('security.changePassword.title', { ns: 'settings' }));
          console.log('  - navigation/menu.support:', i18n.t('menu.support', { ns: 'navigation' }));
          console.log('  - projects/card.progress:', i18n.t('card.progress', { ns: 'projects' }));
          setIsReady(true);
        } else if (retryCount < MAX_RETRIES) {
          console.log('⏳ Nested keys not fully accessible yet, retrying...');
          setRetryCount(prev => prev + 1);
          setTimeout(checkNamespaces, 200);
        } else {
          const errorMsg = 'Critical nested translation keys are missing or invalid';
          console.error('❌', errorMsg);
          console.error('Store data:', JSON.stringify(i18n.store?.data?.[currentLang], null, 2));
          setError(errorMsg);
        }
      };

      await checkNamespaces();
    };

    init();
  }, [retryCount]);

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md p-8">
          <div className="text-destructive text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground">Translation System Error</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-4">
            Please check the console for detailed error information.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando traduções...</p>
          <p className="text-xs text-muted-foreground">Tentativa {retryCount} de {MAX_RETRIES}</p>
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
