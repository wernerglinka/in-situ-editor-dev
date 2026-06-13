# Manual Card Component

A versatile card partial component that can be manually configured with custom content combinations. Unlike the collection-card which automatically displays collection items, the manual-card allows for complete control over card content and styling.

## Features

- **Flexible Content**: Supports any combination of image, text, and CTAs
- **Optional Link Wrapper**: Make the entire card clickable
- **Custom Styling**: Apply custom CSS classes for unique designs
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Proper ARIA attributes and semantic HTML

## Usage

### In Templates

```njk
{% from "components/_partials/manual-card/manual-card.njk" import manualCard %}

{{ manualCard({
  image: {
    src: '/assets/images/feature.jpg',
    alt: 'Feature description'
  },
  text: {
    title: 'Feature Title',
    prose: 'Description of the feature.'
  },
  ctas: [{
    url: '/learn-more',
    label: 'Learn More'
  }]
}) }}
```

### In Sections

The manual-card can be used within section components that need to display card-based layouts.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `image` | object | No | Image configuration object |
| `text` | object | No | Text content object with title and prose |
| `ctas` | array | No | Array of CTA button objects |
| `link` | string | No | URL to make entire card clickable |
| `classes` | string | No | Additional CSS classes |

## Examples

See `manual-card.yml` for configuration examples.

## Styling

The component uses the following CSS classes:
- `.manual-card`: Main container
- Additional classes can be passed via the `classes` property

## Dependencies

This component requires:
- `text` partial for text rendering
- `ctas` partial for call-to-action buttons
- `image` partial for image handling