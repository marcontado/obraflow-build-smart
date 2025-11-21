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
import tasksPT from '@/locales/pt/tasks.json';
import partnersPT from '@/locales/pt/partners.json';

// Import EN translations
import commonEN from '@/locales/en/common.json';
import authEN from '@/locales/en/auth.json';
import navigationEN from '@/locales/en/navigation.json';
import settingsEN from '@/locales/en/settings.json';
import projectsEN from '@/locales/en/projects.json';
import clientsEN from '@/locales/en/clients.json';
import errorsEN from '@/locales/en/errors.json';
import dashboardEN from '@/locales/en/dashboard.json';
import tasksEN from '@/locales/en/tasks.json';
import partnersEN from '@/locales/en/partners.json';

// Import ES translations
import commonES from '@/locales/es/common.json';
import authES from '@/locales/es/auth.json';
import navigationES from '@/locales/es/navigation.json';
import settingsES from '@/locales/es/settings.json';
import projectsES from '@/locales/es/projects.json';
import clientsES from '@/locales/es/clients.json';
import errorsES from '@/locales/es/errors.json';
import dashboardES from '@/locales/es/dashboard.json';
import tasksES from '@/locales/es/tasks.json';
import partnersES from '@/locales/es/partners.json';

// Configure i18n with proper error handling
const initI18n = async () => {
  await i18n
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
        tasks: tasksPT,
        partners: partnersPT,
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
        tasks: tasksEN,
        partners: partnersEN,
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
        tasks: tasksES,
        partners: partnersES,
      },
    },
      fallbackLng: 'pt',
      defaultNS: 'common',
      ns: ['common', 'auth', 'navigation', 'settings', 'projects', 'clients', 'errors', 'dashboard', 'tasks', 'partners'],
      preload: ['pt', 'en', 'es'],
      load: 'languageOnly', // Load only 'pt', not 'pt-BR'
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      react: {
        useSuspense: false,
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed',
        transEmptyNodeValue: '',
        transSupportBasicHtmlNodes: true,
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
      },
      // Debug missing keys
      saveMissing: true,
      missingKeyHandler: (lngs, ns, key, fallbackValue) => {
        console.warn(`🔴 Missing translation key: [${ns}] ${key} for languages:`, lngs);
      },
      // Ensure all namespaces are loaded
      partialBundledLanguages: false,
    });

  // Ensure all namespaces are loaded for all languages
  await Promise.all([
    i18n.loadNamespaces(['common', 'auth', 'navigation', 'settings', 'projects', 'clients', 'errors', 'dashboard', 'tasks', 'partners']),
  ]);

  console.log('✅ i18n fully initialized with all namespaces');
  console.log('Available namespaces:', i18n.options.ns);
  console.log('Current language:', i18n.language);
  console.log('Loaded resources:', Object.keys(i18n.store.data));
  
  return i18n;
};

// Initialize i18n immediately
initI18n().catch((error) => {
  console.error('❌ Failed to initialize i18n:', error);
});

// Listen to language change events
i18n.on('languageChanged', (lng) => {
  console.log('🔄 Language changed to:', lng);
  // Reload all namespaces for the new language
  i18n.loadNamespaces(['common', 'auth', 'navigation', 'settings', 'projects', 'clients', 'errors', 'dashboard', 'tasks', 'partners']);
});

export default i18n;
