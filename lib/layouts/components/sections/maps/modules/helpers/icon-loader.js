/**
 * Icon Registry for Maps Component
 * Auto-generated during build - DO NOT EDIT MANUALLY
 * Generated from icons found in maps sections across the site
 */

/**
 * Built-in icon registry with icons used in maps components
 * These SVG paths are extracted from the project's Feather icon library
 */
const iconRegistry = {
  'award': '<circle cx="12" cy="8" r="7"></circle> <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>',
  'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path> <polyline points="9 22 9 12 15 12 15 22"></polyline>',
  'camera': '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path> <circle cx="12" cy="13" r="4"></circle>',
  'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" ></polygon>',
  'map-pin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path> <circle cx="12" cy="10" r="3"></circle>',
  'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" ></path>'
};

/**
 * Get icon SVG content by name
 * @param {string} iconName - Name of the icon
 * @returns {string|null} SVG content or null if not found
 */
export const getIcon = (iconName) => {
  if (!iconName || !iconRegistry[iconName]) {
    if (iconName) {
      console.warn(`Icon "${iconName}" not found in registry. Available icons:`, Object.keys(iconRegistry));
    }
    return null;
  }
  return iconRegistry[iconName];
};

/**
 * Create a custom marker icon SVG with specified icon content
 * @param {string} iconContent - SVG path/element content for the icon
 * @param {Object} options - Icon styling options
 * @returns {string} Complete marker SVG with icon
 */
export const createMarkerIcon = (iconContent, options = {}) => {
  const {
    markerColor = '#ff3333',
    iconColor = '#ffffff',
    markerStroke = '#ffffff',
    markerStrokeWidth = 1,
    size = 48
  } = options;
  
  const height = size * 1.33;
  
  return `<svg width="${size}" height="${height}" viewBox="0 0 ${size} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Marker background (map pin shape) -->
  <path d="M${size/2} ${height-2} C${size/2} ${height-2} ${size*0.15} ${size*0.6} ${size*0.15} ${size*0.4} C${size*0.15} ${size*0.18} ${size*0.3} 2 ${size/2} 2 C${size*0.7} 2 ${size*0.85} ${size*0.18} ${size*0.85} ${size*0.4} C${size*0.85} ${size*0.6} ${size/2} ${height-2} ${size/2} ${height-2} Z" 
        fill="${markerColor}" 
        stroke="${markerStroke}" 
        stroke-width="${markerStrokeWidth}"/>
  <!-- Icon content centered in upper circle -->
  <g transform="translate(${size*0.31}, ${size*0.27}) scale(${size*0.016})" stroke="${iconColor}" fill="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${iconContent}
  </g>
</svg>`;
};
