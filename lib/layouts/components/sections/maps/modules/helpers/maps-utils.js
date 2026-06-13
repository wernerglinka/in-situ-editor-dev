/**
 * Mapping Component Utilities
 */

import { getIcon, createMarkerIcon } from './icon-loader.js';

/**
 * Create default SVG marker with specified size using same shape as custom icon markers
 * @param {Object} options - Styling options for the marker
 * @returns {string} SVG string for the default marker
 */
const createDefaultMarker = (options = {}) => {
  const {
    markerColor = '#ff3333',
    markerStroke = '#ffffff',
    markerStrokeWidth = 1,
    size = 48
  } = options;
  
  const height = size * 1.33;
  
  return `<svg width="${size}" height="${height}" viewBox="0 0 ${size} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Marker background (map pin shape) - same shape as custom icon markers -->
  <path d="M${size/2} ${height-2} C${size/2} ${height-2} ${size*0.15} ${size*0.6} ${size*0.15} ${size*0.4} C${size*0.15} ${size*0.18} ${size*0.3} 2 ${size/2} 2 C${size*0.7} 2 ${size*0.85} ${size*0.18} ${size*0.85} ${size*0.4} C${size*0.85} ${size*0.6} ${size/2} ${height-2} ${size/2} ${height-2} Z" 
        fill="${markerColor}" 
        stroke="${markerStroke}" 
        stroke-width="${markerStrokeWidth}"/>
  <!-- Default dot in center where icon would be -->
  <circle cx="${size/2}" cy="${size*0.4}" r="${size*0.1}" fill="${markerStroke}" />
</svg>`;
};

/**
 * Default SVG marker (fallback when no icon is specified) - maintained for compatibility
 */
export const svgMarker = createDefaultMarker({ size: 24 });

/**
 * Create marker SVG with custom icon or default marker
 * @param {string|null} iconName - Name of the icon from the registry
 * @param {Object} options - Styling options for the marker
 * @returns {string} SVG string for the marker
 */
export const createMarkerSvg = (iconName, options = {}) => {
  // If no icon name provided, return size-aware default marker
  if (!iconName) {
    return createDefaultMarker(options);
  }

  // Get icon content from registry
  const iconContent = getIcon(iconName);

  // If icon not found, return size-aware default marker
  if (!iconContent) {
    console.warn(`Icon "${iconName}" not found in registry, falling back to default marker`);
    return createDefaultMarker(options);
  }

  // Create custom marker with icon
  return createMarkerIcon(iconContent, options);
};

/**
 * Validate map container data
 * @param {HTMLElement} mapContainer - Map container element
 * @returns {Object|null} Validated map data or null if invalid
 */
export const validateMapData = (mapContainer) => {
  const mapId = mapContainer.querySelector('div')?.getAttribute('id');
  const latitude = parseFloat(mapContainer.dataset.latitude);
  const longitude = parseFloat(mapContainer.dataset.longitude);
  const zoom = parseInt(mapContainer.dataset.zoom) || 10;
  const markers = JSON.parse(mapContainer.dataset.markers || '[]');
  const clustering = JSON.parse(mapContainer.dataset.clustering || '{}');

  if (!mapId || isNaN(latitude) || isNaN(longitude)) {
    console.warn('Map missing required data attributes');
    return null;
  }

  return { mapId, latitude, longitude, zoom, markers, clustering };
};

/**
 * Create popup content HTML
 * @param {Object} content - Content object with title, body, and optional link
 * @returns {string} HTML string for popup content
 */
export const createPopupContent = (content) => {
  let popupHTML = `<h4>${content.title}</h4><p>${content.body}</p>`;
  if (content.link) {
    popupHTML += `<a href="${content.link}" target="_blank" rel="noopener noreferrer">Read more</a>`;
  }
  return popupHTML;
};