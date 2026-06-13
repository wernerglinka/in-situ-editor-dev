# Hero Slider Component

The hero slider component provides a sophisticated and performant solution for creating engaging hero sections with multiple slides, smooth transitions, and rich media backgrounds. This component transforms the traditional static hero section into a dynamic storytelling platform that captures visitor attention while maintaining excellent performance through intelligent resource management and optimized animations. Each slide can contain a unique combination of text content, call-to-action buttons, images, and background media, allowing for diverse visual narratives within a single hero section. The component implements a robust navigation system with both manual controls and optional autoplay functionality, giving users control over their viewing experience while ensuring accessibility and usability across all devices.

## Features

- **Multiple Slides**: Support for unlimited slides with individual configurations
- **Rich Content**: Each slide supports text, CTAs, images, and background media
- **Background Options**: Solid colors, images, or videos as slide backgrounds
- **Screen Overlays**: Optional dark or light overlays for better text readability
- **Autoplay**: Configurable automatic slide progression with pause on hover
- **Smooth Transitions**: Hardware-accelerated CSS transitions for optimal performance
- **Responsive Design**: Adapts to all screen sizes with mobile-specific optimizations
- **Navigation Controls**: Bottom navigation bar with labeled slide indicators
- **Layout Flexibility**: Support for reversed layouts and half/full-width content
- **Dark Mode Support**: Automatic text color adjustments for dark backgrounds
- **Video Integration**: Background video support with automatic playback control

## Usage

Include the hero slider in your page sections:

```yaml
sections:
  - sectionType: hero-slider
    autoplay: true
    autoPlayDelay: 5000
    slides:
      - navLabel: 'Welcome'
        text:
          title: 'Welcome to Our Site'
          prose: 'Engaging content that captures attention'
        ctas:
          - url: '/get-started'
            label: 'Get Started'
            isButton: true
        background:
          image:
            src: '/assets/images/hero-bg.jpg'
```

## Configuration

### Component Properties

- `autoplay` (boolean): Enable automatic slide progression
- `autoPlayDelay` (number): Milliseconds between slide transitions (default: 5000)
- `slides` (array): Array of slide configurations

### Slide Properties

Each slide in the `slides` array supports:

- `navLabel` (string): Text displayed in navigation for this slide
- `isReverse` (boolean): Reverse the layout direction (image/text order)
- `text` (object): Text content configuration
  - `leadIn` (string): Small text above the title
  - `title` (string): Main heading text
  - `titleTag` (string): HTML tag for title (h1-h6)
  - `subTitle` (string): Secondary heading
  - `prose` (string): Body text content
  - `isCentered` (boolean): Center-align text content
- `ctas` (array): Call-to-action buttons
- `image` (object): Main content image
  - `src` (string): Image path
  - `alt` (string): Alt text for accessibility
- `background` (object): Slide background configuration
  - `color` (string): CSS color value
  - `isDark` (boolean): Use dark theme for text
  - `image` (object): Background image configuration
  - `video` (object): Background video configuration
  - `imageScreen` (string): Screen overlay type: 'dark', 'light', or 'none'

## Examples

### Basic Text Slider

```yaml
- sectionType: hero-slider
  slides:
    - navLabel: 'Intro'
      text:
        title: 'Welcome'
        prose: 'Introduction text'
    - navLabel: 'Features'
      text:
        title: 'Our Features'
        prose: 'Feature description'
```

### Slider with Background Images

```yaml
- sectionType: hero-slider
  autoplay: true
  slides:
    - navLabel: 'Home'
      text:
        title: 'Beautiful Backgrounds'
      background:
        image:
          src: '/assets/images/bg1.jpg'
        imageScreen: 'dark'
```

### Mixed Media Slider

```yaml
- sectionType: hero-slider
  slides:
    - navLabel: 'Video'
      text:
        title: 'Video Background'
      background:
        video:
          src: 'youtube'
          id: 'VIDEO_ID'
    - navLabel: 'Image'
      text:
        title: 'Image Background'
      background:
        image:
          src: '/assets/images/bg.jpg'
```

### Slider with Content Images

```yaml
- sectionType: hero-slider
  slides:
    - navLabel: 'Product'
      isReverse: false
      text:
        title: 'Our Product'
        prose: 'Product description'
      image:
        src: '/assets/images/product.jpg'
        alt: 'Product showcase'
      ctas:
        - url: '/buy-now'
          label: 'Buy Now'
          isButton: true
```

## Styling

The component uses CSS custom properties for easy customization:

```css
.hero-slider {
  /* Fluid height: 680px at 1240px viewport, 480px at 500px viewport */
  --slider-height: clamp(480px, calc(480px + (680 - 480) * ((100vw - 500px) / (1240 - 500))), 680px);
  --slider-nav-height: 80px;
  --slider-nav-color: var(--color-text-light);
  --slider-nav-background-color: var(--glass-background-dark);
  --slider-nav-item-width: 120px;
  --slider-nav-item-hover-color: var(--glass-background);
  --slider-nav-item-is-selected-color: var(--color-text-highlight);
  --slider-nav-item-is-selected-background-color: var(--glass-background-light);
}
```

## JavaScript API

The component automatically initializes all hero sliders on the page. Each instance provides:

```javascript
// The component auto-initializes, but you can access instances:
const slider = document.querySelector('.js-hero-slider');

// Methods available via the component's internal API:
// - goToSlide(index): Navigate to specific slide
// - nextSlide(): Advance to next slide
// - destroy(): Clean up the slider instance
```

## Animations

The slider implements a sophisticated animation system:

1. **Slide Transitions**: Slides use `translateX` for smooth horizontal movement
2. **Content Animations**: Text and CTAs fade and slide in sequentially
3. **Staggered Timing**: Elements animate with delays for visual hierarchy
4. **Performance**: Uses `will-change` and hardware acceleration

## Accessibility

- Semantic HTML structure with proper heading hierarchy
- ARIA labels on navigation elements
- Keyboard navigation support
- Pause autoplay on user interaction
- High contrast mode support with screen overlays

## Mobile Behavior

On mobile devices (< 768px):
- Content images are hidden to focus on text
- Navigation tabs become dots for space efficiency
- Fluid height scaling for better mobile experience
- Touch-friendly navigation controls
- Text truncation with ellipsis on very small screens (< 500px)

## Performance Considerations

- Hardware-accelerated CSS transforms
- Lazy loading of slide content
- Efficient event delegation
- Automatic cleanup of transitions
- Video playback management (pause hidden videos)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- CSS Custom Properties support required
- Intersection Observer API for optimal performance

## Dependencies

This component requires:
- `ctas` partial for call-to-action buttons
- `text` partial for text content
- `image` partial for images
- `video` partial for video backgrounds

## Best Practices

1. **Slide Count**: Keep to 3-5 slides for optimal user experience
2. **Navigation Labels**: Use short, descriptive labels (1-2 words)
3. **Image Optimization**: Use appropriately sized images for backgrounds
4. **Text Contrast**: Use screen overlays when text overlays images
5. **Autoplay Timing**: 5-7 seconds per slide is recommended
6. **Mobile Images**: Consider hiding decorative images on mobile
7. **Video Backgrounds**: Provide fallback images for video backgrounds