# Breadcrumbs Partial Component

A navigation breadcrumb component that shows the current page's location within the site hierarchy.

## Data Structure

Breadcrumbs generated automatically from the `mainMenu` data generated with the `metalsmith-menu-plus` plugin.

## HTML Output

```html
<ul class="breadcrumbs" aria-label="Breadcrumb">
  <li><a href="/">Home</a></li>
  <li><a href="/blog/">Blog</a></li>
  <li><span aria-current="page">Current Post</span></li>
</ul>
```

## Template Usage

```nunjucks
{% from "components/_partials/breadcrumbs/breadcrumbs.njk" import breadcrumbs %}
{{ breadcrumbs(navigation.breadcrumbs) }}
```

## Features

- **Conditional Rendering**: Only shows when more than one breadcrumb exists
- **Current Page Indication**: Last item uses `aria-current="page"` for accessibility
- **Semantic HTML**: Uses proper list structure with ARIA labels
- **Accessible Navigation**: Screen reader friendly with proper ARIA attributes
