/**
 * Fuse.js Loading Helper
 * Dynamically loads Fuse.js library only when needed
 */

let fuseAPIPromise = null;

/**
 * Load the Fuse.js library
 * @returns {Promise} Promise that resolves when Fuse.js is ready
 */
const loadFuse = () => {
  // Return existing promise if already loading/loaded
  if (fuseAPIPromise) {
    return fuseAPIPromise;
  }

  // Check if Fuse is already loaded
  if (window.Fuse) {
    fuseAPIPromise = Promise.resolve(window.Fuse);
    return fuseAPIPromise;
  }

  fuseAPIPromise = new Promise((resolve, reject) => {
    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="fuse.min.js"]');
    
    if (existingScript) {
      // Script exists, wait for it to load
      if (window.Fuse) {
        resolve(window.Fuse);
        return;
      }
      
      existingScript.onload = () => resolve(window.Fuse);
      existingScript.onerror = () => reject(new Error('Failed to load Fuse.js'));
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';
    script.onload = () => {
      if (window.Fuse) {
        resolve(window.Fuse);
      } else {
        reject(new Error('Fuse.js loaded but not available'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Fuse.js from CDN'));
    
    // Insert script
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  });

  return fuseAPIPromise;
};

export default loadFuse;