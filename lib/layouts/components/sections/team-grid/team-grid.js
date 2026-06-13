/**
 * Team Grid Dialog Handler
 *
 * Uses the native HTML <dialog> element for modal functionality.
 * Provides built-in accessibility features:
 * - Focus trapping within the dialog
 * - Backdrop click to close
 * - Escape key to close
 * - Returns focus to trigger element on close
 */

/**
 * Initialize dialog functionality for team grid
 */
function initTeamGrid() {
  const links = document.querySelectorAll('.text-link[data-dialog-target]');

  links.forEach((link) => {
    // Skip if already initialized
    if (link.dataset.initialized) {return;}
    link.dataset.initialized = 'true';

    const dialogId = link.getAttribute('data-dialog-target');
    const dialog = document.getElementById(dialogId);

    if (!dialog) {return;}

    // Open dialog on link click
    link.addEventListener('click', (event) => {
      event.preventDefault();
      dialog.showModal();
    });

    // Close dialog on close span click or keyboard
    const closeBtn = dialog.querySelector('.dialog-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        dialog.close();
      });
      closeBtn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          dialog.close();
        }
      });
    }

    // Close dialog on backdrop click
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  });
}

// Register with page transitions for SWUP support
if (window.PageTransitions) {
  window.PageTransitions.registerComponent('team-grid', initTeamGrid);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTeamGrid);
} else {
  initTeamGrid();
}
