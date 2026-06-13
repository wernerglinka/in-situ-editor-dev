/**
 * Enhanced Search Component
 * Provides fuzzy search functionality using Fuse.js with configurable JSON sources
 * Supports multiple search instances on the same page
 */

import loadFuse from './modules/helpers/load-fuse.js';

let Fuse = null;

// Store multiple search instances
const searchInstances = new Map();

// Configuration
const config = {
  minCharacters: 2,
  maxResults: 20,
  debounceDelay: 300,
  highlightMatches: true
};

/**
 * Initialize search component
 */
function initSearch() {
  initAllSearchInstances();

  // Auto-execute search from URL parameter if present
  autoExecuteFromURL();
}

// Register with page transitions for SWUP support
if (window.PageTransitions) {
  window.PageTransitions.registerComponent('search', initSearch);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch);
} else {
  initSearch();
}

/**
 * Initialize all search instances on the page
 */
async function initAllSearchInstances() {
  try {
    // Load Fuse.js library once
    Fuse = await loadFuse();

    // Find all search containers and initialize them in parallel
    const searchContainers = document.querySelectorAll('.search-container');

    await Promise.all(
      Array.from(searchContainers).map(container => initSearchInstance(container))
    );
  } catch (error) {
    console.error('Failed to initialize search:', error);
  }
}

/**
 * Initialize a single search instance
 */
async function initSearchInstance(container) {
  // Skip if already initialized
  if (container.dataset.initialized) {return;}
  container.dataset.initialized = 'true';

  const searchSource = container.dataset.searchSource || '/search-index.json';
  const searchType = container.dataset.searchType || 'default';

  // Get DOM elements for this instance
  const searchInput = container.querySelector('.search-input');
  const searchResults = container.querySelector('.search-results');
  const searchStatus = container.querySelector('.search-status');
  const searchClear = container.querySelector('.search-clear');

  if (!searchInput || !searchResults) {
    console.warn('Search elements not found in container - search functionality disabled');
    return;
  }

  // Create search instance object
  const searchInstance = {
    container,
    searchInput,
    searchResults,
    searchStatus,
    searchClear,
    searchType,
    fuse: null,
    searchData: null,
    debounceTimeout: null
  };

  try {
    // Show loading state
    showStatus(searchInstance, 'Loading search index...', 'loading');

    // Load search index
    const response = await fetch(searchSource);
    if (!response.ok) {
      throw new Error(`Failed to load search index: ${response.status}`);
    }

    searchInstance.searchData = await response.json();

    // Get Fuse options based on search type
    const fuseOptions = getFuseOptions(searchType);

    // Initialize Fuse.js with the loaded index
    const dataArray = searchInstance.searchData.entries || searchInstance.searchData.items || searchInstance.searchData;
    searchInstance.fuse = new Fuse(dataArray, fuseOptions);

    // Store the instance
    const instanceId = searchInput.id || `search-${Date.now()}`;
    searchInstances.set(instanceId, searchInstance);

    // Set up event listeners
    setupEventListeners(searchInstance);

    // Hide loading state
    hideStatus(searchInstance);
  } catch (error) {
    console.error('Failed to initialize search instance:', error);
    showStatus(searchInstance, 'Failed to load search. Please try again later.', 'error');
  }
}

/**
 * Get Fuse.js options based on search type
 */
function getFuseOptions(searchType) {
  const baseOptions = {
    threshold: 0.4,  // Balanced - not too strict, not too loose
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 3,  // Require at least 3 characters (blocks fragments)
    ignoreLocation: true,  // Focus on match quality, not position
    findAllMatches: false,
    useExtendedSearch: false,  // Disable extended search patterns to avoid false positives
    distance: 100,  // Allow flexibility for real words
    isCaseSensitive: false
  };

  switch (searchType) {
    case 'library':
      return {
        ...baseOptions,
        keys: [
          { name: 'title', weight: 10 },
          { name: 'content', weight: 5 },
          { name: 'excerpt', weight: 3 },
          { name: 'headings.title', weight: 7 }
        ]
      };

    case 'site':
    default:
      return {
        ...baseOptions,
        keys: [
          { name: 'title', weight: 10 },
          { name: 'content', weight: 5 },
          { name: 'excerpt', weight: 3 },
          { name: 'headings.title', weight: 7 }
        ]
      };
  }
}

/**
 * Set up event listeners for a search instance
 */
function setupEventListeners(searchInstance) {
  // Search input with debouncing
  searchInstance.searchInput.addEventListener('input', (event) => {
    handleSearchInput(searchInstance, event);
  });

  // Clear button
  if (searchInstance.searchClear) {
    searchInstance.searchClear.addEventListener('click', () => {
      clearSearch(searchInstance);
    });
  }

  // Keyboard shortcuts
  searchInstance.searchInput.addEventListener('keydown', (event) => {
    handleKeyboardShortcuts(searchInstance, event);
  });
}

/**
 * Handle search input with debouncing
 */
function handleSearchInput(searchInstance, _event) {
  clearTimeout(searchInstance.debounceTimeout);
  searchInstance.debounceTimeout = setTimeout(() => {
    handleSearch(searchInstance);
  }, config.debounceDelay);
}

/**
 * Handle search execution
 */
function handleSearch(searchInstance) {
  if (!searchInstance.fuse) {return;}

  const query = searchInstance.searchInput.value.trim();

  // Clear results if query is too short
  if (query.length < config.minCharacters) {
    clearResults(searchInstance);
    if (query.length > 0) {
      showStatus(searchInstance, `Type at least ${config.minCharacters} characters to search`);
    } else {
      hideStatus(searchInstance);
    }
    return;
  }

  // Perform search
  let results = searchInstance.fuse.search(query);

  // Filter results for better relevance AND exact matching
  results = results.filter(result => {
    const relevance = (1 - result.score) * 100;
    const queryLower = query.toLowerCase().trim();
    const item = result.item;

    // First check: basic relevance threshold
    if (relevance < 50) {return false;}  // Lower threshold since we'll also check exact match

    // Check if the query actually appears as a substring in any searchable field
    const searchableFields = [];

    // Add all string fields from the new index structure
    if (item.title) {searchableFields.push(item.title);}
    if (item.content) {searchableFields.push(item.content);}
    if (item.excerpt) {searchableFields.push(item.excerpt);}

    // Add heading titles if they exist
    if (Array.isArray(item.headings)) {
      item.headings.forEach(heading => {
        if (heading.title) {searchableFields.push(heading.title);}
      });
    }

    // Require exact substring match (case insensitive)
    const hasExactMatch = searchableFields.some(field => {
      if (typeof field === 'string') {
        return field.toLowerCase().includes(queryLower);
      }
      return false;
    });

    // For debugging - log what's being checked
    // if (!hasExactMatch && relevance >= 60) {
    //   console.log('No exact match for:', queryLower, 'in', item.title,
    //               '- checked', searchableFields.length, 'fields');
    // }

    return hasExactMatch;
  });

  // Limit results
  if (results.length > config.maxResults) {
    results = results.slice(0, config.maxResults);
  }

  // Display results
  displayResults(searchInstance, results, query);

  // Update status
  updateSearchStatus(searchInstance, results.length, query);
}

/**
 * Display search results
 */
function displayResults(searchInstance, results, query) {
  if (results.length === 0) {
    searchInstance.searchResults.innerHTML = '<div class="no-results">No results found. Try different keywords.</div>';
    return;
  }

  const resultsHTML = results.map(result => {
    const item = result.item;
    const queryLower = query.toLowerCase().trim();

    // Prepare content for display
    let title = item.title || 'Untitled';
    let description = item.excerpt || '';

    // Highlight matches if enabled
    if (config.highlightMatches) {
      title = highlightText(title, query);
      description = highlightText(description, query);
    }

    // Truncate description if needed
    if (description.length > 150) {
      description = `${description.substring(0, 150)}...`;
    }

    // Add highlight parameter to URL for term highlighting on target page
    // Fix home page URL - if it starts with /index, change to /
    let itemUrl = item.url;
    if (itemUrl && itemUrl.startsWith('/index')) {
      // Replace /index with / while preserving anything after (like #anchor)
      itemUrl = itemUrl.replace('/index', '');
      // Ensure we have at least a /
      if (!itemUrl) {
        itemUrl = '/';
      }
    }

    const url = new URL(itemUrl, window.location.origin);
    url.searchParams.set('highlight', query);

    // Check if the match was found in a heading and add anchor if so
    let matchingHeading = null;
    if (Array.isArray(item.headings)) {
      matchingHeading = item.headings.find(heading =>
        heading.title && heading.title.toLowerCase().includes(queryLower)
      );
    }

    // If we found a matching heading, add it as an anchor
    if (matchingHeading) {
      // Use existing ID or generate slug from title
      const headingId = matchingHeading.id || generateSlug(matchingHeading.title);
      if (headingId) {
        url.hash = `#${headingId}`;
      }
    }

    const highlightUrl = url.pathname + url.search + url.hash;

    // Create result HTML - simplified since both types now use same structure
    return `
      <div class="search-result">
        <h3><a href="${highlightUrl}" data-search-result>${title}</a></h3>
        ${description ? `<p class="excerpt">${description}</p>` : ''}
      </div>
    `;
  }).join('');

  searchInstance.searchResults.innerHTML = resultsHTML;

  // Track search for analytics
  trackSearchResults(results, query);
}

/**
 * Highlight search terms in text
 */
function highlightText(text, query) {
  if (!text || !query || query.length < 2) {return text;}

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Generate a URL-safe slug from text
 * Matches the slug generation in main.js for consistency
 */
function generateSlug(text) {
  if (!text) {return '';}

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/-+/g, '-')        // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');     // Remove leading/trailing hyphens
}

/**
 * Clear search results and input
 */
function clearSearch(searchInstance) {
  searchInstance.searchInput.value = '';
  clearResults(searchInstance);
  hideStatus(searchInstance);
  searchInstance.searchInput.focus();
}

/**
 * Clear search results only
 */
function clearResults(searchInstance) {
  if (searchInstance.searchResults) {
    searchInstance.searchResults.innerHTML = '';
  }
}

/**
 * Show status message
 */
function showStatus(searchInstance, message, type = 'info') {
  if (!searchInstance.searchStatus) {return;}

  searchInstance.searchStatus.textContent = message;
  searchInstance.searchStatus.className = `search-status search-${type}`;
  searchInstance.searchStatus.style.display = 'block';
}

/**
 * Hide status message
 */
function hideStatus(searchInstance) {
  if (!searchInstance.searchStatus) {return;}

  searchInstance.searchStatus.style.display = 'none';
}

/**
 * Update search status with results information
 */
function updateSearchStatus(searchInstance, count, query) {
  let message = '';

  if (count === 0) {
    message = `No results for "${query}"`;
  } else if (count === 1) {
    message = `1 result for "${query}"`;
  } else {
    message = `${count} results for "${query}"`;
    if (count === config.maxResults) {
      message += ` (showing first ${config.maxResults})`;
    }
  }

  showStatus(searchInstance, message);
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(searchInstance, event) {
  // Clear search with Escape
  if (event.key === 'Escape') {
    clearSearch(searchInstance);
  }
}

/**
 * Track search results for analytics (placeholder)
 */
function trackSearchResults() {
  // Placeholder for future analytics implementation
  // When implemented, this could track: query, results.length, timestamp, etc.
}

/**
 * Auto-execute search from URL parameter
 * Reads ?q= parameter and executes search if present
 */
function autoExecuteFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');

  if (!query || query.trim().length === 0) {
    return;
  }

  // Wait a bit for search instances to initialize
  setTimeout(() => {
    // Find the first search instance (usually the main one on dedicated search page)
    const firstInstance = searchInstances.values().next().value;

    if (firstInstance && firstInstance.searchInput) {
      // Set the input value
      firstInstance.searchInput.value = query;

      // Execute the search
      handleSearch(firstInstance);

      // Focus the input for immediate user interaction
      firstInstance.searchInput.focus();
    }
  }, 500); // Wait 500ms for instances to fully initialize
}