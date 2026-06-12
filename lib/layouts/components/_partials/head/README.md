# Head Partial Component

A comprehensive HTML head section component that includes SEO meta tags, social media tags, icons, and stylesheets.

## Data Structure

```yaml
# Required global data
site:
  title: "Site Title"
  description: "Site description"
  author: "Author Name"
  siteURL: "https://example.com"
  validate:
    google: "google-verification-code"
    ms: "bing-verification-code"

# Page-specific SEO data
seo:
  title: "Page Title"
  description: "Page description"
  socialImage: "/assets/images/social-image.jpg"

# Current page path
path: "/current-page/"
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `site.title` | String | Yes | Site title for meta tags |
| `site.description` | String | Yes | Site description |
| `site.author` | String | Yes | Site author |
| `site.siteURL` | String | Yes | Base site URL |
| `seo.title` | String | Yes | Page-specific title |
| `seo.description` | String | Yes | Page-specific description |
| `seo.socialImage` | String | Yes | Social media image URL |
| `path` | String | Yes | Current page path |

## HTML Output

```html
<!-- Validation -->
<meta name="verify-v1" content="google-code" />
<meta name="msvalidate.01" content="bing-code" />
<link rel="canonical" href="https://example.com/current-page/" />

<!-- Basic Meta -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Page Title</title>
<meta name="description" content="Page description" />

<!-- Icons -->
<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png" />

<!-- Social Media -->
<meta name="twitter:card" content="summary_large_image" />
<meta property="og:title" content="Site Title" />
<meta property="og:description" content="Site description" />

<!-- Stylesheets -->
<link rel="stylesheet" href="/assets/global-styles.css" />
<link rel="stylesheet" href="/assets/components.css" />
```

## Template Usage

```nunjucks
{% include "components/_partials/head/head.njk" %}
```

## Features

- **SEO Optimization**: Complete meta tags for search engines
- **Social Media**: Twitter Card and Open Graph tags
- **Icons**: Comprehensive favicon and touch icon support
- **Performance**: Font preconnection and optimized loading
- **Validation**: Google and Bing webmaster verification
- **Responsive**: Mobile-optimized viewport and meta tags
