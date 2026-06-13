/**
 * Multi-Tab Component
 *
 * Handles tab switching with proper ARIA attributes, keyboard navigation,
 * and URL hash-based history so browser back/forward works correctly.
 *
 * Tab selection is reflected in the URL as #tab-{key}. Clicking a tab or
 * navigating with arrow keys pushes a history entry; the popstate handler
 * restores the correct tab when the user navigates back or forward.
 *
 * @module multi-tab
 */

const TAB_HASH_PREFIX = 'tab-';

/**
 * Returns the tab key encoded in the current URL hash, or null if the hash
 * is absent or does not match any tab button in the given container.
 *
 * @param {HTMLElement} container - The .tabs-component element
 * @returns {string|null}
 */
function tabKeyFromHash(container) {
  const hash = window.location.hash.slice(1); // strip leading #
  if (!hash.startsWith(TAB_HASH_PREFIX)) { return null; }
  const key = hash.slice(TAB_HASH_PREFIX.length);
  return container.querySelector(`#tab-${key}`) ? key : null;
}

/**
 * Activates a tab and shows its panel.
 *
 * @param {HTMLElement} container - The .tabs-component element
 * @param {HTMLElement} tab - The tab button to activate
 * @param {boolean} [focus=true] - Whether to move focus to the tab button
 */
function activateTab(container, tab, focus = true) {
  const tabs = container.querySelectorAll('.tabs-button');
  const panelId = tab.getAttribute('aria-controls');
  const panel = container.querySelector(`#${panelId}`);

  // Deactivate all tabs
  tabs.forEach((t) => {
    t.setAttribute('aria-selected', 'false');
    t.setAttribute('tabindex', '-1');
  });

  // Hide all panels
  container.querySelectorAll('.tabs-panel').forEach((p) => {
    p.setAttribute('hidden', '');
  });

  // Activate selected tab
  tab.setAttribute('aria-selected', 'true');
  tab.setAttribute('tabindex', '0');
  if (focus) { tab.focus(); }

  // Show selected panel
  panel.removeAttribute('hidden');

  // Notify components inside this panel that they are now visible.
  // Each component that needs reinitialization listens for this event.
  panel.dispatchEvent(new CustomEvent('tab:revealed', { bubbles: true }));
}

/**
 * Handles browser back/forward navigation by reading the URL hash and
 * activating the matching tab. Does not move keyboard focus.
 */
function handlePopState() {
  document.querySelectorAll('.tabs-component[data-initialized]').forEach((container) => {
    const hashKey = tabKeyFromHash(container);
    const key = hashKey || container.dataset.defaultTab;
    const tab = container.querySelector(`#tab-${key}`) || container.querySelector('.tabs-button');
    if (tab) { activateTab(container, tab, false); }
  });
}

/**
 * Initializes all multi-tab components on the page.
 */
function initMultiTabs() {
  const tabContainers = document.querySelectorAll('.tabs-component');

  tabContainers.forEach((container) => {
    if (container.dataset.initialized) { return; }
    container.dataset.initialized = 'true';

    const tabs = container.querySelectorAll('.tabs-button');

    // URL hash takes priority over data-default-tab
    const hashKey = tabKeyFromHash(container);
    const initialKey = hashKey || container.dataset.defaultTab;
    const initialTab = container.querySelector(`#tab-${initialKey}`) || tabs[0];

    // Activate initial tab without stealing keyboard focus.
    // Do not touch the URL — if there was no hash on arrival the URL stays clean.
    activateTab(container, initialTab, false);

    // Click handler: activate tab and push a history entry
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.id.replace(/^tab-/, '');
        activateTab(container, tab);
        history.pushState(null, '', `#${TAB_HASH_PREFIX}${key}`);
      });
    });

    // Keyboard navigation (arrow keys between tabs)
    container.querySelector('.tabs-nav').addEventListener('keydown', (event) => {
      const tabArray = Array.from(tabs);
      const currentIndex = tabArray.indexOf(document.activeElement);

      let newIndex;
      if (event.key === 'ArrowRight') {
        newIndex = (currentIndex + 1) % tabArray.length;
      } else if (event.key === 'ArrowLeft') {
        newIndex = (currentIndex - 1 + tabArray.length) % tabArray.length;
      } else if (event.key === 'Home') {
        newIndex = 0;
      } else if (event.key === 'End') {
        newIndex = tabArray.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const newTab = tabArray[newIndex];
      activateTab(container, newTab);
      history.pushState(null, '', `#${TAB_HASH_PREFIX}${newTab.id.replace(/^tab-/, '')}`);
    });
  });
}

/**
 * Cleanup multi-tab components.
 */
function cleanupMultiTabs() {
  document.querySelectorAll('.tabs-component[data-initialized]').forEach((container) => {
    delete container.dataset.initialized;
  });
}

// popstate listener is registered once at module level so it survives
// SWUP page transitions (which call cleanup/init but not re-register popstate).
window.addEventListener('popstate', handlePopState);

// Register with page transitions for SWUP support
if (window.PageTransitions) {
  window.PageTransitions.registerComponent('multi-tab', initMultiTabs);
  window.PageTransitions.registerCleanup('multi-tab', cleanupMultiTabs);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMultiTabs);
} else {
  initMultiTabs();
}
