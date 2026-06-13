/**
 * Hero Slider Component
 * Manages multiple slides with navigation, autoplay, and transitions
 */

const initHeroSlider = () => {
  /**
   * Creates a new hero slider instance
   * @param {HTMLElement} element - The slider element
   * @param {Object} options - Configuration options
   * @returns {Object} The slider instance
   */
  function createHeroSlider(element, options = {}) {
    const defaultOptions = {
      autoPlayDelay: 5000,
      transitionDuration: 500
    };

    const settings = { ...defaultOptions, ...options };

    const slider = {
      element,
      navigation: element.querySelector('.js-nav'),
      slides: Array.from(element.querySelectorAll('.js-slide')),
      autoplay: element.classList.contains('is-autoplay'),
      autoPlayDelay: settings.autoPlayDelay,
      newSlideIndex: 0,
      oldSlideIndex: 0,
      autoPlayId: null,
      isPaused: false
    };

    if (!slider.navigation || slider.slides.length === 0) {
      console.warn('Hero slider missing required elements');
      return null;
    }

    slider.navigationItems = Array.from(slider.navigation.querySelectorAll('li'));
    slider.slidesNumber = slider.slides.length;

    /**
     * Sets up autoplay functionality
     */
    const setAutoplay = () => {
      if (slider.autoplay && !slider.isPaused) {
        clearInterval(slider.autoPlayId);
        slider.autoPlayId = setInterval(autoplaySlider, slider.autoPlayDelay);
      }
    };

    /**
     * Toggles pause/resume state
     */
    const togglePause = () => {
      slider.isPaused = !slider.isPaused;
      
      if (slider.isPaused) {
        clearInterval(slider.autoPlayId);
        slider.element.classList.add('is-manually-paused');
      } else {
        slider.element.classList.remove('is-manually-paused');
        if (slider.autoplay) {
          setAutoplay();
        }
      }
      
      return slider.isPaused;
    };

    /**
     * Advances to the next slide automatically
     */
    const autoplaySlider = () => {
      slider.oldSlideIndex = slider.newSlideIndex;
      slider.newSlideIndex = (slider.newSlideIndex < slider.slidesNumber - 1) 
        ? slider.newSlideIndex + 1 
        : 0;
      updateSlider();
    };

    /**
     * Updates the slider to show the new slide
     */
    const updateSlider = () => {
      renderNewSlide();
      updateSliderNavigation();
      setAutoplay();
      handleBackgroundVideo();
    };

    /**
     * Renders the new slide with transition effects
     */
    const renderNewSlide = () => {
      const oldSlide = slider.slides[slider.oldSlideIndex];
      const newSlide = slider.slides[slider.newSlideIndex];
      
      oldSlide.classList.remove('is-selected');
      oldSlide.classList.add('is-moving');
      
      newSlide.classList.add('is-selected');
      
      // Clean up after transition
      const handleTransitionEnd = () => {
        oldSlide.removeEventListener('transitionend', handleTransitionEnd);
        oldSlide.classList.remove('is-moving');
      };
      
      oldSlide.addEventListener('transitionend', handleTransitionEnd);
    };

    /**
     * Updates navigation to reflect current slide
     */
    const updateSliderNavigation = () => {
      slider.navigationItems[slider.oldSlideIndex]?.classList.remove('is-selected');
      slider.navigationItems[slider.newSlideIndex]?.classList.add('is-selected');
    };

    /**
     * Handles background video playback for slides
     */
    const handleBackgroundVideo = () => {
      // Stop video in old slide
      const oldSlide = slider.slides[slider.oldSlideIndex];
      if (oldSlide) {
        const oldVideo = oldSlide.querySelector('.background-video video, .background-video iframe');
        if (oldVideo) {
          if (oldVideo.tagName === 'VIDEO') {
            oldVideo.pause();
            oldVideo.currentTime = 0;
          } else if (oldVideo.tagName === 'IFRAME') {
            // For YouTube/Vimeo iframes, we'll trigger a custom event
            const backgroundVideoEl = oldSlide.querySelector('.js-background-video');
            if (backgroundVideoEl) {
              backgroundVideoEl.dispatchEvent(new CustomEvent('pauseVideo'));
            }
          }
        }
      }
      
      // Start video in new slide
      const newSlide = slider.slides[slider.newSlideIndex];
      if (newSlide) {
        const newVideo = newSlide.querySelector('.background-video video, .background-video iframe');
        if (newVideo) {
          if (newVideo.tagName === 'VIDEO') {
            // For HTML5 video
            newVideo.play().catch(err => {
              console.warn('Video autoplay prevented:', err);
            });
          } else if (newVideo.tagName === 'IFRAME') {
            // For YouTube/Vimeo iframes, trigger autoplay
            const backgroundVideoEl = newSlide.querySelector('.js-background-video');
            if (backgroundVideoEl && backgroundVideoEl.dataset.autoplay === 'true') {
              backgroundVideoEl.dispatchEvent(new CustomEvent('playVideo'));
            }
          }
        }
      }
    };

    /**
     * Handles navigation click events
     */
    const handleNavigationClick = (event) => {
      // Ignore clicks on the nav container itself
      if (event.target.matches('nav') || event.target.matches('ul')) {
        return;
      }
      
      event.preventDefault();
      
      const clickedLink = event.target.closest('a');
      if (!clickedLink) {return;}
      
      const parentListItem = clickedLink.closest('li');
      if (!parentListItem) {return;}
      
      // Check if already selected - if so, ignore single click
      if (parentListItem.classList.contains('is-selected')) {
        return;
      }
      
      // Clear any manual pause state when navigating to a different slide
      if (slider.isPaused) {
        slider.isPaused = false;
        slider.element.classList.remove('is-manually-paused');
        // Remove pause indicator from all tabs
        slider.navigationItems.forEach(item => {
          item.classList.remove('is-paused-indicator');
        });
      }
      
      // Update indices and transition
      slider.oldSlideIndex = slider.newSlideIndex;
      slider.newSlideIndex = slider.navigationItems.indexOf(parentListItem);
      
      if (slider.newSlideIndex !== -1) {
        updateSlider();
      }
    };

    /**
     * Handles navigation double-click events for pause/resume
     */
    const handleNavigationDoubleClick = (event) => {
      event.preventDefault();
      
      const clickedLink = event.target.closest('a');
      if (!clickedLink) {return;}
      
      const parentListItem = clickedLink.closest('li');
      if (!parentListItem) {return;}
      
      // Only allow pause/resume on the currently selected slide
      if (parentListItem.classList.contains('is-selected')) {
        const isPaused = togglePause();
        
        // Visual feedback
        if (isPaused) {
          parentListItem.classList.add('is-paused-indicator');
        } else {
          parentListItem.classList.remove('is-paused-indicator');
        }
      }
    };

    /**
     * Initializes the slider
     */
    const init = () => {
      // Set up navigation
      slider.navigation.addEventListener('click', handleNavigationClick);
      slider.navigation.addEventListener('dblclick', handleNavigationDoubleClick);
      
      // Set up autoplay hover behavior - simple like PHP version
      if (slider.autoplay) {
        slider.element.addEventListener('mouseenter', () => {
          if (!slider.isPaused) {
            clearInterval(slider.autoPlayId);
            slider.element.classList.add('is-paused');
          }
        });
        
        slider.element.addEventListener('mouseleave', () => {
          if (!slider.isPaused) {
            slider.element.classList.remove('is-paused');
            setAutoplay();
          }
        });
        
        setAutoplay();
      }
      
      // Start any videos in the first slide
      handleBackgroundVideo();
    };

    /**
     * Destroys the slider instance
     */
    const destroy = () => {
      clearInterval(slider.autoPlayId);
      slider.navigation.removeEventListener('click', handleNavigationClick);
      slider.element.classList.remove('is-paused');
    };

    // Initialize and return public API
    init();
    
    return {
      element: slider.element,
      goToSlide: (index) => {
        if (index >= 0 && index < slider.slidesNumber) {
          slider.oldSlideIndex = slider.newSlideIndex;
          slider.newSlideIndex = index;
          updateSlider();
        }
      },
      nextSlide: () => autoplaySlider(),
      destroy
    };
  }

  /**
   * Initializes all hero sliders on the page
   */
  const initAllSliders = () => {
    const heroSliders = document.querySelectorAll('.js-hero-slider');
    const instances = [];

    heroSliders.forEach(slider => {
      // Skip if already initialized
      if (slider.dataset.initialized) {return;}
      slider.dataset.initialized = 'true';

      const instance = createHeroSlider(slider);
      if (instance) {
        instances.push(instance);
        // Store instance for cleanup
        slider._sliderInstance = instance;
      }
    });

    return instances;
  };

  /**
   * Cleanup all hero sliders
   */
  const cleanupAllSliders = () => {
    const heroSliders = document.querySelectorAll('.js-hero-slider[data-initialized]');
    heroSliders.forEach(slider => {
      if (slider._sliderInstance && slider._sliderInstance.destroy) {
        slider._sliderInstance.destroy();
      }
    });
  };

  // Register with page transitions for SWUP support
  if (window.PageTransitions) {
    window.PageTransitions.registerComponent('hero-slider', initAllSliders);
    window.PageTransitions.registerCleanup('hero-slider', cleanupAllSliders);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSliders);
  } else {
    initAllSliders();
  }
};

// Auto-initialize
initHeroSlider();