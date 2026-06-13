# Multi-Tab Section Component

A dynamic tabbed interface where each pane can be any section type — rich-text, image-only, media, or anything else in the component library. Tabs and their pane configurations are declared explicitly in page frontmatter. The component delegates pane rendering entirely to the `renderSection` macro, so it has no knowledge of what it is displaying inside each panel.

This differs from the `tabs` component, which scans a data directory and always renders image-grid panels. Use `multi-tab` when you need different section types per pane, or when you want explicit control over which data each pane displays.

## Features

- **Any Section Type as a Pane**: Each tab can render a different component (rich-text, image-only, media, etc.)
- **Explicit Frontmatter Config**: Tabs and panes are fully declared in frontmatter — no directory scanning
- **Accessible Tab Pattern**: Full ARIA `tablist`/`tab`/`tabpanel` roles
- **Keyboard Navigation**: Arrow keys, Home, and End move between tabs
- **Decoupled Panel Init**: Dispatches a `tab:revealed` CustomEvent when a panel becomes visible — components subscribe independently
- **SWUP Support**: Registers with PageTransitions for page transition cleanup
- **Configurable Default Tab**: Set which tab is active on page load, with auto-fallback to current year or first tab

## Frontmatter Schema

```yaml
- sectionType: multi-tab
  containerTag: section
  classes: ''
  id: ''
  isDisabled: false
  isAnimated: true
  containerFields:
    inContainer: true
    noMargin:
      top: true
      bottom: true
    noPadding:
      top: false
      bottom: false
    background:
      color: ''
      image: ''
      imageScreen: 'none'
  text:
    title: 'Section Title'
    titleTag: 'h2'
  defaultTab: 'first'
  tabs:
    - key: 'first'
      label: 'First Tab'
      pane:
        sectionType: rich-text
        text:
          title: 'First Pane'
          prose: 'Content for the first pane.'
    - key: 'second'
      label: 'Second Tab'
      pane:
        sectionType: rich-text
        text:
          title: 'Second Pane'
          prose: 'Content for the second pane.'
```

### Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `defaultTab` | string | Key of the tab active on page load. Omit to auto-select current year, or falls back to first tab |
| `tabs` | array | Array of tab definitions (see below) |
| `tabs[].key` | string | Unique identifier. Used for ARIA ids and default-tab matching |
| `tabs[].label` | string | Display label for the tab button. Defaults to `key` if omitted |
| `tabs[].pane` | object | A complete section definition — any valid `sectionType` and its properties |

### Default Tab Resolution

1. If `defaultTab` is set and that key exists in the tabs array → use it
2. Otherwise if the current year (as a string, e.g. `"2026"`) matches a tab key → use that
3. Otherwise → use the first tab key

## Pane Configuration

Each `pane` is a standard section definition, identical to what you would write as a top-level section. Any component that works standalone works as a pane.

## HTML Structure

```html
<div class="container content">
  <div class="text flow">
    <h2>Section Title</h2>
  </div>

  <div class="tabs-component" data-default-tab="first">
    <div class="tabs-nav" role="tablist" aria-label="Section Title">
      <button class="tabs-button" role="tab" id="tab-first"
              aria-controls="panel-first" aria-selected="true" tabindex="0">
        First Tab
      </button>
      <button class="tabs-button" role="tab" id="tab-second"
              aria-controls="panel-second" aria-selected="false" tabindex="-1">
        Second Tab
      </button>
    </div>

    <div class="tabs-panel" role="tabpanel" id="panel-first" aria-labelledby="tab-first">
      <!-- rich-text component output -->
    </div>
    <div class="tabs-panel" role="tabpanel" id="panel-second" aria-labelledby="tab-second" hidden>
      <!-- rich-text component output -->
    </div>
  </div>
</div>
```

## JavaScript Behavior

### Tab Switching

Clicking a tab or pressing arrow keys:

1. Deactivates all tabs (`aria-selected="false"`, `tabindex="-1"`)
2. Hides all panels (sets `hidden` attribute)
3. Activates the selected tab and reveals its panel
4. Moves focus to the activated tab
5. Dispatches `tab:revealed` on the revealed panel element

### Panel Reinitialization via `tab:revealed`

When a panel becomes visible, `multi-tab.js` dispatches:

```javascript
panel.dispatchEvent(new CustomEvent('tab:revealed', { bubbles: true }));
```

Components that need reinitialization when revealed listen for this event independently. This keeps multi-tab fully decoupled from any specific component type.

### Keyboard Navigation

| Key | Action |
|-----|--------|
| ArrowRight | Next tab |
| ArrowLeft | Previous tab |
| Home | First tab |
| End | Last tab |

Navigation wraps (last → first, first → last).

### URL Hash Navigation

Tab selection is reflected in the URL as `#tab-{key}`. Clicking a tab pushes a history entry; the `popstate` handler restores the correct tab on browser back/forward.

## Bundler Considerations

The `manifest.json` declares `requires: ["text", "commons"]` for the component's own template needs. Pane component dependencies (the CSS/JS for each `tab.pane.sectionType`) are discovered automatically by the bundler because each pane's `sectionType` appears directly in page frontmatter — no explicit listing needed.

## Metalsmith Context Note

This component calls `renderSection` for each pane, which requires a full context object. The `paneContext` object in `multi-tab.njk` explicitly assembles `{data, collections, urlPath, collection, crumbs}` from the variables available in the template scope. If a new variable is added to `render-section.njk`, it must also be added to `paneContext` here.
