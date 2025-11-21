import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import i18n from '@/lib/i18n';
import { supabase } from "@/integrations/supabase/client";
import { ptBR, enUS, es } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { toast } from "sonner";

export type SupportedLocale = 'pt' | 'en' | 'es';

interface LocaleContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  dateLocale: Locale;
  currencySymbol: string;
  numberFormat: Intl.NumberFormat;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const localeMap = {
  pt: { date: ptBR, currency: 'R$', format: 'pt-BR' },
  en: { date: enUS, currency: '$', format: 'en-US' },
  es: { date: es, currency: '€', format: 'es-ES' }
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    // Initialize with i18n's current language if available
    const currentLang = i18n.language?.split('-')[0] as SupportedLocale;
    return ['pt', 'en', 'es'].includes(currentLang) ? currentLang : 'pt';
  });
  const [isLoading, setIsLoading] = useState(true);

  // Wait for i18n to be ready before loading user locale
  useEffect(() => {
    const waitForI18n = async () => {
      // Ensure i18n is fully initialized
      if (!i18n.isInitialized) {
        console.log('LocaleProvider: Waiting for i18n initialization...');
        await new Promise(resolve => setTimeout(resolve, 100));
        return waitForI18n();
      }
      return true;
    };

    waitForI18n().then(() => {
      console.log('LocaleProvider: i18n is ready, loading user locale');
      loadUserLocale();
    });
  }, []);

  // Load user locale preference from profile
  const loadUserLocale = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.language) {
          const userLocale = profile.language as SupportedLocale;
          console.log('LocaleProvider: Setting user locale to', userLocale);
          setLocaleState(userLocale);
          if (i18n.isInitialized) {
            await i18n.changeLanguage(userLocale);
            console.log('LocaleProvider: Changed i18n language to', userLocale);
          }
        } else {
          // Set default language if no preference
          console.log('LocaleProvider: No user preference, using default pt');
          setLocaleState('pt');
          if (i18n.isInitialized) {
            await i18n.changeLanguage('pt');
          }
        }
      } else {
        // No user logged in, use default
        console.log('LocaleProvider: No user, using default pt');
        setLocaleState('pt');
        if (i18n.isInitialized) {
          await i18n.changeLanguage('pt');
        }
      }
    } catch (error) {
      console.error('LocaleProvider: Error loading user locale:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync i18n when locale changes
  useEffect(() => {
    if (i18n.isInitialized && i18n.language !== locale) {
      console.log('LocaleProvider: Syncing i18n language from', i18n.language, 'to', locale);
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  const setLocale = async (newLocale: SupportedLocale) => {
    try {
      console.log('LocaleProvider: Setting locale to', newLocale);
      setLocaleState(newLocale);
      
      if (i18n.isInitialized) {
        await i18n.changeLanguage(newLocale);
        console.log('LocaleProvider: Changed i18n language to', newLocale);
      }
      
      // Save to user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ language: newLocale })
          .eq('id', user.id);
        
        if (error) throw error;
        
        toast.success(
          newLocale === 'pt' ? 'Idioma alterado com sucesso!' :
          newLocale === 'en' ? 'Language changed successfully!' :
          '¡Idioma cambiado con éxito!'
        );
      }
    } catch (error) {
      console.error('LocaleProvider: Error setting locale:', error);
      toast.error(
        locale === 'pt' ? 'Erro ao alterar idioma' :
        locale === 'en' ? 'Error changing language' :
        'Error al cambiar idioma'
      );
    }
  };

  const value: LocaleContextType = {
    locale,
    setLocale,
    dateLocale: localeMap[locale].date,
    currencySymbol: localeMap[locale].currency,
    numberFormat: new Intl.NumberFormat(localeMap[locale].format, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  };

  // Show loading state while initializing
  if (isLoading) {
    console.log('LocaleProvider: Still loading...');
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('LocaleProvider: Ready, rendering children with locale:', locale);

  return (
    <LocaleContext.Provider value={value} key={locale}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
