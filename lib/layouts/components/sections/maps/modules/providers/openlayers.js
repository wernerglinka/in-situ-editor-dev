/**
 * OpenLayers Map Provider
 */

import { loadScript } from '../helpers/load-script.js';
import { loadStylesheet } from '../helpers/load-styles.js';
import { validateMapData, createPopupContent, createMarkerSvg } from '../helpers/maps-utils.js';

/**
 * Initialize OpenLayers library
 * @returns {Promise} Resolves when OpenLayers is loaded
 */
const loadOpenLayers = () => {
  loadStylesheet('https://cdn.jsdelivr.net/npm/ol@v10.3.0/ol.css');
  
  return loadScript(
    'https://cdn.jsdelivr.net/npm/ol@v10.3.0/dist/ol.js',
    'ol'
  );
};

/**
 * Create OpenLayers map instance
 * @param {HTMLElement} mapContainer - Map container element
 * @returns {Object|null} Map instance or null if creation failed
 */
export const createOpenLayersMap = async (mapContainer) => {
  const mapData = validateMapData(mapContainer);
  if (!mapData) {
    return null;
  }

  const { mapId, latitude, longitude, zoom, markers, clustering } = mapData;

  // Load OpenLayers if not already loaded
  await loadOpenLayers();

  // Ensure the container has dimensions before creating the map
  const targetElement = document.getElementById(mapId);
  if (!targetElement) {
    console.error(`Map target element not found: ${mapId}`);
    return null;
  }

  // Check if map is already initialized
  if (targetElement.classList.contains('ol-viewport')) {
    console.warn(`Map already initialized: ${mapId}`);
    return null;
  }

  // Remove loading message
  const loadingElement = targetElement.querySelector('.map-loading');
  if (loadingElement) {
    loadingElement.remove();
  }

  // Create the map
  const map = new ol.Map({
    target: mapId,
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([longitude, latitude]),
      zoom: zoom
    })
  });

  // Force map to update size after initialization
  // This handles cases where container dimensions weren't fully resolved
  setTimeout(() => {
    map.updateSize();
  }, 100);

  // Create marker features
  const markerFeatures = [];
  
  markers.forEach((marker) => {
    const feature = new ol.Feature({
      geometry: new ol.geom.Point(
        ol.proj.fromLonLat([marker.longitude, marker.latitude])
      ),
      title: marker.title,
      content: marker.content,
      iconName: marker.icon // Store icon name for styling
    });
    markerFeatures.push(feature);
  });

  // Create vector source for markers
  const vectorSource = new ol.source.Vector({
    features: markerFeatures
  });

  // Create clustering source if clustering is enabled
  const source = clustering.enabled ? new ol.source.Cluster({
    distance: clustering.radius || 50,
    minDistance: clustering.minClusterSize || 2,
    source: vectorSource
  }) : vectorSource;

  // Style function that handles both individual markers and clusters
  const styleFunction = (feature) => {
    const features = feature.get('features');
    
    // Handle clusters
    if (features && features.length > 1) {
      const count = features.length;
      const clusterStyle = clustering.style || {};
      
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: Math.min(Math.max(count * 2 + 10, 20), 40),
          fill: new ol.style.Fill({
            color: clusterStyle.backgroundColor || '#4285f4'
          }),
          stroke: new ol.style.Stroke({
            color: clusterStyle.borderColor || '#1976d2',
            width: clusterStyle.borderWidth || 2
          })
        }),
        text: new ol.style.Text({
          text: count.toString(),
          fill: new ol.style.Fill({
            color: clusterStyle.textColor || '#ffffff'
          }),
          font: 'bold 12px sans-serif'
        })
      });
    }
    
    // Handle individual markers
    const singleFeature = features ? features[0] : feature;
    const iconName = singleFeature.get('iconName');
    const markerSvg = createMarkerSvg(iconName, { size: 48 });
    
    const svgIcon = new ol.style.Icon({
      anchor: [0.5, 1],
      src: `data:image/svg+xml;charset=utf-8,${  encodeURIComponent(markerSvg)}`,
      scale: 1.0
    });

    return new ol.style.Style({
      image: svgIcon
    });
  };

  const vectorLayer = new ol.layer.Vector({
    source: source,
    style: styleFunction
  });

  map.addLayer(vectorLayer);

  // Create popup overlay
  const popupElement = document.createElement('div');
  popupElement.className = 'ol-popup';
  popupElement.innerHTML = `
    <a href="#" class="ol-popup-closer"></a>
    <div class="ol-popup-content"></div>
  `;
  document.body.appendChild(popupElement);

  const popup = new ol.Overlay({
    element: popupElement,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  map.addOverlay(popup);

  // Close button handler
  const closer = popupElement.querySelector('.ol-popup-closer');
  closer.onclick = function () {
    popup.setPosition(undefined);
    closer.blur();
    return false;
  };

  // Click handler for markers and clusters
  map.on('click', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
      return feature;
    });

    if (feature) {
      const features = feature.get('features');
      const coordinates = feature.getGeometry().getCoordinates();
      
      // Handle cluster clicks - zoom in to expand cluster
      if (features && features.length > 1 && clustering.enabled) {
        const view = map.getView();
        const currentZoom = view.getZoom();
        const maxZoom = clustering.maxZoom || 15;
        
        if (currentZoom < maxZoom) {
          view.animate({
            center: coordinates,
            zoom: Math.min(currentZoom + 2, maxZoom),
            duration: 500
          });
        }
        return;
      }
      
      // Handle individual marker clicks
      const singleFeature = features ? features[0] : feature;
      const content = singleFeature.get('content');
      const contentElement = popupElement.querySelector('.ol-popup-content');
      
      if (content) {
        const popupHTML = createPopupContent(content);
        contentElement.innerHTML = popupHTML;
        popup.setPosition(coordinates);
      }
    } else {
      popup.setPosition(undefined);
    }
  });

  // Change cursor on hover
  map.on('pointermove', (evt) => {
    const pixel = map.getEventPixel(evt.originalEvent);
    const hit = map.hasFeatureAtPixel(pixel);
    const target = map.getTargetElement();
    if (target) {
      target.style.cursor = hit ? 'pointer' : '';
    }
  });

  return {
    element: mapContainer,
    map: map,
    markers: markers.length
  };
};

/**
 * Initialize all OpenLayers maps
 * @returns {Promise<Array>} Array of map instances
 */
export const initOpenLayersMaps = async () => {
  const mapContainers = document.querySelectorAll('.js-openlayers-map');

  // Initialize all maps in parallel
  const mapPromises = Array.from(mapContainers).map(container => createOpenLayersMap(container));
  const results = await Promise.all(mapPromises);

  // Filter out null values (failed initializations)
  return results.filter(instance => instance !== null);
};