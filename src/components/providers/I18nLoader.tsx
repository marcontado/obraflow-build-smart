import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface I18nLoaderProps {
  children: ReactNode;
}

export function I18nLoader({ children }: I18nLoaderProps) {
  const { ready } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (ready) {
      // Small delay to ensure all namespaces are loaded
      setTimeout(() => setIsReady(true), 100);
    }
  }, [ready]);

  if (!isReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
