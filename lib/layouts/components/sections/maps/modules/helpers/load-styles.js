/**
 * Dynamic Stylesheet Loader Utility
 */

/**
 * Check if a stylesheet is already loaded
 * @param {string} url - The URL of the stylesheet
 * @returns {boolean} - True if the stylesheet is loaded
 */
const isStylesheetLoaded = (url) => {
  return Array.from(document.styleSheets).some((styleSheet) => {
    if (styleSheet.href) {
      return styleSheet.href === url;
    }
    return false;
  });
};

/**
 * Load a stylesheet dynamically
 * @param {string} url - The URL of the stylesheet
 * @param {string} integrity - The integrity hash for the stylesheet (optional)
 * @param {string} crossOrigin - The crossOrigin attribute value (optional)
 */
export const loadStylesheet = (url, integrity = '', crossOrigin = '') => {
  if (!isStylesheetLoaded(url)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    if (integrity) {link.integrity = integrity;}
    if (crossOrigin) {link.crossOrigin = crossOrigin;}
    document.head.appendChild(link);
  }
};