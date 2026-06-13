# Page Transitions

Smooth page transitions using SWUP. This partial intercepts internal link clicks, fetches pages via AJAX, and swaps content with a fade animation.

## Dependencies

This component requires npm packages that are not bundled:

```bash
npm install swup @swup/head-plugin @swup/scroll-plugin @swup/preload-plugin
```

## Usage

### 1. Set Up the Entry Point

Initialize the PageTransitions registry at the very top of your bundler entry point (e.g., `main.js`). This ensures the registry exists before any component scripts run:

```javascript
/**
 * Initialize PageTransitions registry at the very top of the entry point.
 * This ensures it exists before any component scripts try to register.
 */
if (!window.PageTransitions) {
  const componentRegistry = new Map();
  const cleanupRegistry = new Map();

  window.PageTransitions = {
    registerComponent: (name, initFn) => componentRegistry.set(name, initFn),
    registerCleanup: (name, cleanupFn) => cleanupRegistry.set(name, cleanupFn),
    _componentRegistry: componentRegistry,
    _cleanupRegistry: cleanupRegistry
  };
}

// Rest of your main.js code...
```

### 2. Include the Partial

Add the partial to your base layout:

```nunjucks
{% include "components/_partials/page-transitions/page-transitions.njk" %}
```

### 3. Set Up the SWUP Container

Your layout needs a main element with the SWUP container:

```html
<main class="transition-fade" id="swup">
  <!-- Page content that gets swapped -->
</main>
```

Content inside `#swup` is replaced during transitions. Content outside (header, footer) persists.

## Multiple Layouts

Sites with multiple layouts (e.g., default and sidebar) need the `with-sidebar` class on the body element for layout detection:

```html
<!-- default.njk -->
<body class="{{ bodyClasses }}">
  <main class="transition-fade" id="swup">...</main>
</body>

<!-- with-sidebar.njk -->
<body class="with-sidebar {{ bodyClasses }}">
  <aside class="sidebar">...</aside>
  <main class="transition-fade" id="swup">...</main>
</body>
```

The page-transitions module automatically detects layout changes and forces a full page reload when transitioning between different layouts. This ensures:
- **Same layout**: Smooth SWUP animations
- **Different layouts**: Current page fades out, then full reload brings in the new layout

## Component Registration

Components inside the SWUP container that require JavaScript must register with the PageTransitions system to re-initialize after each page swap:

```javascript
function initMyComponent() {
  const elements = document.querySelectorAll('.my-component');

  elements.forEach((element) => {
    // Skip if already initialized (prevents duplicate listeners)
    if (element.dataset.initialized) return;
    element.dataset.initialized = 'true';

    setupElement(element);
  });
}

// Register for SWUP re-initialization
if (window.PageTransitions) {
  window.PageTransitions.registerComponent('my-component', initMyComponent);
}

// Initial page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMyComponent);
} else {
  initMyComponent();
}
```

Components that create persistent state (intervals, observers) should also register a cleanup function:

```javascript
if (window.PageTransitions) {
  window.PageTransitions.registerComponent('my-component', initMyComponent);
  window.PageTransitions.registerCleanup('my-component', cleanupMyComponent);
}
```

## Without SWUP

All components in this library work without SWUP. The `window.PageTransitions` check ensures the registration code is skipped when SWUP is not present. Components initialize normally via `DOMContentLoaded`.

## Customization

### Transition Duration

Edit `page-transitions.css` to change the fade duration:

```css
main.transition-fade {
  transition: opacity 0.3s ease-in-out; /* Change 0.3s */
}
```

### Progress Bar

The CSS includes an optional progress bar. Add this element to your layout to display it:

```html
<div class="swup-progress-bar"></div>
```

## Resources

- [SWUP Documentation](https://swup.js.org/)
- [SWUP Hooks API](https://swup.js.org/hooks/)
- [SWUP Plugins](https://swup.js.org/plugins/)
