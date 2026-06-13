/**
 * Dynamic Script Loader Utility
 */

/**
 * Load JavaScript library
 * @param {string} src - Script source URL
 * @param {string} globalCheck - Global variable to check if library is loaded
 * @param {string} integrity - Integrity hash (optional)
 * @param {string} crossOrigin - CrossOrigin value (optional)
 * @returns {Promise} - Resolves when script is loaded
 */
export const loadScript = (src, globalCheck, integrity = '', crossOrigin = '') => {
  return new Promise((resolve, reject) => {
    if (window[globalCheck]) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    if (integrity) {script.integrity = integrity;}
    if (crossOrigin) {script.crossOrigin = crossOrigin;}

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));

    document.head.appendChild(script);
  });
};