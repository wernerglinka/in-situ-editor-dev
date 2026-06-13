/**
 * Podcast Component - Shikwasa Integration
 * Initializes podcast players for each episode using Shikwasa library
 */

import loadShikwasa from './modules/load-shikwasa.js';
import { parseRSSFeed } from './modules/rss-parser.js';

/**
 * Initialize main podcast player and episode selection
 * @param {HTMLElement} section - The podcast section element
 * @param {Object} options - Configuration options
 */
// eslint-disable-next-line complexity
async function initializePodcastPlayer( section, options = {} ) {
  const mainPlayerContainer = section.querySelector( '#main-player' );
  const episodeListContainer = section.querySelector( '.episode-list' );

  if ( !mainPlayerContainer ) {return null;}

  // Check if we need to fetch episodes from RSS
  const rssUrl = section.querySelector( '.podcast-wrapper' )?.dataset.rssUrl;
  let episodes = [];

  if ( rssUrl ) {
    try {
      // Show loading state
      if ( episodeListContainer ) {
        episodeListContainer.innerHTML = '<div class="loading-episodes">Loading episodes...</div>';
      }

      // Get local cover image to prefer over RSS feed images
      const wrapper = section.querySelector( '.podcast-wrapper' );
      const localCoverImage = wrapper?.dataset.coverImage || '';

      const allEpisodes = await parseRSSFeed( rssUrl, {
        maxEpisodes: options.maxEpisodes || 50,
        localCoverImage: localCoverImage
      } );

      // Show initial batch of episodes
      const initialCount = options.initialEpisodes || 5;
      episodes = allEpisodes.slice( 0, initialCount );

      // Store remaining episodes for "Load More" functionality
      section._remainingEpisodes = allEpisodes.slice( initialCount );
      section._allEpisodes = allEpisodes;

      // Render episodes if we have them
      if ( episodes.length > 0 && episodeListContainer ) {
        renderEpisodeList( episodeListContainer, episodes, options.simpleEpisodesList );

        // Add "Load More" button if there are remaining episodes
        if ( section._remainingEpisodes.length > 0 ) {
          addLoadMoreButton( episodeListContainer, section, options.simpleEpisodesList );
        }
      }
    } catch ( error ) {
      console.error( 'Failed to load podcast episodes:', error );
      if ( episodeListContainer ) {
        episodeListContainer.innerHTML = '<div class="error-loading">Failed to load episodes. Please try again later.</div>';
      }
      return null;
    }
  }

  // Get episode items (either pre-rendered or dynamically created)
  const episodeItems = section.querySelectorAll( '.episode-item' );
  if ( episodeItems.length === 0 ) {return null;}

  // Load Shikwasa library first
  try {
    await loadShikwasa();
  } catch ( error ) {
    console.error( 'Failed to load Shikwasa library:', error );
    // Create fallback HTML5 audio player
    const fallbackAudio = document.createElement( 'audio' );
    fallbackAudio.controls = true;
    fallbackAudio.preload = 'metadata';
    fallbackAudio.className = 'fallback-audio-player';
    mainPlayerContainer.appendChild( fallbackAudio );

    // Store player reference and set up selectors
    const fallbackInstance = { player: fallbackAudio, isShikwasa: false };
    section._podcastPlayer = fallbackInstance;
    setupEpisodeSelectors( section );

    return fallbackInstance;
  }

  // Get podcast info
  const podcastHeader = section.querySelector( '.podcast-header' );
  const wrapper = section.querySelector( '.podcast-wrapper' );
  const podcastTitle = podcastHeader?.querySelector( '.podcast-title' )?.textContent || 
                      wrapper?.dataset.podcastTitle || '';
  const podcastCover = podcastHeader?.querySelector( '.podcast-cover' )?.src || '';

  // Initialize with first episode
  const firstEpisode = episodeItems[ 0 ];
  const firstEpisodeData = {
    title: firstEpisode.dataset.episodeTitle,
    src: firstEpisode.dataset.audioFile,
    cover: firstEpisode.dataset.episodeThumbnail || podcastCover,
    artist: podcastTitle
  };

  let mainPlayer;

  try {
    // Check different ways Shikwasa might be exposed
    const PlayerClass = window.Shikwasa?.Player || window.Player;
    if ( !PlayerClass ) {
      throw new Error( 'Shikwasa Player class not found' );
    }

    mainPlayer = new PlayerClass( {
      container: () => mainPlayerContainer,
      fixed: {
        type: 'none'
      },
      themeColor: options.themeColor || '#007aff',
      theme: options.theme || 'auto',
      autoplay: options.autoplay || false,
      muted: false,
      preload: 'metadata',
      audio: firstEpisodeData,
      speedOptions: [ 0.75, 1, 1.25, 1.5, 2 ],
      download: true
    } );

    // Store player reference on section first before setting up selectors
    const playerInstance = { player: mainPlayer, isShikwasa: true };
    section._podcastPlayer = playerInstance;

    // Set up episode selection using shared function
    setupEpisodeSelectors( section );

    // Set first episode as active
    firstEpisode.classList.add( 'active' );

    return playerInstance;

  } catch ( error ) {
    console.warn( 'Failed to initialize Shikwasa player:', error );

    // Fallback to HTML5 audio
    const fallbackAudio = document.createElement( 'audio' );
    fallbackAudio.controls = true;
    fallbackAudio.preload = 'metadata';
    fallbackAudio.src = firstEpisodeData.src;
    fallbackAudio.className = 'fallback-audio-player';
    mainPlayerContainer.appendChild( fallbackAudio );

    // Store player reference on section first before setting up selectors
    const fallbackPlayerInstance = { player: fallbackAudio, isShikwasa: false };
    section._podcastPlayer = fallbackPlayerInstance;

    // Set up episode selection for fallback player using shared function
    setupEpisodeSelectors( section );

    firstEpisode.classList.add( 'active' );
    return fallbackPlayerInstance;
  }
}

/**
 * Render episode list from fetched RSS data
 * @param {HTMLElement} container - Episode list container
 * @param {Array} episodes - Episode data array
 * @param {boolean} simpleLayout - Whether to use simple layout
 */
function renderEpisodeList( container, episodes, simpleLayout = false ) {
  const episodeHTML = episodes.map( episode => {
    if ( simpleLayout ) {
      return `
        <div class="episode-item simple" 
             data-episode-id="${ episode.id }" 
             data-audio-file="${ episode.audioFile }"
             data-episode-title="${ episode.title }"
             data-episode-duration="${ episode.duration }"
             data-episode-thumbnail="${ episode.thumbnail }">
          <button class="episode-selector">
            <div class="episode-info-simple">
              <h3 class="episode-title">${ episode.title }</h3>
              <div class="episode-meta">
                ${ episode.publishDate ? `<span class="episode-date">${ episode.publishDate }</span>` : '' }
                ${ episode.duration ? `<span class="episode-duration">${ episode.duration }</span>` : '' }
              </div>
            </div>
          </button>
        </div>
      `;
    } 
      return `
        <div class="episode-item" 
             data-episode-id="${ episode.id }" 
             data-audio-file="${ episode.audioFile }"
             data-episode-title="${ episode.title }"
             data-episode-duration="${ episode.duration }"
             data-episode-thumbnail="${ episode.thumbnail }">
          <button class="episode-selector">
            <div class="episode-thumbnail">
              <img src="${ episode.thumbnail || '/assets/images/default-podcast-thumb.jpg' }" 
                   alt="${ episode.title }" 
                   onerror="this.src='/assets/images/default-podcast-thumb.jpg'">
              <div class="play-indicator">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            <div class="episode-info">
              <h3 class="episode-title">${ episode.title }</h3>
              ${ episode.description ? `<p class="episode-description">${ episode.description }</p>` : '' }
              <div class="episode-meta">
                ${ episode.publishDate ? `<span class="episode-date">${ episode.publishDate }</span>` : '' }
                ${ episode.duration ? `<span class="episode-duration">${ episode.duration }</span>` : '' }
              </div>
            </div>
          </button>
        </div>
      `;
    
  }).join( '' );

  container.innerHTML = episodeHTML;
}

/**
 * Add "Load More" button to episode list
 * @param {HTMLElement} container - Episode list container
 * @param {HTMLElement} section - Podcast section element
 * @param {boolean} simpleLayout - Whether using simple layout
 */
function addLoadMoreButton( container, section, simpleLayout = false ) {
  const loadMoreButton = document.createElement( 'button' );
  loadMoreButton.className = 'button primary load-more-episodes';
  loadMoreButton.textContent = `Load More Episodes (${ section._remainingEpisodes.length } remaining)`;
  loadMoreButton.addEventListener( 'click', () => loadMoreEpisodes( container, section, simpleLayout ) );

  container.appendChild( loadMoreButton );
}

/**
 * Load more episodes when "Load More" button is clicked
 * @param {HTMLElement} container - Episode list container
 * @param {HTMLElement} section - Podcast section element
 * @param {boolean} simpleLayout - Whether using simple layout
 */
function loadMoreEpisodes( container, section, simpleLayout = false ) {
  const loadMoreButton = container.querySelector( '.load-more-episodes' );
  if ( !loadMoreButton ) {return;}

  // Show loading state
  loadMoreButton.textContent = 'Loading...';
  loadMoreButton.disabled = true;

  // Get next batch of episodes (5 at a time)
  const batchSize = 5;
  const nextBatch = section._remainingEpisodes.slice( 0, batchSize );
  section._remainingEpisodes = section._remainingEpisodes.slice( batchSize );

  // Render new episodes and append to existing list
  const newEpisodesHTML = nextBatch.map( episode => {
    if ( simpleLayout ) {
      return `
        <div class="episode-item simple" 
             data-episode-id="${ episode.id }" 
             data-audio-file="${ episode.audioFile }"
             data-episode-title="${ episode.title }"
             data-episode-duration="${ episode.duration }"
             data-episode-thumbnail="${ episode.thumbnail }">
          <button class="episode-selector">
            <div class="episode-info-simple">
              <h3 class="episode-title">${ episode.title }</h3>
              <div class="episode-meta">
                ${ episode.publishDate ? `<span class="episode-date">${ episode.publishDate }</span>` : '' }
                ${ episode.duration ? `<span class="episode-duration">${ episode.duration }</span>` : '' }
              </div>
            </div>
          </button>
        </div>
      `;
    } 
      return `
        <div class="episode-item" 
             data-episode-id="${ episode.id }" 
             data-audio-file="${ episode.audioFile }"
             data-episode-title="${ episode.title }"
             data-episode-duration="${ episode.duration }"
             data-episode-thumbnail="${ episode.thumbnail }">
          <button class="episode-selector">
            <div class="episode-thumbnail">
              <img src="${ episode.thumbnail || '/assets/images/default-podcast-thumb.jpg' }" 
                   alt="${ episode.title }" 
                   onerror="this.src='/assets/images/default-podcast-thumb.jpg'">
              <div class="play-indicator">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            <div class="episode-info">
              <h3 class="episode-title">${ episode.title }</h3>
              ${ episode.description ? `<p class="episode-description">${ episode.description }</p>` : '' }
              <div class="episode-meta">
                ${ episode.publishDate ? `<span class="episode-date">${ episode.publishDate }</span>` : '' }
                ${ episode.duration ? `<span class="episode-duration">${ episode.duration }</span>` : '' }
              </div>
            </div>
          </button>
        </div>
      `;
    
  }).join( '' );

  // Insert new episodes before the Load More button
  loadMoreButton.insertAdjacentHTML( 'beforebegin', newEpisodesHTML );

  // Update Load More button or remove it if no more episodes
  if ( section._remainingEpisodes.length > 0 ) {
    loadMoreButton.textContent = `Load More Episodes (${ section._remainingEpisodes.length } remaining)`;
    loadMoreButton.disabled = false;
  } else {
    loadMoreButton.remove();
  }

  // Re-attach event listeners for new episode selectors
  setupEpisodeSelectors( section );
}

/**
 * Set up event listeners for episode selectors
 * @param {HTMLElement} section - Podcast section element
 */
function setupEpisodeSelectors( section ) {
  const episodeItems = section.querySelectorAll( '.episode-item' );
  // const mainPlayerContainer = section.querySelector( '#main-player' ); // Reserved for future use
  const podcastHeader = section.querySelector( '.podcast-header' );
  const wrapper = section.querySelector( '.podcast-wrapper' );
  const podcastTitle = podcastHeader?.querySelector( '.podcast-title' )?.textContent ||
                      wrapper?.dataset.podcastTitle || '';
  const podcastCover = podcastHeader?.querySelector( '.podcast-cover' )?.src || '';

  episodeItems.forEach( ( episodeItem ) => {
    const episodeSelector = episodeItem.querySelector( '.episode-selector' );
    if ( !episodeSelector ) {return;}

    // Remove any existing click handler by using a unique event listener
    // Store the handler function so we can remove it later
    if ( episodeItem._clickHandler ) {
      episodeSelector.removeEventListener( 'click', episodeItem._clickHandler );
    }

    // Create new click handler
    episodeItem._clickHandler = ( e ) => {
      e.preventDefault();
      e.stopPropagation();

      // Update active state for all episode items
      const allItems = section.querySelectorAll( '.episode-item' );
      allItems.forEach( item => item.classList.remove( 'active' ) );
      episodeItem.classList.add( 'active' );

      // Load new episode in main player
      const episodeData = {
        title: episodeItem.dataset.episodeTitle,
        src: episodeItem.dataset.audioFile,
        cover: episodeItem.dataset.episodeThumbnail || podcastCover,
        artist: podcastTitle
      };

      // Update player with new episode
      const playerInstance = section._podcastPlayer;
      if ( playerInstance && playerInstance.player ) {
        if ( playerInstance.isShikwasa ) {
          // Shikwasa player - use update method
          playerInstance.player.update( episodeData );
        } else {
          // Fallback HTML5 audio player
          playerInstance.player.src = episodeData.src;
          playerInstance.player.load();
        }
      }
    };

    // Add the new click handler
    episodeSelector.addEventListener( 'click', episodeItem._clickHandler );
  } );
}

/**
 * Initialize all podcast sections on the page
 */
async function initializePodcastSections() {
  const podcastSections = document.querySelectorAll( '.podcast' );

  // Initialize all podcast players in parallel
  await Promise.all(
    Array.from( podcastSections ).map( async ( section ) => {
      // Skip if already initialized
      if ( section.dataset.initialized ) {return;}
      section.dataset.initialized = 'true';

      // Extract options from data attributes on podcast-wrapper or default values
      const wrapper = section.querySelector( '.podcast-wrapper' );
      const options = {
        theme: wrapper?.dataset.theme || 'auto',
        themeColor: wrapper?.dataset.themeColor || '#007aff',
        autoplay: wrapper?.dataset.autoplay === 'true',
        initialEpisodes: parseInt( wrapper?.dataset.initialEpisodes ) || 5,
        maxEpisodes: parseInt( wrapper?.dataset.maxEpisodes ) || 50,
        simpleEpisodesList: wrapper?.dataset.simpleEpisodesList === 'true'
      };

      await initializePodcastPlayer( section, options );
    } )
  );
}

/**
 * Cleanup function for removing players (useful for SPA navigation)
 */
function cleanupPodcastPlayers() {
  const podcastSections = document.querySelectorAll( '.podcast' );

  podcastSections.forEach( ( section ) => {
    if ( section._podcastPlayer ) {
      const { player } = section._podcastPlayer;
      if ( player && typeof player.destroy === 'function' ) {
        player.destroy();
      }
      section._podcastPlayer = null;
    }
  } );
}

// Register with page transitions for SWUP support
if ( window.PageTransitions ) {
  window.PageTransitions.registerComponent( 'podcast', initializePodcastSections );
  window.PageTransitions.registerCleanup( 'podcast', cleanupPodcastPlayers );
}

// Auto-initialize when DOM is ready
if ( document.readyState === 'loading' ) {
  document.addEventListener( 'DOMContentLoaded', initializePodcastSections );
} else {
  initializePodcastSections();
}

// Export functions for manual usage
window.podcastComponent = {
  init: initializePodcastSections,
  cleanup: cleanupPodcastPlayers,
  initializeSection: initializePodcastPlayer
};