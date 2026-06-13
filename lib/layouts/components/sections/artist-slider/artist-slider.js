/**
 * Artist Slider Component
 *
 * Full-screen image slider for artist websites with:
 * - Auto-cycling with configurable interval
 * - Fade transitions between slides
 * - Info panel overlay with artwork details
 * - Navigation dots
 * - Keyboard navigation
 * - Pause on info panel open
 */

const initArtistSliderComponent = () => {
  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   */
  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  /**
   * Get slide data from data attributes
   * @param {HTMLElement} slide - Slide element
   * @returns {Object} Slide data object
   */
  const getSlideData = (slide) => ({
    title: slide.dataset.title ?? '',
    description: slide.dataset.description ?? '',
    size: slide.dataset.size ?? '',
    year: slide.dataset.year ?? '',
    materials: slide.dataset.materials ?? '',
    link: slide.dataset.link ?? ''
  });

  /**
   * Update info panel content with current slide data
   * @param {Object} slider - Slider state object
   */
  const updateInfoPanel = (slider) => {
    const currentSlide = slider.slides[slider.currentSlide];
    const data = getSlideData(currentSlide);

    slider.infoPanel.querySelector('.info-title').textContent = data.title;
    slider.infoPanel.querySelector('.info-description').textContent = data.description;
    slider.infoPanel.querySelector('.info-year').textContent = data.year;
    slider.infoPanel.querySelector('.info-size').textContent = data.size;
    slider.infoPanel.querySelector('.info-materials').textContent = data.materials;

    const linkElement = slider.infoPanel.querySelector('.info-link');
    if (data.link) {
      linkElement.href = data.link;
      linkElement.classList.remove('is-hidden');
    } else {
      linkElement.classList.add('is-hidden');
    }
  };

  /**
   * Show specific slide by index
   * @param {Object} slider - Slider state object
   * @param {number} index - Target slide index
   */
  const showSlide = (slider, index) => {
    if (index < 0 || index >= slider.slides.length || index === slider.currentSlide) {
      return;
    }

    slider.slides[slider.currentSlide].classList.remove('is-active');
    slider.currentSlide = index;
    slider.slides[slider.currentSlide].classList.add('is-active');

    updateDots(slider);
    updateInfoPanel(slider);

    const slideTitle = slider.slides[slider.currentSlide].dataset.title;
    announceToScreenReader(`Now showing: ${slideTitle}. Slide ${slider.currentSlide + 1} of ${slider.slides.length}`);
  };

  /**
   * Advance to next slide (wrapping)
   * @param {Object} slider - Slider state object
   */
  const nextSlide = (slider) => {
    const nextIndex = (slider.currentSlide + 1) % slider.slides.length;
    showSlide(slider, nextIndex);
  };

  /**
   * Go to previous slide (wrapping)
   * @param {Object} slider - Slider state object
   */
  const previousSlide = (slider) => {
    const prevIndex = (slider.currentSlide - 1 + slider.slides.length) % slider.slides.length;
    showSlide(slider, prevIndex);
  };

  /**
   * Update navigation dots to reflect current slide
   * @param {Object} slider - Slider state object
   */
  const updateDots = (slider) => {
    if (!slider.dots) {
      return;
    }

    slider.dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === slider.currentSlide);
      dot.setAttribute('aria-current', index === slider.currentSlide ? 'true' : 'false');
    });
  };

  /**
   * Start auto-play interval
   * @param {Object} slider - Slider state object
   */
  const startAutoPlay = (slider) => {
    if (slider.intervalId) {
      return;
    }

    slider.intervalId = setInterval(() => {
      nextSlide(slider);
    }, slider.cycleTime);
  };

  /**
   * Stop auto-play interval
   * @param {Object} slider - Slider state object
   */
  const stopAutoPlay = (slider) => {
    if (slider.intervalId) {
      clearInterval(slider.intervalId);
      slider.intervalId = null;
    }
  };

  /**
   * Toggle info panel visibility
   * @param {Object} slider - Slider state object
   */
  const toggleInfo = (slider) => {
    slider.isPaused = !slider.isPaused;

    if (slider.isPaused) {
      stopAutoPlay(slider);
      slider.infoPanel.classList.add('is-visible');
      slider.infoPanel.setAttribute('aria-hidden', 'false');
      slider.infoToggle.setAttribute('aria-expanded', 'true');
      slider.infoToggle.setAttribute('aria-label', 'Hide artwork information');
    } else {
      slider.infoPanel.classList.remove('is-visible');
      slider.infoPanel.setAttribute('aria-hidden', 'true');
      slider.infoToggle.setAttribute('aria-expanded', 'false');
      slider.infoToggle.setAttribute('aria-label', 'Show artwork information');
      startAutoPlay(slider);
    }
  };

  /**
   * Add event listeners for info toggle
   * @param {Object} slider - Slider state object
   */
  const addInfoToggleListener = (slider) => {
    slider.infoToggle.addEventListener('click', () => {
      toggleInfo(slider);
    });
  };

  /**
   * Add event listeners for navigation dots
   * @param {Object} slider - Slider state object
   */
  const addDotListeners = (slider) => {
    if (!slider.dots) {
      return;
    }

    slider.dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.dataset.index, 10);
        showSlide(slider, index);
      });
    });
  };

  /**
   * Add keyboard navigation listeners
   * @param {Object} slider - Slider state object
   */
  const addKeyboardListeners = (slider) => {
    slider.wrapper.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextSlide(slider);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previousSlide(slider);
      } else if (event.key === 'Escape' && slider.isPaused) {
        event.preventDefault();
        toggleInfo(slider);
      }
    });
  };

  /**
   * Add touch swipe listeners for mobile navigation
   * @param {Object} slider - Slider state object
   */
  const addSwipeListeners = (slider) => {
    const SWIPE_THRESHOLD = 50;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    slider.wrapper.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].screenX;
      touchStartY = event.changedTouches[0].screenY;
    }, { passive: true });

    slider.wrapper.addEventListener('touchend', (event) => {
      touchEndX = event.changedTouches[0].screenX;
      touchEndY = event.changedTouches[0].screenY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Only trigger swipe if horizontal movement exceeds threshold
      // and horizontal movement is greater than vertical (to avoid conflicts with scrolling)
      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
        // Reset auto-play timer on swipe
        if (!slider.isPaused) {
          stopAutoPlay(slider);
        }

        if (deltaX < 0) {
          nextSlide(slider);
        } else {
          previousSlide(slider);
        }

        // Restart auto-play after swipe (if not paused)
        if (!slider.isPaused) {
          startAutoPlay(slider);
        }
      }
    }, { passive: true });
  };

  /**
   * Initialize a single slider instance
   * @param {HTMLElement} wrapper - Slider wrapper element
   */
  const initSlider = (wrapper) => {
    // Skip if already initialized
    if (wrapper.dataset.initialized) {return;}
    wrapper.dataset.initialized = 'true';

    const slides = wrapper.querySelectorAll('.slide');

    if (slides.length === 0) {
      return;
    }

    const slider = {
      wrapper,
      slides: Array.from(slides),
      infoPanel: wrapper.querySelector('.info-panel'),
      infoToggle: wrapper.querySelector('.info-toggle'),
      dots: wrapper.querySelectorAll('.nav-dot'),
      currentSlide: 0,
      cycleTime: parseInt(wrapper.dataset.cycleTime, 10) || 5000,
      isPaused: false,
      intervalId: null
    };

    slider.dots = slider.dots.length > 0 ? Array.from(slider.dots) : null;

    // Store slider state for cleanup
    wrapper._sliderState = slider;

    updateInfoPanel(slider);
    addInfoToggleListener(slider);
    addDotListeners(slider);
    addKeyboardListeners(slider);
    addSwipeListeners(slider);
    startAutoPlay(slider);
  };

  /**
   * Initialize all artist sliders on the page
   */
  const sliderWrappers = document.querySelectorAll('.artist-slider-wrapper');
  sliderWrappers.forEach(initSlider);
};

/**
 * Cleanup all artist sliders (stop intervals)
 */
const cleanupArtistSliders = () => {
  const sliderWrappers = document.querySelectorAll('.artist-slider-wrapper[data-initialized]');
  sliderWrappers.forEach(wrapper => {
    const slider = wrapper._sliderState;
    if (slider && slider.intervalId) {
      clearInterval(slider.intervalId);
      slider.intervalId = null;
    }
  });
};

// Register with page transitions for SWUP support
if (window.PageTransitions) {
  window.PageTransitions.registerComponent('artist-slider', initArtistSliderComponent);
  window.PageTransitions.registerCleanup('artist-slider', cleanupArtistSliders);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initArtistSliderComponent);
} else {
  initArtistSliderComponent();
}
