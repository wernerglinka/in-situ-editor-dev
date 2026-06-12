# Branding Partial Component

A simple branding component that renders a logo image linked to the home page.

## HTML Output

```html
<div class="brand">
  <a class="home-link" href="/">
    <img src="/assets/images/logo.svg" alt="Company Logo" />
  </a>
</div>
```

## Template Usage

```nunjucks
{% from "components/_partials/branding/branding.njk" import branding %}

  {% set link = '/' %}
  {% set img = { src: '/assets/images/metalsmith2025-logo-bug.png', alt: 'Metalsmith Starter' } %}
  {{ branding( link, img ) }}

```

## Features

- **Simple Logo Display**: Logo presentation with home page link
- **Accessible**: Proper alt text for screen readers
- **Flexible**: Supports any image format and custom home URLs
