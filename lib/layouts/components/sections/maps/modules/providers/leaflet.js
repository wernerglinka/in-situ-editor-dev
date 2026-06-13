/**
 * Leaflet Map Provider
 */

import { loadScript } from '../helpers/load-script.js';
import { loadStylesheet } from '../helpers/load-styles.js';
import { validateMapData, createPopupContent, createMarkerSvg } from '../helpers/maps-utils.js';

/**
 * Initialize Leaflet library
 * @returns {Promise} Resolves when Leaflet is loaded
 */
const loadLeaflet = () => {
  loadStylesheet( 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' );

  return loadScript( 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', 'L' );
};

/**
 * Initialize Leaflet MarkerCluster plugin
 * @returns {Promise} Resolves when plugin is loaded
 */
const loadLeafletCluster = () => {
  loadStylesheet( 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css' );
  loadStylesheet( 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css' );
  
  return loadScript(
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
    'L.markerClusterGroup'
  );
};

/**
 * Create Leaflet map instance
 * @param {HTMLElement} mapContainer - Map container element
 * @returns {Object|null} Map instance or null if creation failed
 */
export const createLeafletMap = async ( mapContainer ) => {
  const mapData = validateMapData( mapContainer );
  if ( !mapData ) {
    return null;
  }

  const { mapId, latitude, longitude, zoom, markers, clustering } = mapData;

  // Load Leaflet if not already loaded
  await loadLeaflet();

  // Load clustering plugin if clustering is enabled
  if (clustering.enabled) {
    await loadLeafletCluster();
  }

  // Remove loading message
  const targetElement = document.getElementById(mapId);
  const loadingElement = targetElement?.querySelector('.map-loading');
  if (loadingElement) {
    loadingElement.remove();
  }

  // Create the map
  const leafletMap = new L.map( mapId, {
    center: [ latitude, longitude ],
    zoom: zoom
  } );

  // Add tile layer
  const layer = new L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  } );
  leafletMap.addLayer( layer );

  // Create marker cluster group if clustering is enabled
  const markerGroup = clustering.enabled ? L.markerClusterGroup({
    maxClusterRadius: clustering.radius || 50,
    disableClusteringAtZoom: clustering.maxZoom || 15,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  }) : null;

  // Add markers
  markers.forEach( ( marker ) => {
    const markerContent = createPopupContent( marker.content );

    // Create custom icon for this marker (standardized size to match OpenLayers)
    const markerSvg = createMarkerSvg( marker.icon, { size: 48 } );

    const customIcon = L.divIcon( {
      html: markerSvg,
      className: 'custom-div-icon',
      iconSize: [ 48, 64 ],
      iconAnchor: [ 24, 62 ],
      popupAnchor: [ 0, -62 ]
    } );

    const leafletMarker = L.marker( [ marker.latitude, marker.longitude ], {
      icon: customIcon,
      title: marker.title
    } ).bindPopup( markerContent );

    // Add to cluster group or directly to map
    if (markerGroup) {
      markerGroup.addLayer( leafletMarker );
    } else {
      leafletMarker.addTo( leafletMap );
    }
  } );

  // Add cluster group to map if clustering is enabled
  if (markerGroup) {
    leafletMap.addLayer( markerGroup );
  }

  return {
    element: mapContainer,
    map: leafletMap,
    markers: markers.length
  };
};

/**
 * Initialize all Leaflet maps
 * @returns {Promise<Array>} Array of map instances
 */
export const initLeafletMaps = async () => {
  const mapContainers = document.querySelectorAll( '.js-leaflet-map' );

  // Initialize all maps in parallel
  const mapPromises = Array.from( mapContainers ).map( container => createLeafletMap( container ) );
  const results = await Promise.all( mapPromises );

  // Filter out null values (failed initializations)
  return results.filter( instance => instance !== null );
};