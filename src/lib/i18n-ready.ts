import i18n from './i18n';

/**
 * Promise that resolves when i18n is fully ready with all namespaces loaded
 * Uses i18n.t() to verify translations are working instead of direct store access
 */
export const i18nReady = new Promise<void>((resolve, reject) => {
  const startTime = Date.now();
  const MAX_WAIT_TIME = 10000; // 10 seconds maximum
  
  const checkReady = () => {
    const elapsed = Date.now() - startTime;
    
    // Timeout protection
    if (elapsed > MAX_WAIT_TIME) {
      console.error('❌ i18nReady: Timeout after 10 seconds');
      reject(new Error('i18n initialization timeout'));
      return;
    }
    
    if (!i18n.isInitialized) {
      console.log('⏳ i18nReady: Waiting for i18n to initialize...');
      setTimeout(checkReady, 100);
      return;
    }
    
    const hasCommon = i18n.hasLoadedNamespace('common');
    const hasSettings = i18n.hasLoadedNamespace('settings');
    
    if (!hasCommon || !hasSettings) {
      console.log('⏳ i18nReady: Waiting for critical namespaces...', { hasCommon, hasSettings });
      setTimeout(checkReady, 100);
      return;
    }
    
    // Test translations using i18n.t() - more reliable than store access
    const testTranslation = i18n.t('security.changePassword.title', { ns: 'settings' });
    
    // If it returns the key itself, translations aren't loaded yet
    if (testTranslation === 'security.changePassword.title') {
      console.log('⏳ i18nReady: Waiting for translations to be ready...');
      setTimeout(checkReady, 100);
      return;
    }
    
    console.log('✅ i18nReady: All translations loaded and working');
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
