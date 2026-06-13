/**
 * Accordion Component
 * Handles the expand/collapse functionality for FAQ items with smooth simultaneous animations
 */

const initAccordion = () => {
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

  // Find all accordion containers on the page
  const accordions = document.querySelectorAll( '.js-accordion' );

  // Process each accordion independently
  accordions.forEach( accordion => {
    // Skip if already initialized
    if ( accordion.dataset.initialized ) {return;}
    accordion.dataset.initialized = 'true';

    // Check configuration options via data attributes (presence = true, absence = false)
    const allowMultiple = 'allowMultiple' in accordion.dataset;

    // Expand specific panel by index (0-based) - null means no panel expands by default
    const expandIndex = accordion.dataset.expandIndex ? parseInt(accordion.dataset.expandIndex, 10) : null;

    // Get all interactive elements within this accordion
    const headers = accordion.querySelectorAll( '.js-accordion-header' );
    const panels = accordion.querySelectorAll( '.js-accordion-panel' );
    const toggleAllBtn = accordion.querySelector( '.js-accordion-toggle-all' );

    // Animation settings
    const duration = 400; // Duration in milliseconds
    let isAnimating = false; // Flag to prevent animation interruption

    /**
     * Cubic easing function for smooth animations
     * @param {number} t - Progress from 0 to 1
     * @returns {number} Eased value
     */
    function easeInOutCubic( t ) {
      // Smooth acceleration and deceleration curve
      // First half: accelerate from zero velocity
      // Second half: decelerate to zero velocity
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow( -2 * t + 2, 3 ) / 2;
    }

    /**
     * Gets the natural height of a content element
     * @param {HTMLElement} panel - The panel element
     * @returns {number} Natural height in pixels
     */
    function getContentHeight( panel ) {
      // Store original styles
      const originalHeight = panel.style.height;
      const originalOverflow = panel.style.overflow;

      // Temporarily set styles to measure natural height
      panel.style.height = 'auto';
      panel.style.overflow = 'visible';

      // Get the height while maintaining layout context
      const height = panel.scrollHeight;

      // Restore original styles
      panel.style.height = originalHeight;
      panel.style.overflow = originalOverflow;

      return height;
    }

    /**
     * Animates height changes for multiple elements simultaneously
     * @param {Array} animations - Array of animation configurations
     * @param {Function} onComplete - Callback function when animation completes
     */
    function animateHeights( animations, onComplete ) {
      // Prevent new animations while one is in progress
      if ( isAnimating ) { return; }

      isAnimating = true;
      const startTime = performance.now();

      function animate( currentTime ) {
        // Calculate animation progress (0 to 1)
        const elapsed = currentTime - startTime;
        const progress = Math.min( elapsed / duration, 1 );
        const easedProgress = easeInOutCubic( progress );

        // Update height for all panels in this animation batch simultaneously
        animations.forEach( ( { element, startHeight, endHeight } ) => {
          const currentHeight = startHeight + ( endHeight - startHeight ) * easedProgress;
          element.style.height = `${ currentHeight }px`;
        } );

        // Continue animation or complete
        if ( progress < 1 ) {
          requestAnimationFrame( animate );
        } else {
          isAnimating = false;
          if ( onComplete ) { onComplete(); }
        }
      }

      // Start the animation loop
      requestAnimationFrame( animate );
    }

    // Function for updating toggle button text (defined early for use in click handlers)
    let updateToggleButtonText = null;
    if ( toggleAllBtn && allowMultiple ) {
      updateToggleButtonText = function() {
        const allOpen = Array.from( headers ).every( header =>
          header.getAttribute( 'aria-expanded' ) === 'true'
        );
        const textElement = toggleAllBtn.querySelector( '.toggle-text' );
        textElement.textContent = allOpen ? 'Close All' : 'Open All';
      };
    }

    // Initialize panels with proper heights on page load
    panels.forEach( ( panel, index ) => {
      // Determine which panel should be expanded on load
      const shouldExpand = expandIndex !== null && index === expandIndex && expandIndex < panels.length;

      if ( shouldExpand ) {
        // Expand the specified panel
        const height = getContentHeight( panel );
        panel.style.height = `${ height }px`;
        headers[ index ].setAttribute( 'aria-expanded', 'true' );
      } else {
        // All other panels start closed
        panel.style.height = '0px';
        panel.classList.add( 'is-closed' );
        headers[ index ].setAttribute( 'aria-expanded', 'false' );
      }
    } );

    // Add click handlers to each accordion header
    headers.forEach( ( header, index ) => {
      header.addEventListener( 'click', () => {
        // Prevent clicks during animation
        if ( isAnimating ) { return; }

        // Get the corresponding panel and current state
        const panel = panels[ index ];
        const isExpanded = header.getAttribute( 'aria-expanded' ) === 'true';
        const animations = []; // Collect all panels to animate

        if ( isExpanded ) {
          // User clicked an open panel - close it
          animations.push( {
            element: panel,
            startHeight: panel.offsetHeight, // Current height
            endHeight: 0 // Collapse to zero
          } );

          // After animation completes, update ARIA states
          animateHeights( animations, () => {
            header.setAttribute( 'aria-expanded', 'false' );
            panel.classList.add( 'is-closed' );

            // Announce panel closure to screen readers
            const panelTitle = header.querySelector('.title')?.textContent || 'Panel';
            announceToScreenReader(`${panelTitle} collapsed`);

            // Update toggle button text if it exists
            if ( toggleAllBtn && allowMultiple ) {
              updateToggleButtonText();
            }
          } );
        } else {
          // User clicked a closed panel - open it
          const targetHeight = getContentHeight( panel );

          // If accordion doesn't allow multiple open panels
          if ( !allowMultiple ) {
            // Find all other open panels and add them to close animation
            headers.forEach( ( otherHeader, otherIndex ) => {
              if ( otherIndex !== index ) {
                const otherPanel = panels[ otherIndex ];
                const otherIsExpanded = otherHeader.getAttribute( 'aria-expanded' ) === 'true';

                if ( otherIsExpanded ) {
                  // Add this open panel to the closing animations
                  animations.push( {
                    element: otherPanel,
                    startHeight: otherPanel.offsetHeight,
                    endHeight: 0
                  } );
                }
              }
            } );
          }

          // Add the opening animation for clicked panel
          animations.push( {
            element: panel,
            startHeight: panel.offsetHeight, // Start from current height (0 if closed)
            endHeight: targetHeight // Expand to full content height
          } );

          // Run all animations simultaneously
          animateHeights( animations, () => {
            // After animation completes, update all ARIA states
            if ( !allowMultiple ) {
              // Close all other panels' states
              headers.forEach( ( otherHeader, otherIndex ) => {
                if ( otherIndex !== index ) {
                  otherHeader.setAttribute( 'aria-expanded', 'false' );
                  panels[ otherIndex ].classList.add( 'is-closed' );
                }
              } );
            }

            // Open current panel's state
            header.setAttribute( 'aria-expanded', 'true' );
            panel.classList.remove( 'is-closed' );

            // Announce panel opening to screen readers
            const panelTitle = header.querySelector('.title')?.textContent || 'Panel';
            announceToScreenReader(`${panelTitle} expanded`);

            // Update toggle button text if it exists
            if ( toggleAllBtn && allowMultiple ) {
              updateToggleButtonText();
            }
          } );
        }
      } );
    } );

    // Add keyboard navigation for accordion headers
    headers.forEach( ( header, index ) => {
      header.addEventListener( 'keydown', ( e ) => {
        if ( e.key === 'Enter' || e.key === ' ' ) {
          e.preventDefault();
          header.click(); // Trigger the click handler
        } else if ( e.key === 'ArrowDown' ) {
          e.preventDefault();
          const nextIndex = ( index + 1 ) % headers.length;
          headers[ nextIndex ].focus();
        } else if ( e.key === 'ArrowUp' ) {
          e.preventDefault();
          const prevIndex = ( index - 1 + headers.length ) % headers.length;
          headers[ prevIndex ].focus();
        } else if ( e.key === 'Home' ) {
          e.preventDefault();
          headers[ 0 ].focus();
        } else if ( e.key === 'End' ) {
          e.preventDefault();
          headers[ headers.length - 1 ].focus();
        }
      } );
    } );

    // Add toggle all functionality if button exists (only in multi-mode)
    if ( toggleAllBtn && allowMultiple ) {
      // Initial button text
      updateToggleButtonText();

      // Toggle all link click handler
      toggleAllBtn.addEventListener( 'click', ( e ) => {
        // Prevent default link behavior
        e.preventDefault();

        // Prevent clicks during animation
        if ( isAnimating ) { return; }

        const animations = [];
        const allOpen = Array.from( headers ).every( header =>
          header.getAttribute( 'aria-expanded' ) === 'true'
        );

        // Prepare animations for all panels
        panels.forEach( ( panel ) => {
          if ( allOpen ) {
            // Close all panels
            animations.push( {
              element: panel,
              startHeight: panel.offsetHeight,
              endHeight: 0
            } );
          } else {
            // Open all panels
            const targetHeight = getContentHeight( panel );
            animations.push( {
              element: panel,
              startHeight: panel.offsetHeight,
              endHeight: targetHeight
            } );
          }
        } );

        // Run all animations simultaneously
        animateHeights( animations, () => {
          // Update all ARIA states after animation
          headers.forEach( ( header, index ) => {
            if ( allOpen ) {
              // Closing all
              header.setAttribute( 'aria-expanded', 'false' );
              panels[ index ].classList.add( 'is-closed' );
            } else {
              // Opening all
              header.setAttribute( 'aria-expanded', 'true' );
              panels[ index ].classList.remove( 'is-closed' );
            }
          } );

          // Update button text
          updateToggleButtonText();
        } );
      } );
    }
  } );
};

// Register with page transitions for SWUP support
if ( window.PageTransitions ) {
  window.PageTransitions.registerComponent( 'accordion', initAccordion );
}

// Initialize accordions when DOM is ready
if ( document.readyState === 'loading' ) {
  document.addEventListener( 'DOMContentLoaded', initAccordion );
} else {
  initAccordion();
}