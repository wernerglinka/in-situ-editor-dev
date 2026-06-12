# Logos List Section Component

A dynamic marquee-style component for displaying collections of logos, client marks, partner organizations, or social media links. Features intelligent scrolling behavior, fade effects, and responsive design that automatically adapts to screen size and content width.

## Features

- **Intelligent Auto-Scroll**: Automatically scrolls only when content exceeds viewport width
- **Smooth Marquee Animation**: CSS-based marquee with configurable speed and direction
- **Fade Edge Effects**: Gradient masks create smooth fade-in/fade-out at edges during scrolling
- **Data Source Integration**: Connects to JSON data files for logo collections
- **Flexible Selection**: Display all logos or filter specific selections by title
- **Responsive Behavior**: Uses ResizeObserver for dynamic layout adjustments
- **Reverse Animation**: Optional reverse scrolling direction
- **Hover Pause**: Scrolling pauses on hover for better user interaction
- **Configurable Dimensions**: Customizable logo width and container sizing
- **Interactive States**: Hover effects for logos with smooth transitions

## Data Structure

```yaml
- sectionType: logos-list
  containerTag: aside  # aside, section, or div
  disabled: false
  id: "logosList"
  classes: ""
  isReverse: false     # Enables reverse scrolling direction
  containerFields:
    inContainer: false
    isAnimated: true
    noMargin:
      top: true
      bottom: false
    noPadding:
      top: true
      bottom: false
    background:
      color: ""
      image: ""
      imageScreen: "none"
  logos:
    source: "artMuseums"    # Name of JSON data file (without extension)
    logoWidth: 200          # Width in pixels for each logo
    scope: "all"            # "all" or "selections"
    selections: []          # Array of titles when scope is "selections"

# Alternative with selections
- sectionType: logos-list
  logos:
    source: "socialLinks"
    logoWidth: 90
    scope: "selections"
    selections:
      - "LinkedIn"
      - "GitHub"
      - "Twitter"
```

## HTML Structure

```html
<div class="container logo-list content">
  <div class="marquee" style="--list-width: 1400px">
    <div class="mask">
      <div class="logos-wrapper">
        
        <!-- First Copy of Logo List -->
        <ul class="logos js-logos-list">
          <li style="width: 200px;">
            <a href="https://example.com/">
              <img src="/assets/images/logo1.svg" alt="Company Logo">
            </a>
          </li>
          <li style="width: 200px;">
            <a href="https://example.com/">
              <svg class="icon github"><!-- SVG icon content --></svg>
            </a>
          </li>
          <!-- Additional logos... -->
        </ul>
        
        <!-- Second Copy for Seamless Loop -->
        <ul class="logos js-logos-list">
          <!-- Duplicate of above for continuous scrolling -->
        </ul>
        
      </div>
    </div>
  </div>
</div>
```

## CSS Architecture

### Marquee Animation System
```css
@keyframes marquee {
  0% { transform: translate3d(var(--start-position, 0%), 0, 0); }
  100% { transform: translate3d(var(--end-position, -50%), 0, 0); }
}

.logos-wrapper {
  --logo-padding: 20px;
  --list-height: 160px;
  --start-position: 0%;
  --end-position: -50%;
  --animation-speed: 15s;
  
  animation: marquee var(--animation-speed) linear infinite;
  animation-play-state: paused;  /* Controlled by JavaScript */
}
```

### Fade Edge Effects
```css
.mask:has(.play):before,
.mask:has(.play):after {
  content: '';
  position: absolute;
  width: 15rem;
  height: 100%;
  pointer-events: none;
  background-image: linear-gradient(
    to right,
    rgba(255, 255, 255, 1) 0%,
    transparent 100%
  );
}
```

### Interactive States
```css
/* Hover pause */
.marquee:hover .logos-wrapper {
  animation-play-state: paused;
  transition-duration: 0.8s;
}

/* Logo hover effects */
.logos img {
  filter: grayscale(100%);
  opacity: 0.5;
  transition: all 0.3s ease-in-out;
}

.logos img:hover {
  filter: grayscale(0);
  opacity: 1;
}
```

## JavaScript Functionality

### Intelligent Scrolling Logic
```javascript
// Check if scrolling is needed
if (logosList.offsetWidth > viewportWidth) {
  logosList.parentElement.classList.add('play');
} else {
  // Stop scrolling if content fits
  completeAnimationAndRemovePlay(logosList);
}
```

### Dynamic Responsiveness
- **ResizeObserver**: Monitors viewport changes
- **Animation Control**: Starts/stops scrolling based on content width
- **Smooth Transitions**: Completes animation cycles before stopping
- **Performance Optimization**: Prevents memory leaks and excessive event listeners

### Animation State Management
- **Play State**: Controls when animation is active
- **Stopping State**: Prevents multiple listeners during transition
- **Fallback Timers**: Ensures cleanup even if animation events fail

## Data Source Requirements

### Logo Data Structure
For image-based logos:
```json
[
  {
    "url": "https://company.com/",
    "logo": "/assets/images/company-logo.svg",
    "title": "Company Name"
  }
]
```

### Icon Data Structure
For icon-based entries (social links):
```json
[
  {
    "url": "https://linkedin.com/in/username/",
    "icon": "linkedin",
    "title": "LinkedIn"
  }
]
```

### Selection Filtering
When using `scope: "selections"`, the component filters by the `title` field:
```yaml
logos:
  source: "socialLinks"
  scope: "selections"
  selections:
    - "LinkedIn"    # Matches title: "LinkedIn" in JSON
    - "GitHub"      # Matches title: "GitHub" in JSON
```

## Usage Patterns

### Client Logos Showcase
```yaml
- sectionType: logos-list
  containerTag: section
  containerFields:
    inContainer: true
    background:
      color: "#f8f9fa"
  logos:
    source: "clientLogos"
    logoWidth: 180
    scope: "all"
```

### Social Media Links
```yaml
- sectionType: logos-list
  containerTag: aside
  logos:
    source: "socialLinks"
    logoWidth: 60
    scope: "selections"
    selections:
      - "LinkedIn"
      - "Twitter" 
      - "GitHub"
```

### Partner Organizations
```yaml
- sectionType: logos-list
  isReverse: true
  logos:
    source: "partners"
    logoWidth: 200
    scope: "all"
```

### Technology Stack Display
```yaml
- sectionType: logos-list
  logos:
    source: "technologies"
    logoWidth: 120
    scope: "selections"
    selections:
      - "React"
      - "Node.js"
      - "TypeScript"
      - "MongoDB"
```

## Customization Options

### Animation Speed
Modify scrolling speed via CSS custom properties:
```css
.custom-speed .logos-wrapper {
  --animation-speed: 20s;  /* Slower scrolling */
}
```

### Logo Dimensions
Adjust individual logo sizing:
```css
.large-logos .logos li {
  width: 250px !important;  /* Override inline width */
}
```

### Custom Fade Effects
Modify edge gradient effects:
```css
.subtle-fade .mask:has(.play):before,
.subtle-fade .mask:has(.play):after {
  width: 10rem;  /* Smaller fade area */
  background-image: linear-gradient(
    to right,
    rgba(248, 249, 250, 1) 0%,
    transparent 100%
  );
}
```

### Reverse Animation Override
```css
.is-reverse .logos-wrapper.play {
  animation-direction: reverse;
}
```

## Dependencies

- `logo`: Renders individual logo images with links
- `icon`: Renders SVG icons for social links and icon-based entries
- `commons`: Provides base container and styling utilities

## Required Nunjucks Filters
- `getSelections`: Custom filter for filtering data by selections array

## Accessibility

- **Semantic HTML**: Uses proper list structure for logo collections
- **Alt Text**: Comprehensive alt text for all logo images
- **Link Context**: Clear link destinations and purposes
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Reduced Motion**: Respects user preferences for reduced motion
- **Screen Readers**: Proper markup for assistive technology

## Best Practices

1. **Image Optimization**: Use SVG logos when possible for crisp scaling
2. **Data Organization**: Keep JSON data files organized and up-to-date
3. **Performance**: Limit logo count for better performance (recommended: 6-12 logos)
4. **Consistent Sizing**: Use similar aspect ratios for visual consistency
5. **Load Testing**: Test with various screen sizes and logo counts
6. **Content Strategy**: Group related logos logically (clients, partners, etc.)
7. **Fallbacks**: Provide fallback images for external logo dependencies

## Performance Considerations

- **CSS Animations**: Uses hardware-accelerated transforms for smooth performance
- **Event Optimization**: Efficient ResizeObserver usage with debouncing
- **Memory Management**: Proper cleanup of event listeners and timers
- **Image Loading**: Consider lazy loading for large logo collections
- **Animation Efficiency**: Pauses animations when not visible using Intersection Observer

## Browser Support

- **Modern Browsers**: Full support for CSS animations and ResizeObserver
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Mobile Optimization**: Touch-friendly interactions and responsive behavior
- **Performance**: Optimized for various device capabilities

The logos list component provides an elegant solution for showcasing organizational relationships, social presence, and brand partnerships while maintaining excellent performance and user experience.