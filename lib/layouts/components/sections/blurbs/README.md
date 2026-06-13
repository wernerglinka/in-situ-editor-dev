# Blurbs Section

Displays a list of short content items (blurbs) with optional decorations (icons or images), text, and CTAs. Supports two layout modes: inline horizontal list or grid with a featured item.

## Features

- Load blurbs from external JSON data files (`lib/data/blurbs/`)
- Two layout modes: `inline` (horizontal list) or `featurePlus` (grid with featured item)
- Optional icon or image decoration for each blurb
- Reverse layout option to flip alignment
- Optional section header with text and CTAs
- Each blurb supports title, prose, and Feather icons or images

## Data Structure

Blurbs are stored in JSON files referenced by `blurbs.source`. Each blurb object:

```json
{
  "featured": false,
  "decoration": {
    "icon": "feather-icon-name",
    "image": "/path/to/image.jpg",
    "alt": "Description"
  },
  "text": {
    "title": "Title",
    "titleTag": "h3",
    "prose": "Description text"
  }
}
```

## Layout Modes

### Inline Layout
Displays blurbs in a horizontal list. Use `isReverse: true` to reverse the alignment direction.

### FeaturePlus Layout
Displays one featured blurb (marked with `featured: true`) prominently, with remaining blurbs in a grid below. Use `isReverse: true` to swap the featured item's position.

## Configuration

```yaml
- sectionType: blurbs
  text:
    title: "Section Title"
    prose: "Section description"
  blurbs:
    source: "filename-without-extension"
    layout: "inline"  # or "featurePlus"
  isReverse: false
  ctas:
    - text: "Learn More"
      url: "/path"
```
