import i18n from './i18n';

/**
 * Promise that resolves when i18n is fully ready with all namespaces loaded
 */
export const i18nReady = new Promise<void>((resolve) => {
  const checkReady = () => {
    if (i18n.isInitialized && i18n.hasLoadedNamespace('common') && i18n.hasLoadedNamespace('settings')) {
      console.log('✅ i18nReady: All critical namespaces are loaded');
      resolve();
    } else {
      console.log('⏳ i18nReady: Waiting for i18n to be ready...');
      setTimeout(checkReady, 50);
    }
  };
  
  // Start checking immediately
  checkReady();
});

/**
 * Wait for i18n to be fully ready before proceeding
 */
export async function ensureI18nReady(): Promise<void> {
  await i18nReady;
  console.log('✅ ensureI18nReady: i18n is now ready');
}
