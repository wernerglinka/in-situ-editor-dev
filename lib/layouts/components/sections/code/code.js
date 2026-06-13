/**
 * Code component JavaScript
 * Handles copy to clipboard functionality and dynamic Prism theme loading
 */

/**
 * Available Prism themes with their CDN URLs
 */
const PRISM_THEMES = {
  default: null, // Uses the default theme from rich-text.css
  tomorrow: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/themes/prism-tomorrow.min.css',
  okaidia: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/themes/prism-okaidia.min.css',
  twilight: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/themes/prism-twilight.min.css',
  prism: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/themes/prism.min.css',
  dark: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/themes/prism-dark.min.css',
  solarizedlight: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/themes/prism-solarizedlight.min.css',
  coy: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/themes/prism-coy.min.css'
};

/**
 * Loads a Prism theme dynamically and applies it with higher specificity
 * @param {string} theme - Theme name
 */
function loadPrismTheme(theme) {
  if (!theme || theme === 'default' || !PRISM_THEMES[theme]) {
    return; // Use default theme from rich-text.css
  }

  const themeId = `prism-theme-${theme}`;
  
  // Check if theme is already loaded
  if (document.getElementById(themeId)) {
    return;
  }

  // Fetch the CSS content and modify it to target specific theme classes
  fetch(PRISM_THEMES[theme])
    .then(response => response.text())
    .then(cssText => {
      // Target selectors specifically to this theme class for isolated styling
      const modifiedCss = cssText.replace(/([^{}@]+)({[^}]*})/g, (match, selector, rules) => {
        // Skip @media queries and other at-rules
        if (selector.trim().startsWith('@')) {
          return match;
        }
        
        // Split multiple selectors (separated by comma) and prefix each with theme class
        const prefixedSelectors = selector.split(',').map(sel => {
          const trimmed = sel.trim();
          // Don't modify selectors that already target our theme or are global
          if (trimmed.startsWith('html') || trimmed.startsWith('body') || trimmed.includes(`.theme-${theme}`)) {
            return trimmed;
          }
          // Use theme-specific class for better isolation
          return `.theme-${theme} ${trimmed}`;
        }).join(', ');
        
        return `${prefixedSelectors}${rules}`;
      });
      
      // Create a style element with the modified CSS
      const style = document.createElement('style');
      style.id = themeId;
      style.textContent = modifiedCss;
      document.head.appendChild(style);
    })
    .catch(() => {
      console.warn(`Failed to load Prism theme: ${theme}`);
    });
}

/**
 * Copies text to clipboard using the modern Clipboard API with fallback
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    return fallbackCopyToClipboard(text);
  } catch (error) {
    console.warn('Copy failed:', error);
    return fallbackCopyToClipboard(text);
  }
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 * @returns {boolean} Success status
 */
function fallbackCopyToClipboard(text) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    return result;
  } catch (error) {
    console.warn('Fallback copy failed:', error);
    return false;
  }
}

/**
 * Shows copy feedback on button
 * @param {HTMLElement} button - Copy button element
 */
function showCopyFeedback(button) {
  const originalClass = button.className;
  button.classList.add('copied');
  
  setTimeout(() => {
    button.className = originalClass;
  }, 2000);
}

/**
 * Initializes code blocks on the page
 */
function initCodeBlocks() {
  const codeBlocks = document.querySelectorAll('.code-block');

  codeBlocks.forEach(codeBlock => {
    // Skip if already initialized
    if (codeBlock.dataset.initialized) {return;}
    codeBlock.dataset.initialized = 'true';

    // Load theme if specified
    const theme = codeBlock.dataset.theme;
    if (theme) {
      loadPrismTheme(theme);
    }

    // Set up copy functionality
    const copyButton = codeBlock.querySelector('.copy-button');
    const codeElement = codeBlock.querySelector('code');

    if (copyButton && codeElement) {
      copyButton.addEventListener('click', async () => {
        const success = await copyToClipboard(codeElement.textContent);

        if (success) {
          showCopyFeedback(copyButton);
        } else {
          console.warn('Failed to copy code to clipboard');
        }
      });
    }
  });
}

// Register with page transitions for SWUP support
if (window.PageTransitions) {
  window.PageTransitions.registerComponent('code', initCodeBlocks);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCodeBlocks);
} else {
  initCodeBlocks();
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initCodeBlocks,
    copyToClipboard,
    loadPrismTheme,
    PRISM_THEMES
  };
}