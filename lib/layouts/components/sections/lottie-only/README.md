# Lottie-Only Section Component

A dedicated section component for displaying Lottie animations. This component provides a clean, centered layout perfect for animated illustrations, loading states, or any interactive visual content that uses the Lottie animation format.

## Features

- Support for Lottie JSON animations
- Configurable animation controls (autoplay, loop)
- Optional call-to-action buttons
- Responsive animation display
- Consistent with other section components
- Support for background styling and container options

## Usage

```yaml
- sectionType: lottie-only
  containerTag: section
  containerFields:
    inContainer: true
    isAnimated: true
  lottie:
    src: '/assets/animations/hero-animation.json'
    control:
      autoplay: true
      loop: true
  ctas:
    - url: 'https://example.com/learn-more'
      label: 'Learn More'
      isButton: true
      buttonStyle: 'primary'
```

## Required Properties

- `sectionType`: Must be `"lottie-only"`
- `lottie.src`: Path to the Lottie JSON animation file

## Optional Properties

- `lottie.control.autoplay`: Whether animation starts automatically (default: true)
- `lottie.control.loop`: Whether animation loops continuously (default: true)
- `ctas`: Array of call-to-action buttons or links
- `containerFields`: Standard container options (background, margins, padding, etc.)

## Styling

The component uses centered layout with responsive design:

- Animations scale to fit container width while maintaining aspect ratio
- CTAs are centered below the animation with consistent spacing
- Supports both light and dark theme variations

## Files

- `lottie-only.njk` - Nunjucks template
- `manifest.json` - Component configuration and validation
- `README.md` - This documentation

## Dependencies

- `ctas` partial component for call-to-action buttons
- `lottie` partial component for Lottie animation rendering
- `commons` for shared styling utilities