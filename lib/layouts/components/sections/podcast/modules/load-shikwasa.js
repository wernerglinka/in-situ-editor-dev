/**
 * Shikwasa Library Loading Helper
 */

let shikwasaPromise = null;

/**
 * Load the Shikwasa library (CSS and JS)
 * @returns {Promise} Promise that resolves when library is ready
 */
const loadShikwasa = () => {
  // Return existing promise if already loading/loaded
  if (shikwasaPromise) {
    return shikwasaPromise;
  }

  // Check if library is already loaded
  if (window.Shikwasa || (window.Player && window.Player.name === 'Player')) {
    shikwasaPromise = Promise.resolve();
    return shikwasaPromise;
  }

  shikwasaPromise = new Promise((resolve, reject) => {
    // Load CSS first and wait for it
    const existingCSS = document.querySelector('link[href*="shikwasa"]');
    const cssPromise = existingCSS ? Promise.resolve() : new Promise((cssResolve) => {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.jsdelivr.net/npm/shikwasa@2.2.1/dist/style.css';
      cssLink.onload = () => cssResolve();
      cssLink.onerror = () => {
        console.warn('Failed to load Shikwasa CSS, continuing anyway...');
        cssResolve(); // Don't fail on CSS load error
      };
      document.head.appendChild(cssLink);
    });

    // Load JavaScript after CSS
    cssPromise.then(() => {
      const existingScript = document.querySelector('script[src*="shikwasa"]');
      
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/shikwasa@2.2.1/dist/shikwasa.min.js';
        script.onload = () => {
          // Wait a bit for the library to initialize
          setTimeout(() => {
            if (window.Shikwasa || window.Player) {
              resolve();
            } else {
              reject(new Error('Shikwasa library failed to initialize'));
            }
          }, 100);
        };
        script.onerror = () => {
          reject(new Error('Failed to load Shikwasa JavaScript'));
        };
        
        document.head.appendChild(script);
      } else {
        // Script exists, wait for it to load
        const checkReady = () => {
          if (window.Shikwasa || window.Player) {
            resolve();
          } else {
            setTimeout(checkReady, 50);
          }
        };
        checkReady();
      }
    });
  });

  return shikwasaPromise;
};

export default loadShikwasa;