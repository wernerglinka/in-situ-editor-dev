/**
 * Unified Mapping Component
 * Supports both Leaflet and OpenLayers providers with modular architecture
 */

import { initLeafletMaps } from './modules/providers/leaflet.js';
import { initOpenLayersMaps } from './modules/providers/openlayers.js';

/**
 * Provider factory
 */
const providers = {
  leaflet: initLeafletMaps,
  openlayers: initOpenLayersMaps
};

/**
 * Initialize all maps based on provider
 */
const initAllMaps = async () => {
  const leafletMaps = document.querySelectorAll('.js-leaflet-map:not([data-initialized])');
  const openLayersMaps = document.querySelectorAll('.js-openlayers-map:not([data-initialized])');

  // Mark all as initialized
  leafletMaps.forEach(map => { map.dataset.initialized = 'true'; });
  openLayersMaps.forEach(map => { map.dataset.initialized = 'true'; });

  const promises = [];

  if (leafletMaps.length > 0) {
    promises.push(providers.leaflet());
  }

  if (openLayersMaps.length > 0) {
    promises.push(providers.openlayers());
  }

  try {
    const results = await Promise.all(promises);
    const allInstances = results.flat();
    return allInstances;
  } catch (error) {
    console.error('Failed to initialize maps components:', error);
    return [];
  }
};

// Register with page transitions for SWUP support
if (window.PageTransitions) {
  window.PageTransitions.registerComponent('maps', initAllMaps);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllMaps);
} else {
  initAllMaps();
}