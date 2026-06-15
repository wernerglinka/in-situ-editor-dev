/**
 * Banner Component - Simple accordion functionality
 *
 * A banner whose `classes` include `banner-accordion-header` toggles its
 * immediately-following `.banner-accordion-content` sibling open and closed.
 * The `banner-` prefix keeps these clear of the standalone accordion section.
 * Follows the repo convention: an idempotent per-element init, registered with
 * PageTransitions so it re-runs after client-side navigations, and also run on
 * first load.
 */

/**
 * Screen Reader Announcement Utility
 * @param {string} message - The message to announce.
 */
const announceToScreenReader = (message) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';

  document.body.appendChild(announcement);
  announcement.textContent = message;

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Wire one banner accordion header to its content sibling.
 * @param {HTMLElement} header - The `.banner-accordion-header` element.
 * @param {number} index - Position, used to mint unique ARIA ids.
 */
const initBannerAccordion = (header, index) => {
  // Skip if already initialized
  if (header.dataset.initialized) {return;}

  const content = header.nextElementSibling;
  if (!content?.classList.contains('banner-accordion-content')) {
    console.warn('Banner accordion missing .banner-accordion-content sibling');
    return;
  }
  header.dataset.initialized = 'true';

  // Generate unique IDs
  const headerId = `banner-accordion-header-${index}`;
  const contentId = `banner-accordion-content-${index}`;

  // Set up ARIA attributes
  header.setAttribute('role', 'button');
  header.setAttribute('tabindex', '0');
  header.setAttribute('id', headerId);
  header.setAttribute('aria-controls', contentId);

  content.setAttribute('id', contentId);
  content.setAttribute('role', 'region');
  content.setAttribute('aria-labelledby', headerId);

  // Get header title for announcements
  const headerTitle = header.querySelector('h1, h2, h3, h4, h5, h6')?.textContent || 'Accordion section';

  // Click handler
  header.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = header.classList.contains('is-open');

    header.classList.toggle('is-open');
    content.classList.toggle('is-closed');

    // Update ARIA state
    header.setAttribute('aria-expanded', String(!isOpen));

    // Announce to screen readers
    const action = !isOpen ? 'expanded' : 'collapsed';
    announceToScreenReader(`${headerTitle} ${action}`);
  });

  // Keyboard support
  header.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      header.click();
    }
  });

  // Set initial state from the authored classes
  if (!header.classList.contains('is-open')) {
    content.classList.add('is-closed');
    header.setAttribute('aria-expanded', 'false');
  } else {
    content.classList.remove('is-closed');
    header.setAttribute('aria-expanded', 'true');
  }
};

/**
 * Initialize all banner accordions on the page.
 */
function initBannerAccordions() {
  document.querySelectorAll('.banner-accordion-header').forEach(initBannerAccordion);
}

// Register with page transitions for SWUP support
if (window.PageTransitions) {
  window.PageTransitions.registerComponent('banner', initBannerAccordions);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBannerAccordions);
} else {
  initBannerAccordions();
}
