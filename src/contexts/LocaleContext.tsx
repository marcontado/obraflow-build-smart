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
  const [locale, setLocaleState] = useState<SupportedLocale>('pt');
  const [isLoading, setIsLoading] = useState(true);

  // Load user locale preference from profile
  useEffect(() => {
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
            setLocaleState(userLocale);
            if (i18n.isInitialized) {
              await i18n.changeLanguage(userLocale);
            }
          } else {
            // Set default language if no preference
            setLocaleState('pt');
            await i18n.changeLanguage('pt');
          }
        }
      } catch (error) {
        console.error('Error loading user locale:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserLocale();
  }, []);

  // Sync i18n when locale changes
  useEffect(() => {
    if (i18n.isInitialized && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  const setLocale = async (newLocale: SupportedLocale) => {
    try {
      setLocaleState(newLocale);
      
      if (i18n.isInitialized) {
        await i18n.changeLanguage(newLocale);
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
      console.error('Error setting locale:', error);
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

  // Don't render children until locale is loaded
  if (isLoading) {
    return null;
  }

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
