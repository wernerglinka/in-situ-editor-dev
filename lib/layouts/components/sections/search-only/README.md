# Search-Only Section

Displays a search interface with configurable settings. Uses Fuse.js for fuzzy search across indexed content.

## Features

- Full-text fuzzy search with Fuse.js
- Configurable search behavior (min characters, max results, highlighting)
- Optional title and subtitle
- Relevance score display (optional)
- Result highlighting (optional)
- Searches the site's search index generated at build time

## Configuration

```yaml
- sectionType: search-only
  text:
    title: "Search Components"
    subtitle: "Find components, features, and documentation"
  placeholder: "Search components and documentation..."
  settings:
    maxResults: 20
    showRelevanceScore: true
    enableHighlighting: true
    minCharacters: 2
```

## Settings

- `maxResults` - Maximum number of results to display (default: 20)
- `showRelevanceScore` - Show relevance percentage for each result (default: true)
- `enableHighlighting` - Highlight matching terms in results (default: true)
- `minCharacters` - Minimum characters required to trigger search (default: 2)

## Search Index

The search functionality relies on the site's search index (`search-index.json`) generated automatically by the `metalsmith-search` plugin during build. The index includes page titles, descriptions, and content from all pages except those explicitly ignored.
