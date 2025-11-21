import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import PT translations
import commonPT from '@/locales/pt/common.json';
import authPT from '@/locales/pt/auth.json';
import navigationPT from '@/locales/pt/navigation.json';
import settingsPT from '@/locales/pt/settings.json';
import projectsPT from '@/locales/pt/projects.json';
import clientsPT from '@/locales/pt/clients.json';
import errorsPT from '@/locales/pt/errors.json';
import dashboardPT from '@/locales/pt/dashboard.json';

// Import EN translations
import commonEN from '@/locales/en/common.json';
import authEN from '@/locales/en/auth.json';
import navigationEN from '@/locales/en/navigation.json';
import settingsEN from '@/locales/en/settings.json';
import projectsEN from '@/locales/en/projects.json';
import clientsEN from '@/locales/en/clients.json';
import errorsEN from '@/locales/en/errors.json';
import dashboardEN from '@/locales/en/dashboard.json';

// Import ES translations
import commonES from '@/locales/es/common.json';
import authES from '@/locales/es/auth.json';
import navigationES from '@/locales/es/navigation.json';
import settingsES from '@/locales/es/settings.json';
import projectsES from '@/locales/es/projects.json';
import clientsES from '@/locales/es/clients.json';
import errorsES from '@/locales/es/errors.json';
import dashboardES from '@/locales/es/dashboard.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: {
        common: commonPT,
        auth: authPT,
        navigation: navigationPT,
        settings: settingsPT,
        projects: projectsPT,
        clients: clientsPT,
        errors: errorsPT,
        dashboard: dashboardPT,
      },
      en: {
        common: commonEN,
        auth: authEN,
        navigation: navigationEN,
        settings: settingsEN,
        projects: projectsEN,
        clients: clientsEN,
        errors: errorsEN,
        dashboard: dashboardEN,
      },
      es: {
        common: commonES,
        auth: authES,
        navigation: navigationES,
        settings: settingsES,
        projects: projectsES,
        clients: clientsES,
        errors: errorsES,
        dashboard: dashboardES,
      },
    },
    fallbackLng: 'pt',
    defaultNS: 'common',
    ns: ['common', 'auth', 'navigation', 'settings', 'projects', 'clients', 'errors', 'dashboard'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
