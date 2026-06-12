/**
 * Manage logo display
 * If logos list fits on viewport width its static, if not logos will rotate automatically
 */
document.addEventListener( 'DOMContentLoaded', () => {
  const allLogosLists = document.querySelectorAll( '.js-logos-list' );

  // Function to handle animation completion
  const completeAnimationAndRemovePlay = ( logosList ) => {
    const parentElement = logosList.parentElement;

    // If already in the process of stopping, don't restart
    if ( parentElement.dataset.stopping === 'true' ) {
      return;
    }

    // Mark as stopping to prevent multiple listeners
    parentElement.dataset.stopping = 'true';

    // Listen for the animation to complete one full cycle
    const handleAnimationIteration = () => {
      parentElement.classList.remove( 'play' );
      parentElement.removeEventListener( 'animationiteration', handleAnimationIteration );
      delete parentElement.dataset.stopping;
    };

    parentElement.addEventListener( 'animationiteration', handleAnimationIteration );

    // Fallback: remove after a reasonable timeout if animation doesn't fire the event
    setTimeout( () => {
      if ( parentElement.dataset.stopping === 'true' ) {
        parentElement.classList.remove( 'play' );
        parentElement.removeEventListener( 'animationiteration', handleAnimationIteration );
        delete parentElement.dataset.stopping;
      }
    }, 16000 ); // Slightly longer than the 15s animation duration
  };

  // Initial check
  allLogosLists.forEach( ( logosList ) => {
    const containerWidth = logosList.closest( '.marquee-container' ).offsetWidth;
    if ( logosList.offsetWidth > containerWidth ) {
      logosList.parentElement.classList.add( 'play' );
      delete logosList.parentElement.dataset.stopping; // Clear any stopping state
    } else {
      const parentElement = logosList.parentElement;
      if ( parentElement.classList.contains( 'play' ) ) {
        completeAnimationAndRemovePlay( logosList );
      }
    }
  } );

  const resizeObserver = new ResizeObserver( () => {
    const allLogosLists = document.querySelectorAll( '.js-logos-list' );
    allLogosLists.forEach( ( logosList ) => {
      const containerWidth = logosList.closest( '.marquee-container' ).offsetWidth;
      if ( logosList.offsetWidth > containerWidth ) {
        logosList.parentElement.classList.add( 'play' );
        delete logosList.parentElement.dataset.stopping; // Clear any stopping state
      } else {
        const parentElement = logosList.parentElement;
        if ( parentElement.classList.contains( 'play' ) && parentElement.dataset.stopping !== 'true' ) {
          completeAnimationAndRemovePlay( logosList );
        }
      }
    } );
  } );

  resizeObserver.observe( document.body );
} );