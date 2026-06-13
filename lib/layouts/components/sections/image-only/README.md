# Image-Only Section Component

A dedicated section component for displaying images with optional captions and call-to-action buttons. This component provides a clean, centered layout perfect for featured images, galleries, or any visual content that needs emphasis.

## Features

- Responsive image display with automatic sizing
- Optional image captions with semantic styling
- Support for multiple CTA buttons
- Accessibility-focused with required alt text
- Consistent with other section components
- Support for background styling and container options

## Usage

```yaml
- sectionType: image-only
  containerTag: section
  containerFields:
    inContainer: true
    isAnimated: true
  image:
    src: '/assets/images/featured-photo.jpg'
    alt: 'Description of the image for accessibility'
    caption: 'Optional caption providing context or description'
  ctas:
    - url: 'https://example.com/gallery'
      label: 'View Full Gallery'
      isButton: true
      buttonStyle: 'primary'
```

## Required Properties

- `sectionType`: Must be `"image-only"`
- `image.src`: Path to the image file
- `image.alt`: Alternative text for accessibility

## Optional Properties

- `image.caption`: Caption text displayed below the image
- `ctas`: Array of call-to-action buttons or links
- `containerFields`: Standard container options (background, margins, padding, etc.)

## Styling

The component uses centered layout with responsive design:

- Images scale to fit container width while maintaining aspect ratio
- Captions are styled with muted color and italic text
- CTAs are centered below the image with consistent spacing
- Supports both light and dark theme variations

## Files

- `image-only.njk` - Nunjucks template
- `image-only.css` - Component styles
- `manifest.json` - Component configuration and validation
- `README.md` - This documentation

## Dependencies

- `ctas` partial component for call-to-action buttons
- `image` partial component for image rendering
- `commons` for shared styling utilities