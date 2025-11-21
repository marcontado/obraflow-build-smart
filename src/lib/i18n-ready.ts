import i18n from './i18n';

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

/**
 * Promise that resolves when i18n is fully ready with all namespaces loaded
 * and critical nested keys are accessible
 */
export const i18nReady = new Promise<void>((resolve) => {
  const checkReady = () => {
    if (!i18n.isInitialized) {
      console.log('⏳ i18nReady: Waiting for i18n to initialize...');
      setTimeout(checkReady, 50);
      return;
    }
    
    const currentLang = i18n.language?.split('-')[0] || 'pt';
    const hasCommon = i18n.hasLoadedNamespace('common');
    const hasSettings = i18n.hasLoadedNamespace('settings');
    
    if (!hasCommon || !hasSettings) {
      console.log('⏳ i18nReady: Waiting for critical namespaces...', { hasCommon, hasSettings });
      setTimeout(checkReady, 50);
      return;
    }
    
    // Deep verification: Check critical nested keys
    const settingsData = i18n.store?.data?.[currentLang]?.settings;
    const criticalKey = deepGet(settingsData, 'security.changePassword.title');
    
    if (!criticalKey || typeof criticalKey !== 'string') {
      console.log('⏳ i18nReady: Waiting for nested keys to be accessible...', { criticalKey });
      setTimeout(checkReady, 50);
      return;
    }
    
    console.log('✅ i18nReady: All critical namespaces and nested keys are loaded');
    resolve();
  };
  
  // Start checking immediately
  checkReady();
});

/**
 * Wait for i18n to be fully ready before proceeding
 */
export async function ensureI18nReady(): Promise<void> {
  await i18nReady;
  console.log('✅ ensureI18nReady: i18n is now ready with deep key access');
}
