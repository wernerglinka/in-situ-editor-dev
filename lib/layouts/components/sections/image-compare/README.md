# Image Compare Component

An interactive before/after image comparison component with a draggable handle for visual comparisons.

## Overview

The image-compare component provides an intuitive way to compare two images by dragging a handle to reveal more or less of each image. This is commonly used for showing before/after transformations, product comparisons, or progressive changes.

## Features

- **Draggable Handle**: Smooth drag interaction to control the comparison position
- **Touch Support**: Full touch device compatibility for mobile users
- **Responsive Design**: Adapts to different screen sizes and containers
- **Intersection Observer**: Animates on scroll into view for better performance
- **Resize Observer**: Maintains proper positioning when container resizes
- **Glass Morphism Handle**: Modern visual design with backdrop blur effect

## Usage

```yaml
sectionType: image-compare

# other settings

imageBefore:
  src: /assets/images/before.jpg
  alt: Before renovation
imageAfter:
  src: /assets/images/after.jpg
  alt: After renovation
```

## Configuration Options

### Section Properties

| Property        | Type    | Required | Default | Description               |
| --------------- | ------- | -------- | ------- | ------------------------- |
| `sectionType`   | string  | Yes      | -       | Must be `"image-compare"` |
| `sectionId`     | string  | No       | -       | Unique ID for the section |
| `sectionClass`  | string  | No       | -       | Additional CSS classes    |
| `paddingTop`    | boolean | No       | false   | Add top padding           |
| `paddingBottom` | boolean | No       | false   | Add bottom padding        |
| `marginTop`     | boolean | No       | false   | Add top margin            |
| `marginBottom`  | boolean | No       | false   | Add bottom margin         |
| `background`    | object  | No       | -       | Background configuration  |

### Image Properties

Both `imageBefore` and `imageAfter` accept:

| Property | Type   | Required | Description                        |
| -------- | ------ | -------- | ---------------------------------- |
| `src`    | string | Yes      | Path to the image                  |
| `alt`    | string | Yes      | Alternative text for accessibility |

## JavaScript Behavior

The component auto-initializes on page load. It finds all elements with class `image-comparison-container` and sets up the interactive comparison functionality.

## Styling

The component uses CSS custom properties for easy customization:

```css
.image-compare {
  --handle-size: 2.6rem; /* Size of the draggable handle */
}
```

### CSS Classes

- `image-comparison-container` - Main container
- `is-visible` - Applied when component enters viewport
- `comparison-handle` - The draggable handle
- `is-dragged` - Applied to handle during drag
- `after-image` - Container for the after image
- `resizable` - Applied to after-image during resize
- `image-status` - Label containers
- `is-hidden` - Applied to labels when obscured

## Accessibility

- Images require `alt` text for screen readers
- Handle is keyboard accessible
- Labels provide context for the comparison
- Proper ARIA attributes on interactive elements

## Browser Support

- Modern browsers with IntersectionObserver and ResizeObserver support
- Touch events for mobile devices
- Graceful degradation for older browsers

## Dependencies

- `image` partial - For rendering responsive images
- `icon` partial - For the handle icon
- `commons` - Common utilities and helpers

## Notes

- Images must have the same aspect ratio and size for best results
- The before/after labels are static and always visible
