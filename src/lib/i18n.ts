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

// Configure i18n with simplified initialization
const initI18n = async () => {
  console.log('🔄 Initializing i18n...');
  
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
      load: 'languageOnly',
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
      saveMissing: true,
      missingKeyHandler: (lngs, ns, key, fallbackValue) => {
        console.error(`❌ Missing translation key: [${lngs}] ${ns}:${key}`, { fallbackValue });
      },
      partialBundledLanguages: false,
    });

  console.log('✅ i18n initialized');
  console.log('Current language:', i18n.language);
  console.log('Available languages:', i18n.languages);
  console.log('Loaded namespaces:', Object.keys(i18n.store?.data?.[i18n.language] || {}));

  // Load all namespaces for all languages
  const namespaces = ['common', 'auth', 'navigation', 'settings', 'projects', 'clients', 'errors', 'dashboard', 'tasks', 'partners'];
  
  console.log('📦 Loading all namespaces...');
  await i18n.loadNamespaces(namespaces);
  
  // Wait for store synchronization
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('✅ All namespaces loaded, store synchronized');
  
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
