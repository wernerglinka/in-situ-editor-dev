# Blog Navigation Section Component

A navigation component that provides previous/next links between sequential blog posts. Designed to enhance blog post navigation by allowing readers to easily move between articles in chronological order.

## Features

- **Sequential Navigation**: Automatically links to previous and next blog posts
- **Conditional Display**: Only renders when previous or next posts exist
- **Accessible Navigation**: Properly labeled navigation with semantic HTML
- **Responsive Layout**: Flexbox-based layout that adapts to screen size
- **Title Display**: Shows the title of linked blog posts for context
- **Directional Indicators**: Clear visual arrows indicating navigation direction
- **Container Integration**: Works within the standard container system

## Data Structure

The blog navigation component relies on Metalsmith's collection metadata to determine previous and next posts. These values are typically populated automatically by Metalsmith's collections plugin.

```yaml
# Automatically populated by Metalsmith
previous:
  urlPath: "/blog/previous-post/"
  card:
    title: "Previous Post Title"

next:
  urlPath: "/blog/next-post/"
  card:
    title: "Next Post Title"
```

## HTML Structure

```html
<nav class="blog-navigation container" aria-label="Blog post navigation">
  <!-- Previous post link (if exists) -->
  <a href="/blog/previous-post/" class="blog-nav-link blog-nav-prev">
    <span class="blog-nav-label">← Previous</span>
    <span class="blog-nav-title">Previous Post Title</span>
  </a>
  
  <!-- Next post link (if exists) -->
  <a href="/blog/next-post/" class="blog-nav-link blog-nav-next">
    <span class="blog-nav-title">Next Post Title</span>
    <span class="blog-nav-label">Next →</span>
  </a>
</nav>
```

## CSS Architecture

### Layout Structure
Uses flexbox for responsive navigation arrangement:
```css
.blog-navigation {
  display: flex;
  justify-content: center;
  gap: var(--space-l-2xl);
  flex-wrap: wrap;
}
```

### Responsive Behavior
- **Flexible spacing**: Uses CSS custom properties for consistent spacing
- **Wrap on small screens**: Navigation links stack vertically when needed
- **Center alignment**: Links centered within container by default
- **Adaptive gap**: Spacing adjusts based on design system variables

### Link Styling
- **Previous link**: Left-aligned with arrow pointing left
- **Next link**: Right-aligned with arrow pointing right
- **Block display**: Links are block-level for better click targets
- **Text decoration**: Removed by default for cleaner appearance

## Usage Patterns

### Basic Implementation
Simply include the blog-navigation component in your blog post template:
```njk
{% include "components/sections/blog-navigation/blog-navigation.njk" %}
```

### Integration in Blog Post Layout
```njk
{# blog-post.njk #}
<article class="blog-post">
  <!-- Blog post content -->
  {{ content | safe }}
  
  <!-- Navigation between posts -->
  {% include "components/sections/blog-navigation/blog-navigation.njk" %}
</article>
```

### Custom Wrapper
```njk
<div class="blog-post-footer">
  {% include "components/sections/blog-navigation/blog-navigation.njk" %}
  <!-- Other footer elements -->
</div>
```

## Dependencies

- **Container system**: Uses standard container class for consistent width
- **CSS custom properties**: Relies on design system spacing variables
- **Metalsmith collections**: Requires collections plugin for previous/next data

## Integration Requirements

### Metalsmith Collections Plugin
The component requires properly configured collections to provide previous/next data:
```javascript
// In metalsmith.js
.use(collections({
  blog: {
    pattern: 'blog/**/*.md',
    sort: 'date:desc',
    metadata: {
      name: 'Blog Posts'
    }
  }
}))
```

### Blog Post Frontmatter
Each blog post needs proper card metadata:
```yaml
# In blog post frontmatter
card:
  title: "Blog Post Title"
  # Other card properties...
```

## Customization

### Custom Classes
The component structure allows for additional styling through CSS:
```css
/* Custom navigation styles */
.blog-navigation {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-xl);
  margin-top: var(--space-2xl);
}

/* Custom link styling */
.blog-nav-link {
  color: var(--color-primary);
  transition: color 0.2s ease;
}

.blog-nav-link:hover {
  color: var(--color-primary-dark);
}
```

### Styling Hooks
Key CSS classes for customization:
- `.blog-navigation`: Main navigation container
- `.blog-nav-link`: Individual navigation links
- `.blog-nav-prev`: Previous post link
- `.blog-nav-next`: Next post link
- `.blog-nav-label`: Arrow and direction text
- `.blog-nav-title`: Blog post title text

### Layout Variations
Override default layout with custom CSS:
```css
/* Space links apart */
.blog-navigation {
  justify-content: space-between;
}

/* Stack vertically on all screens */
.blog-navigation {
  flex-direction: column;
  align-items: center;
}
```

## Accessibility

- **Semantic HTML**: Uses `nav` element with proper ARIA label
- **Descriptive labels**: Clear "Previous" and "Next" text for screen readers
- **Link context**: Full blog post titles provide context for navigation
- **Keyboard navigation**: Fully keyboard accessible with standard link behavior
- **Focus indicators**: Maintains visible focus states for keyboard users

## Best Practices

1. **Placement**: Typically placed at the end of blog post content
2. **Consistency**: Use the same navigation style across all blog posts
3. **Visual hierarchy**: Ensure navigation doesn't compete with main content
4. **Mobile consideration**: Test navigation on smaller screens
5. **Loading states**: Consider adding loading indicators if posts load dynamically
6. **SEO benefits**: Sequential navigation helps search engines understand content structure

## Conditional Rendering

The component automatically handles edge cases:
- **First post**: Only shows "Next" link
- **Last post**: Only shows "Previous" link  
- **Single post**: Component doesn't render if no other posts exist
- **Missing metadata**: Gracefully handles missing previous/next data