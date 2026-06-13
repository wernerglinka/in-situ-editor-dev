# Unified Maps Section Component

A flexible section component that renders interactive maps using either Leaflet or OpenLayers providers. Supports custom SVG markers, popups, and dynamic library loading with consistent API across both mapping libraries.

## Supported Map Providers

- **leaflet**: Lightweight, mobile-friendly interactive maps
- **openlayers**: Feature-rich mapping library with advanced capabilities

## Data Structure

```yaml
- sectionType: maps
  containerTag: section  # aside, section, or div
  disabled: false
  id: ""
  classes: ""
  containerFields:
    inContainer: true
    isAnimated: true
    noMargin:
      top: false
      bottom: false
    noPadding:
      top: false
      bottom: false
    background:
      color: ""
      image: ""
      imageScreen: "none"  # light, dark, none
  text:
    leadIn: "Find Us"
    title: "Interactive Map"
    titleTag: "h2"
    subTitle: "Our Locations"
    prose: "Explore our locations on the interactive map below."
    isCentered: false
  mapProvider: leaflet    # Required: 'leaflet' or 'openlayers'
  latitude: 40.7128       # Required: Map center latitude
  longitude: -74.0060     # Required: Map center longitude
  zoom: 10                # Optional: Initial zoom level (default: 10)
  markers:                # Optional: Array of map markers
    - latitude: 40.7128
      longitude: -74.0060
      title: "Marker tooltip text"
      content:
        title: "Popup title"
        body: "Popup description"
        link: "https://example.com"  # Optional link
  ctas:
    - url: "/contact"
      label: "Get Directions"
      isButton: true
      buttonStyle: "primary"
```

## Map Provider Properties

### Leaflet Configuration
```yaml
mapProvider: leaflet
latitude: 40.7128
longitude: -74.0060
zoom: 12
markers:
  - latitude: 40.7128
    longitude: -74.0060
    title: "New York City"
    content:
      title: "Big Apple"
      body: "The largest city in the United States"
      link: "https://www.nyc.gov"
```

### OpenLayers Configuration
```yaml
mapProvider: openlayers
latitude: 40.7128
longitude: -74.0060
zoom: 12
markers:
  - latitude: 40.7128
    longitude: -74.0060
    title: "New York City"
    content:
      title: "Big Apple"
      body: "The largest city in the United States"
      link: "https://www.nyc.gov"
```

## HTML Structure

```html
<div class="mapping content">
  
  <!-- Text Container -->
  <div class="text flow">
    <div class="prose flow">
      <p class="lead-in">Find Us</p>
      <h2>Interactive Map</h2>
      <p class="sub-title">Our Locations</p>
      <div class="prose">Explore our locations...</div>
    </div>
  </div>
  
  <!-- Map Container (Leaflet) -->
  <div class="js-leaflet-map" data-provider="leaflet" data-latitude="40.7128" data-longitude="-74.0060" data-zoom="10" data-markers="[...]">
    <div id="map-leaflet-1"></div>
  </div>
  
  <!-- OR Map Container (OpenLayers) -->
  <div class="js-openlayers-map" data-provider="openlayers" data-latitude="40.7128" data-longitude="-74.0060" data-zoom="10" data-markers="[...]">
    <div id="map-openlayers-1"></div>
  </div>
  
  <!-- CTA Container -->
  <div class="ctas-wrapper">
    <a class="cta button primary" href="/contact">Get Directions</a>
  </div>
  
</div>
```

## CSS Architecture

### Map Container Styling
```css
.js-leaflet-map,
.js-openlayers-map {
  width: 100%;
  height: 400px;
  margin-bottom: var(--space-m);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-m);
}
```

### Custom SVG Markers
Both providers use the same SVG marker for consistency:
```css
.custom-div-icon {
  background: transparent !important;
  border: none !important;
}

.custom-div-icon svg {
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}
```

### Responsive Design
```css
@media (max-width: 768px) {
  .js-leaflet-map,
  .js-openlayers-map {
    height: 300px;
  }
}
```

## JavaScript Architecture

### Dynamic Library Loading
- **Leaflet**: Loads from `unpkg.com/leaflet@1.9.4`
- **OpenLayers**: Loads from `cdn.jsdelivr.net/npm/ol@v10.3.0`
- **Integrity Checking**: Disabled for CORS compatibility
- **Global Detection**: Checks for existing library instances

### Provider-Specific Initialization
```javascript
// Leaflet
const leafletMap = new L.map(mapId, {
  center: [latitude, longitude],
  zoom: zoom
});

// OpenLayers
const map = new ol.Map({
  target: mapId,
  view: new ol.View({
    center: ol.proj.fromLonLat([longitude, latitude]),
    zoom: zoom
  })
});
```

### SVG Marker Implementation
```javascript
const svgMarker = `
  <svg width="24" height="32" viewBox="0 0 24 32">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="#ff3333" stroke="#ffffff"/>
  </svg>
`;
```

## Component Dependencies

### Required Partials
- `text`: Renders text content
- `ctas`: Renders call-to-action buttons/links

### External Libraries
- **Leaflet**: Dynamically loaded CSS and JS
- **OpenLayers**: Dynamically loaded CSS and JS

### Manifest Structure
```json
{
  "name": "mapping",
  "version": "1.0.0",
  "description": "Unified mapping component supporting both Leaflet and OpenLayers",
  "type": "section",
  "scripts": ["mapping.js"],
  "styles": ["mapping.css"],
  "dependencies": []
}
```

## Usage Examples

### Simple Leaflet Map
```yaml
- sectionType: maps
  mapProvider: leaflet
  latitude: 40.7128
  longitude: -74.0060
  zoom: 12
  text:
    title: "Visit Our Office"
    prose: "Find us in the heart of New York City"
  markers:
    - latitude: 40.7128
      longitude: -74.0060
      title: "Our Office"
      content:
        title: "Main Office"
        body: "123 Main Street, New York, NY"
```

### OpenLayers with Multiple Markers
```yaml
- sectionType: maps
  mapProvider: openlayers
  latitude: 40.7128
  longitude: -74.0060
  zoom: 10
  text:
    title: "Store Locations"
    prose: "Visit any of our convenient locations"
  markers:
    - latitude: 40.7128
      longitude: -74.0060
      title: "Manhattan Store"
      content:
        title: "Manhattan Location"
        body: "Downtown shopping district"
        link: "/stores/manhattan"
    - latitude: 40.6892
      longitude: -74.0445
      title: "Brooklyn Store"
      content:
        title: "Brooklyn Location"
        body: "Trendy neighborhood spot"
        link: "/stores/brooklyn"
```

### Map with Call-to-Actions
```yaml
- sectionType: maps
  mapProvider: leaflet
  latitude: 40.7128
  longitude: -74.0060
  text:
    title: "Get Directions"
    prose: "Plan your visit to our location"
  markers:
    - latitude: 40.7128
      longitude: -74.0060
      title: "Our Location"
      content:
        title: "Main Office"
        body: "Easy access by subway or car"
  ctas:
    - url: "https://maps.google.com"
      label: "Open in Google Maps"
      isButton: true
      buttonStyle: "primary"
    - url: "/contact"
      label: "Contact Us"
      isButton: false
```

## Provider Differences

### Coordinate Systems
- **Leaflet**: Uses `[latitude, longitude]` order
- **OpenLayers**: Uses `[longitude, latitude]` order (automatically converted)

### Projection Handling
- **Leaflet**: Works with WGS84 coordinates directly
- **OpenLayers**: Converts coordinates using `ol.proj.fromLonLat()`

### Popup Styling
- **Leaflet**: Uses built-in popup system
- **OpenLayers**: Custom overlay implementation with consistent styling

## Performance Considerations

1. **Library Loading**: Only loads required mapping library
2. **CDN Usage**: Libraries served from reliable CDNs
3. **SVG Markers**: Lightweight vector graphics
4. **Lazy Initialization**: Maps initialize on DOM ready
5. **Memory Management**: Proper cleanup and error handling

## Accessibility

- **Keyboard Navigation**: Both libraries support keyboard interaction
- **Screen Readers**: Markers include descriptive titles
- **Focus Management**: Proper focus handling for interactive elements
- **ARIA Labels**: Popups include appropriate ARIA attributes
- **Color Contrast**: High contrast SVG markers

## Browser Support

- **Leaflet**: IE 11+, Chrome 40+, Firefox 38+, Safari 8+
- **OpenLayers**: Chrome 64+, Firefox 69+, Safari 12+
- **SVG Support**: All modern browsers
- **Progressive Enhancement**: Graceful degradation for older browsers

## Customization

### SVG Marker Styling
```javascript
// Modify the svgMarker variable in mapping.js
const svgMarker = `
  <svg width="32" height="40" viewBox="0 0 32 40">
    <path d="..." fill="#your-color" stroke="#your-stroke"/>
  </svg>
`;
```

### Map Height
```css
.js-leaflet-map,
.js-openlayers-map {
  height: 500px; /* Custom height */
}
```

### Custom Classes
```yaml
classes: "large-map featured-location"
```

## Best Practices

1. **Provider Selection**: Choose based on feature requirements
   - **Leaflet**: Simple maps, mobile-first, smaller bundle
   - **OpenLayers**: Advanced features, enterprise applications
2. **Marker Density**: Limit markers for performance (< 100 recommended)
3. **Zoom Levels**: Use appropriate zoom for content context
4. **Popup Content**: Keep popup text concise and actionable
5. **Testing**: Test both providers during development
6. **Fallbacks**: Provide static map image fallback for critical content
7. **Performance**: Monitor library loading times