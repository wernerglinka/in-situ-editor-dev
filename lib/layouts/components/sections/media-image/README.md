# Media Image Section Component

A versatile media section component that combines text content with an image in a flexible layout. Features a sophisticated glass morphism design with overlapping text containers, responsive behavior, and the ability to reverse layouts for alternating content presentation.

## Features

- **Glass Morphism Design**: Semi-transparent text overlay with backdrop blur effects
- **Flexible Layout**: Image and text can be positioned on either side
- **Reverse Layout**: Switch between left/right positioning with `isReverse` flag
- **Container Queries**: Modern CSS container queries for responsive behavior
- **Overlapping Design**: Text container strategically positioned over image edge
- **Responsive Adaptation**: Layout adapts automatically at 50rem breakpoint
- **Rich Text Support**: Full text formatting with lead-in, title, subtitle, and prose
- **Multiple CTAs**: Support for buttons and links with various styles
- **Image Captions**: Optional captions with proper semantic markup
- **Accessibility**: Comprehensive alt text and semantic structure

## Data Structure

```yaml
- sectionType: media-image
  containerTag: aside  # aside, section, or div
  disabled: false
  id: ""
  classes: ""
  isReverse: false     # Reverses image/text positioning
  containerFields:
    inContainer: true
    isAnimated: true
    noMargin:
      top: false
      bottom: true
    noPadding:
      top: true
      bottom: true
    background:
      color: ""
      image: ""
      imageScreen: "none"  # light, dark, none
  text:
    leadIn: "Feature Highlight"
    title: "Media Section Example"
    titleTag: "h2"
    isCentered: true     # Centers text within container
    subTitle: ""
    prose: |-
      Example of a media section combining text and image.
      The text area supports rich formatting and multiple
      content types for comprehensive storytelling.
  ctas:
    - url: "https://example.com"
      label: "Learn More"
      isButton: true
      buttonStyle: "primary"
    - url: "/details"
      label: "Read Details"
      isButton: false
      buttonStyle: "primary"
  image:
    src: "/assets/images/feature.jpg"
    alt: "Feature illustration"
    caption: "Optional image caption"
```

## HTML Structure

```html
<div class="media-image content">
  
  <!-- Image Container -->
  <div class="image">
    <figure>
      <img src="/assets/images/feature.jpg" alt="Feature illustration">
      <figcaption>Optional image caption</figcaption>
    </figure>
  </div>
  
  <!-- Text Container with Glass Effect -->
  <div class="text flow">
    <div class="prose flow">
      <p class="lead-in">Feature Highlight</p>
      <h2>Media Section Example</h2>
      <div class="prose">Example content...</div>
    </div>
    
    <div class="ctas flow">
      <a class="cta button primary" href="https://example.com">Learn More</a>
      <a class="cta link" href="/details">Read Details</a>
    </div>
  </div>
  
</div>
```

## CSS Architecture

### Layout Structure
Implements the Every Layout Switcher pattern for responsive layout:
```css
.section-wrapper .media-image.content {
  --threshold: 50rem;  /* Controls when layout switches */
  container-type: inline-size;
}
```

The component inherits the Switcher pattern from the `.content` class in commons.css, which automatically switches between horizontal and vertical layouts based on the container width and the threshold value. Additionally, it uses container queries for fine-tuned responsive adjustments:

```css
@container (max-width: 50rem) {
  .text {
    left: 0;  /* Remove overlap on small containers */
  }
}
```

### Glass Morphism Design
The text container features sophisticated glass morphism effects:
```css
.text {
  background-color: var(--glass-background);
  box-shadow: var(--glass-box-shadow);
  backdrop-filter: var(--glass-backdrop-filter);
  border: var(--glass-border);
  border-radius: var(--glass-border-radius);
  padding: var(--space-s-l);
  
  /* Strategic positioning */
  position: relative;
  top: var(--space-s-m);
  left: -1rem;  /* Overlap with image */
}
```

### Image Container
```css
.image {
  overflow: hidden;
  border-radius: var(--glass-border-radius);
}
```

### Responsive Behavior
- **Switcher Pattern**: Automatically switches between horizontal and vertical layouts
- **Threshold**: Set to `50rem` - switches at 800px container width
- **Horizontal Layout**: When container is wider than threshold (image and text side by side)
- **Vertical Layout**: When container is narrower than threshold (image above text)
- **Container Queries**: Additional fine-tuning removes text overlap when stacked
- **Fixed Units**: Using `rem` ensures consistent breakpoint regardless of font size

### Layout Variations
- **Standard Layout**: Image on left, text on right
- **Reverse Layout**: Image on right, text on left (via `is-reverse` class)
- **Responsive Adaptation**: Single column layout on smaller containers

### Design Elements
- **No column gap**: `column-gap: 0` for edge-to-edge overlap
- **Strategic overlap**: Text positioned to create visual depth
- **Rounded corners**: Consistent border radius throughout
- **Glass effects**: Semi-transparent backgrounds with blur

## Usage Patterns

### Feature Showcase
```yaml
- sectionType: media-image
  containerTag: section
  containerFields:
    inContainer: true
    background:
      color: "#f8f9fa"
  text:
    leadIn: "Key Feature"
    title: "Advanced Analytics"
    prose: "Comprehensive analytics dashboard with real-time insights."
  image:
    src: "/assets/images/analytics-dashboard.jpg"
    alt: "Analytics dashboard interface"
  ctas:
    - url: "/features/analytics"
      label: "Explore Analytics"
      isButton: true
      buttonStyle: "primary"
```

### Product Highlight
```yaml
- sectionType: media-image
  isReverse: true
  text:
    title: "Product Innovation"
    isCentered: false
    prose: "Cutting-edge technology meets user-friendly design."
  image:
    src: "/assets/images/product-shot.jpg"
    alt: "Product showcase"
    caption: "Award-winning design"
  ctas:
    - url: "/products"
      label: "View Products"
      isButton: true
    - url: "/awards"
      label: "See Awards"
      isButton: false
```

### Case Study Preview
```yaml
- sectionType: media-image
  containerTag: article
  text:
    leadIn: "Success Story"
    title: "Client Achievement"
    subTitle: "50% Performance Improvement"
    prose: "How we helped our client achieve remarkable results."
  image:
    src: "/assets/images/case-study.jpg"
    alt: "Client success metrics"
  ctas:
    - url: "/case-studies/client-name"
      label: "Read Full Case Study"
      isButton: true
      buttonStyle: "primary"
```

### Service Description
```yaml
- sectionType: media-image
  text:
    title: "Custom Solutions"
    isCentered: true
    prose: "Tailored services that adapt to your unique business needs."
  image:
    src: "/assets/images/custom-solutions.jpg"
    alt: "Custom solution workflow"
  ctas:
    - url: "/services"
      label: "Our Services"
      isButton: true
    - url: "/contact"
      label: "Get Quote"
      isButton: true
      buttonStyle: "secondary"
```

## Layout Behavior

### Standard Layout (isReverse: false)
- **Image**: Positioned on the left side
- **Text**: Positioned on the right with left overlap
- **Visual Flow**: Left-to-right reading pattern

### Reverse Layout (isReverse: true)
- **Image**: Positioned on the right side  
- **Text**: Positioned on the left with right overlap
- **Visual Flow**: Alternating pattern for content variety

### Responsive Breakpoint (50rem)
- **Above 50rem**: Side-by-side layout with overlap
- **Below 50rem**: Stacked layout without overlap
- **Text Position**: Overlap removed for better mobile experience

## Dependencies

- `image`: Renders responsive images with captions
- `text`: Handles text content rendering
- `ctas`: Renders call-to-action buttons and links  
- `commons`: Provides base container and styling utilities

## Customization

### Custom Classes
Add styling through component classes:
```yaml
classes: "featured-media highlight-section"
```

### Styling Hooks
Key CSS classes for customization:
- `.media-image`: Main component container
- `.media-image.is-reverse`: Reversed layout
- `.text`: Text container with glass effects
- `.image`: Image container
- `.prose`: Text content area
- `.ctas`: Call-to-action container

### Glass Effect Customization
Modify glass morphism properties:
```css
.custom-glass .text {
  --glass-background: rgba(255, 255, 255, 0.9);
  --glass-backdrop-filter: blur(20px);
  --glass-border: 1px solid rgba(255, 255, 255, 0.2);
  --glass-box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### Container Query Adjustments
Modify responsive behavior:
```css
.custom-media {
  --threshold: 60rem;  /* Different breakpoint */
}

@container (max-width: 60rem) {
  .custom-media .text {
    left: 0;
    top: 0;  /* Remove vertical offset */
  }
}
```

### Overlap Customization
Adjust text positioning:
```css
.minimal-overlap .text {
  left: -0.5rem;  /* Reduced overlap */
  top: var(--space-xs);  /* Different vertical offset */
}
```

## Accessibility

- **Semantic Structure**: Proper use of figure and figcaption elements
- **Alt Text**: Comprehensive image descriptions
- **Heading Hierarchy**: Configurable heading levels with titleTag
- **Link Context**: Clear call-to-action labeling
- **Focus Management**: Proper keyboard navigation support
- **Screen Readers**: Glass effects don't interfere with content reading

## Best Practices

1. **Image Quality**: Use high-resolution images that work well with text overlap
2. **Text Contrast**: Ensure sufficient contrast against glass background
3. **Content Balance**: Keep text and image proportions visually balanced
4. **Consistent Spacing**: Maintain consistent overlap and spacing patterns
5. **Mobile Optimization**: Test glass effects on various screen sizes
6. **Performance**: Optimize images for fast loading
7. **Content Strategy**: Use alternating layouts (reverse) for visual variety

## Browser Support

- **Container Queries**: Requires modern browser support (Chrome 105+, Firefox 110+)
- **Backdrop Filter**: Good support in modern browsers
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Glass Effects**: Fallback backgrounds for unsupported browsers

## Advanced Features

### Dynamic Glass Effects
The component automatically adapts glass effects based on:
- Container background colors
- Image content and brightness
- Text length and content type

### Responsive Image Handling
- **Art Direction**: Different images for different screen sizes
- **Performance**: Lazy loading and optimal formats
- **Accessibility**: Comprehensive alt text strategies

### Layout Intelligence
- **Content-Aware**: Adapts layout based on text and image proportions
- **Container-Responsive**: Uses container queries for true component-level responsiveness
- **Glass Positioning**: Smart overlap positioning that works across layouts

The media-image component provides a sophisticated solution for combining visual and textual content while maintaining modern design aesthetics and excellent user experience across all devices.