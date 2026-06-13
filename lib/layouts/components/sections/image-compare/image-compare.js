/**
 * Image Compare Component
 * Manages before/after image comparison with draggable handle
 */

const initImageCompare = () => {
  /**
   * Creates a new image compare instance
   * @param {HTMLElement} element - The comparison container element
   * @param {Object} options - Configuration options
   * @returns {Object} The image compare instance
   */
  function createImageCompare(element, options = {}) {
    const defaultOptions = {
      startPosition: 50,
      labelBeforeText: 'Before',
      labelAfterText: 'After'
    };

    const settings = { ...defaultOptions, ...options };

    const compare = {
      element,
      handle: element.querySelector('.comparison-handle'),
      afterImage: element.querySelector('.after-image'),
      labelBefore: element.querySelector('.image-status.before'),
      labelAfter: element.querySelector('.image-status.after'),
      isDragging: false,
      isResizing: false
    };

    if (!compare.handle || !compare.afterImage) {
      console.warn('Image compare missing required elements');
      return null;
    }

    let intersectionObserver;
    let resizeObserver;

    /**
     * Updates label visibility based on handle position
     */
    const updateLabel = (label, afterImage, position) => {
      if (!label || !afterImage) {return;}

      if (position === 'left') {
        if (label.offsetLeft + label.offsetWidth < afterImage.offsetLeft + afterImage.offsetWidth) {
          label.classList.remove('is-hidden');
        } else {
          label.classList.add('is-hidden');
        }
      } else if (label.offsetLeft > afterImage.offsetLeft + afterImage.offsetWidth) {
        label.classList.remove('is-hidden');
      } else {
        label.classList.add('is-hidden');
      }
    };

    /**
     * Checks and updates label visibility
     */
    const checkLabels = () => {
      const modifiedLabel = element.querySelector('.image-status[data-type="modified"]');
      const originalLabel = element.querySelector('.image-status[data-type="original"]');

      updateLabel(modifiedLabel, compare.afterImage, 'left');
      updateLabel(originalLabel, compare.afterImage, 'right');

      compare.isResizing = false;
    };

    /**
     * Animates the dragged handle and updates image width
     */
    const animateDraggedHandle = (e, dragHandleWidth, cursorToDragHandleCenterOffset, minDragHandlePosition, maxDragHandlePosition, containerOffset) => {
      const cursorPositionX = e.pageX;
      const dragHandlePosition = cursorPositionX - containerOffset - (dragHandleWidth / 2) + cursorToDragHandleCenterOffset;

      // Update the handle position and after image width
      if (dragHandlePosition < minDragHandlePosition) {
        compare.handle.style.left = `${minDragHandlePosition  }px`;
        compare.afterImage.style.width = `${minDragHandlePosition + (dragHandleWidth / 2)  }px`;
      } else if (dragHandlePosition > maxDragHandlePosition) {
        compare.handle.style.left = `${maxDragHandlePosition  }px`;
        compare.afterImage.style.width = `${maxDragHandlePosition + (dragHandleWidth / 2)  }px`;
      } else {
        compare.handle.style.left = `${dragHandlePosition  }px`;
        compare.afterImage.style.width = `${dragHandlePosition + (dragHandleWidth / 2)  }px`;
      }

      updateLabel(compare.labelAfter, compare.afterImage, 'left');
      updateLabel(compare.labelBefore, compare.afterImage, 'right');

      compare.isDragging = false;
    };

    /**
     * Handles drag start
     */
    const handleDragStart = (e) => {
      e.preventDefault();

      compare.handle.classList.add('is-dragged');
      compare.afterImage.classList.add('resizable');

      // Get container properties
      const containerOffset = element.offsetLeft;
      const containerWidth = element.offsetWidth;

      // Get the drag handle properties
      const dragHandleWidth = compare.handle.offsetWidth;
      const dragHandleCenter = compare.handle.offsetLeft + (dragHandleWidth / 2);

      // Offset between the drag handle center and the clicked cursor position
      const cursorToDragHandleCenterOffset = dragHandleCenter - (e.pageX - containerOffset);

      // Calculate boundaries
      const minDragHandlePosition = -dragHandleWidth / 2;
      const maxDragHandlePosition = containerWidth - (dragHandleWidth / 2);

      const handleMouseMove = (e) => {
        if (!compare.isDragging) {
          compare.isDragging = true;
          requestAnimationFrame(() => {
            animateDraggedHandle(e, dragHandleWidth, cursorToDragHandleCenterOffset, minDragHandlePosition, maxDragHandlePosition, containerOffset);
          });
        }
      };

      const handleMouseUp = () => {
        compare.handle.classList.remove('is-dragged');
        compare.afterImage.classList.remove('resizable');
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    /**
     * Sets up intersection observer for animation on scroll
     */
    const setupIntersectionObserver = () => {
      intersectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      });

      intersectionObserver.observe(element);
    };

    /**
     * Sets up resize observer for responsive behavior
     */
    const setupResizeObserver = () => {
      resizeObserver = new ResizeObserver(() => {
        if (!compare.isResizing) {
          compare.isResizing = true;
          checkLabels();
        }
      });

      resizeObserver.observe(element);
    };

    /**
     * Sets the comparison position
     * @param {number} percentage - Position as percentage (0-100)
     */
    const setPosition = (percentage) => {
      const clampedPercentage = Math.max(0, Math.min(100, percentage));
      compare.afterImage.style.width = `${clampedPercentage  }%`;

      const handlePosition = (clampedPercentage / 100) * element.offsetWidth - (compare.handle.offsetWidth / 2);
      compare.handle.style.left = `${handlePosition  }px`;

      checkLabels();
    };

    /**
     * Initializes the component
     */
    const init = () => {
      // Set up drag handling
      compare.handle.addEventListener('mousedown', handleDragStart);

      // Touch support
      compare.handle.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
          pageX: touch.pageX,
          pageY: touch.pageY
        });
        compare.handle.dispatchEvent(mouseEvent);
      });

      // Set up observers
      setupIntersectionObserver();
      setupResizeObserver();

      // Set initial position
      if (settings.startPosition !== 50) {
        setPosition(settings.startPosition);
      }
    };

    /**
     * Destroys the instance and cleans up
     */
    const destroy = () => {
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      compare.handle.removeEventListener('mousedown', handleDragStart);
    };

    // Initialize and return public API
    init();

    return {
      element: compare.element,
      setPosition,
      destroy
    };
  }

  /**
   * Initializes all image compare components on the page
   */
  const initAllComparisons = () => {
    const comparisons = document.querySelectorAll('.image-comparison-container');
    const instances = [];

    comparisons.forEach(container => {
      // Skip if already initialized
      if (container.dataset.initialized) {return;}
      container.dataset.initialized = 'true';

      // Parse options from data attributes if available
      const options = {
        startPosition: parseInt(container.dataset.startPosition) || 50,
        labelBeforeText: container.dataset.labelBefore || 'Before',
        labelAfterText: container.dataset.labelAfter || 'After'
      };

      const instance = createImageCompare(container, options);
      if (instance) {
        instances.push(instance);
        // Store instance for cleanup
        container._compareInstance = instance;
      }
    });

    return instances;
  };

  /**
   * Cleanup all image compare components
   */
  const cleanupAllComparisons = () => {
    const comparisons = document.querySelectorAll('.image-comparison-container[data-initialized]');
    comparisons.forEach(container => {
      if (container._compareInstance && container._compareInstance.destroy) {
        container._compareInstance.destroy();
      }
    });
  };

  // Register with page transitions for SWUP support
  if (window.PageTransitions) {
    window.PageTransitions.registerComponent('image-compare', initAllComparisons);
    window.PageTransitions.registerCleanup('image-compare', cleanupAllComparisons);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllComparisons);
  } else {
    initAllComparisons();
  }
};

// Auto-initialize
initImageCompare();
