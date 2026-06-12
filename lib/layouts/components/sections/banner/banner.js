/**
 * Banner Component - Simple accordion functionality
 * Uses banner- prefixed classes to avoid conflicts with simple-accordion
 */

document.addEventListener('DOMContentLoaded', () => {
  /**
   * Screen Reader Announcement Utility
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

  // Select banner-specific accordion headers
  document.querySelectorAll('.banner-accordion-header').forEach((header, index) => {
    const content = header.nextElementSibling;

    if (!content?.classList.contains('banner-accordion-content')) {
      console.warn('Banner accordion missing .banner-accordion-content sibling');
      return;
    }

    // Generate unique IDs
    const headerId = `banner-accordion-header-${index}`;
    const contentId = `banner-accordion-content-${index}`;

    // Set up ARIA attributes
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('id', headerId);
    header.setAttribute('aria-expanded', 'false');
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
      header.setAttribute('aria-expanded', !isOpen);

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

    // Set initial state
    if (!header.classList.contains('is-open')) {
      content.classList.add('is-closed');
      header.setAttribute('aria-expanded', 'false');
    } else {
      header.setAttribute('aria-expanded', 'true');
    }
  });
});