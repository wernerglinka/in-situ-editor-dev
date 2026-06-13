# Search Partial Component

A comprehensive search partial that provides fuzzy search functionality across your Metalsmith site content using Fuse.js and the metalsmith-search plugin.

**Note**: This is a **partial component** typically used within the `search-only` section component, but can also be integrated directly into custom sections or page templates (like the header search implementation).

## Features

- **Fuzzy Search**: Powered by Fuse.js for intelligent search matching
- **Component-Aware**: Understands your site's component-based architecture
- **Multi-Level Search**: Search both page-level and section-level content
- **Real-time Results**: Instant search with debounced input
- **Filtering**: Filter by content type and component type
- **Keyboard Shortcuts**: Ctrl/Cmd+K to focus search, Escape to clear
- **Match Highlighting**: Visually highlights matching terms in results
- **Accessibility**: Full ARIA support and screen reader compatibility
- **Responsive**: Works seamlessly across all device sizes

## Prerequisites

1. **metalsmith-search plugin** must be installed and configured in your Metalsmith build
2. **Fuse.js** is loaded from CDN automatically when the search component is used
3. The plugin must generate a `/search-index.json` file during build

## Basic Usage

### Within Section Component

Add to any page's frontmatter sections array using the `search-only` section:

```yaml
sections:
  - sectionType: search-only
    text:
      title: "Search Components"
      placeholder: "Search components and documentation..."
    settings:
      maxResults: 20
```

### Direct Template Usage

Import and use the partial directly in templates:

```liquid
{% from "components/_partials/search/search.njk" import search %}

{{ search({
  title: "Search",
  placeholder: "Search...",
  settings: {
    maxResults: 20,
    minCharacters: 2
  }
}) }}
```

## Configuration Options

### Text Content

```yaml
text:
  title: "Search Components"           # Main heading (optional)
  subtitle: "Find what you need"       # Subtitle text (optional)  
  placeholder: "Search..."             # Input placeholder (default: "Search...")
```

### Settings

```yaml
settings:
  showCategories: true                 # Show filter dropdowns (default: false)
  maxResults: 20                       # Maximum results to display (default: 20)
  resultTypes: ['page', 'section']     # Content types to search (default: ['page', 'section'])
  showRelevanceScore: true             # Show relevance percentage (default: true)
  enableHighlighting: true             # Highlight matching terms (default: true)
  minCharacters: 2                     # Minimum characters to trigger search (default: 2)
```

## Examples

### Basic Search (via section)

```yaml
sectionType: search-only
text:
  placeholder: "Search components..."
```

### Advanced Search with Filters (via section)

```yaml
sectionType: search-only
text:
  title: "Find Components"
  subtitle: "Search through all component documentation and examples"
  placeholder: "Search components, guides, examples..."
settings:
  maxResults: 15
  enableHighlighting: true
  showRelevanceScore: true
```

### Minimal Search Bar (via section)

```yaml
sectionType: search-only
# Uses all defaults - just a simple search input
```

### Custom Header Integration (direct partial usage)

```liquid
{% from "components/_partials/search/search.njk" import search %}

<div class="header-search-overlay">
  <form class="header-search-form" action="/search/" method="get">
    {{ search({
      placeholder: "Search...",
      id: "header-search"
    }) }}
  </form>
</div>
```

## Search Functionality

### Two-Layer Search Architecture

This component implements a sophisticated two-step search process for optimal user experience:

#### Layer 1: Fuzzy Discovery (Algorithm Layer)
- **Fuzzy Matching**: Uses Fuse.js to find potential matches with typo tolerance
- **Weighted Results**: Titles and headings weighted higher than body content
- **Multi-field Search**: Searches across titles, content, tags, and metadata
- **Broad Discovery**: Casts a wide net to find all potentially relevant content

#### Layer 2: User Experience Filtering (UX Layer)
- **Exact Substring Verification**: Only shows results where the search term actually appears in the content
- **Meaningful Match Filtering**: Prevents confusing partial matches (e.g., "dors" won't match "doors")
- **Relevance Threshold**: Applies minimum relevance scores for quality results
- **User-Focused Results**: Ensures users see content that genuinely contains their search terms

### Content Types Searched

The search component can find content in:

- **Pages**: Complete page content and metadata
- **Sections**: Individual component sections within pages
- **Component Types**: Specific types like hero, rich-text, media-image, etc.

### Search Behavior Examples

✅ **Valid Matches**:
- "hero" → finds "Hero Section", "hero banner"
- "tion" → finds "information", "navigation" (valid word endings)
- "contact" → finds "Contact Us", "contact form"

❌ **Filtered Out**:
- "dors" → won't match "doors" (meaningless partial match)
- "xyz" → won't match anything (nonsense term)
- Low relevance fuzzy matches that don't contain the actual search term

### Real-time Features
- **Debounced Input**: 300ms delay prevents excessive searching while typing
- **Progressive Results**: Results update instantly as you type

### Filtering Options

When `showCategories: true`:

- **Content Type Filter**: Filter by "Pages" or "Sections"
- **Component Type Filter**: Filter by specific component types (hero, rich-text, etc.)

### Keyboard Shortcuts

- **Ctrl/Cmd + K**: Focus the search input from anywhere on the page
- **Escape**: Clear search and results when search input is focused

## Technical Details

### Dependencies

- **Fuse.js 7.0.0+**: Loaded from jsdelivr CDN
- **metalsmith-search plugin**: Must be configured in your Metalsmith build
- **Modern browser**: ES6+ support required for full functionality

### Performance

- Search index loads asynchronously after page load
- Input is debounced (300ms) to prevent excessive API calls
- Results are limited to prevent DOM performance issues
- CSS animations use GPU acceleration where possible

### Accessibility

- Full ARIA labeling for screen readers
- Keyboard navigation support
- Focus management for optimal UX
- Live regions announce result changes
- High contrast mode support

### Browser Support

- **Modern Browsers**: Full functionality (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- **Legacy Browsers**: Graceful degradation (basic functionality may work)

## Styling

The component uses CSS custom properties (CSS variables) from your design tokens:

- `--color-primary`: Primary brand color for highlights and focus states
- `--color-text-primary/secondary/tertiary`: Text color hierarchy
- `--color-background/background-secondary`: Background colors
- `--color-border`: Border colors
- `--space-*`: Spacing scale
- `--font-size-*`: Typography scale
- `--border-radius*`: Border radius scale

### Customization

Override specific styles by adding CSS after the component styles:

```css
.search-section .search-input {
  border: 3px solid var(--custom-color);
}

.search-result {
  background: var(--custom-background);
}
```

## Integration with metalsmith-search

This component is designed to work with the metalsmith-search plugin. Ensure your Metalsmith configuration includes:

```javascript
import search from 'metalsmith-search';

// In your Metalsmith build pipeline
.use(search({
  indexPath: 'search-index.json',
  indexLevels: ['page', 'section'],
  generateAnchors: true,
  sectionTypes: ['hero', 'rich-text', 'media-image', 'cta', 'banner', 'slider', 'flip-cards', 'logos-list', 'testimonial', 'columns', 'blog-list', 'maps']
}))
```

## Search Quality Testing

This search component works in conjunction with the **Universal Search Tester** for quality assurance:

### Testing Architecture
- **Universal Search Tester**: Tests the raw search algorithm and index quality (build-time)
- **This Component**: Applies user experience filtering on top of the raw results (runtime)

### Quality Workflow
```bash
# 1. Build your site and search index
npm run build

# 2. Test raw search algorithm quality
node universal-search-tester/search-tester.js build/search-index.json

# 3. This component automatically applies UX filtering for end users
```

### Optimization Process
1. **Algorithm Layer**: Use Universal Search Tester to optimize search index and algorithm
2. **UX Layer**: This component handles user experience filtering automatically
3. **Iterative Improvement**: Test → Optimize → Validate → Deploy

The Universal Search Tester validates that content **can be found**, while this component ensures only meaningful results **should be shown** to users.

## Troubleshooting

### Search Not Working

1. **Check search index**: Verify `/search-index.json` exists and contains data
2. **Check console**: Look for JavaScript errors in browser dev tools
3. **Verify plugin**: Ensure metalsmith-search plugin is configured correctly
4. **Check CDN**: Ensure Fuse.js can load from jsdelivr CDN

### No Results Found

1. **Check index content**: Verify your content is being indexed properly
2. **Adjust threshold**: The search may be too strict - check Fuse.js threshold settings
3. **Clear filters**: Make sure category filters aren't excluding your content

### Performance Issues

1. **Reduce maxResults**: Lower the maximum number of displayed results
2. **Check content size**: Very large search indexes may impact performance
3. **Browser support**: Older browsers may struggle with large result sets

## SEO Considerations

- Search functionality is client-side only and doesn't affect SEO
- Search interface HTML is crawlable by search engines
- No duplicate content issues
- May improve user engagement metrics

## Future Enhancements

Potential improvements for future versions:

- Search suggestions and autocomplete
- Recent searches history
- Search analytics and reporting
- Advanced query syntax support
- Search result categorization
- Export search results functionality