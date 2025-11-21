import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface I18nLoaderProps {
  children: ReactNode;
}

// All namespaces the application depends on
const REQUIRED_NAMESPACES = [
  'common',
  'auth', 
  'navigation',
  'settings',
  'projects',
  'clients',
  'errors',
  'dashboard',
  'tasks',
  'partners'
] as const;

export function I18nLoader({ children }: I18nLoaderProps) {
  const { i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const MAX_RETRIES = 20; // 20 retries * 200ms = 4 seconds
  const RETRY_DELAY = 200;

  useEffect(() => {
    const verifyI18n = async () => {
      try {
        // Step 1: Wait for i18n to initialize
        if (!i18n.isInitialized) {
          console.log('⏳ I18nLoader: Waiting for i18n to initialize...');
          
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, RETRY_DELAY);
            return;
          } else {
            // LOOP PROTECTION: Allow render even if not fully ready
            console.warn('⚠️ I18nLoader: Max retries reached, rendering anyway');
            setIsReady(true);
            return;
          }
        }

        // Step 2: Check if all required namespaces are loaded
        const missingNamespaces: string[] = [];
        
        for (const ns of REQUIRED_NAMESPACES) {
          if (!i18n.hasLoadedNamespace(ns)) {
            missingNamespaces.push(ns);
          }
        }

        if (missingNamespaces.length > 0) {
          console.log('⏳ I18nLoader: Waiting for namespaces...', { 
            missing: missingNamespaces,
            retry: retryCount 
          });
          
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, RETRY_DELAY);
            return;
          } else {
            // LOOP PROTECTION: Allow render even if not fully ready
            console.warn('⚠️ I18nLoader: Missing namespaces but rendering anyway:', missingNamespaces);
            setIsReady(true);
            return;
          }
        }

        // Step 3: Test translations using i18n.t() - more reliable than store access
        const testKeys = [
          { key: 'security.changePassword.title', ns: 'settings' },
          { key: 'menu.support', ns: 'navigation' },
          { key: 'card.progress', ns: 'projects' }
        ];

        const failedKeys: string[] = [];
        for (const { key, ns } of testKeys) {
          const translated = i18n.t(key, { ns });
          // If t() returns the key itself, translation isn't loaded
          if (translated === key) {
            failedKeys.push(`${ns}.${key}`);
          }
        }

        if (failedKeys.length > 0) {
          console.log('⏳ I18nLoader: Waiting for translations...', { 
            failed: failedKeys,
            retry: retryCount 
          });
          
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, RETRY_DELAY);
            return;
          } else {
            // LOOP PROTECTION: Allow render even if not fully ready
            console.warn('⚠️ I18nLoader: Some translations not ready but rendering anyway:', failedKeys);
            setIsReady(true);
            return;
          }
        }

        // All checks passed!
        console.log('✅ I18nLoader: All translations verified and ready');
        setIsReady(true);
        
      } catch (error) {
        console.error('❌ I18nLoader: Error during verification:', error);
        // LOOP PROTECTION: Render anyway on error
        console.warn('⚠️ I18nLoader: Error occurred but rendering anyway');
        setIsReady(true);
      }
    };

    verifyI18n();
  }, [i18n, retryCount]);

  // Show loading state while verifying translations
  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 p-8">
        <div className="space-y-4 w-full max-w-md">
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          
          <div className="flex gap-2">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-1/3" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Carregando traduções...
          </div>
          {retryCount > 10 && (
            <div className="text-xs text-muted-foreground/70">
              Tentativa {retryCount} de {MAX_RETRIES}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
