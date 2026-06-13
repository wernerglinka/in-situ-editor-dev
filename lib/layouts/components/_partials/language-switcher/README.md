# Language Switcher Component

A dropdown language selector with URL-based navigation for multi-language Metalsmith sites.

## Features

- Dropdown language selector with globe icon
- URL-based language navigation (builds localized URLs automatically)
- Falls back to configurable URL when localized page doesn't exist
- Stores preference in localStorage
- Sets `lang` attribute on `<html>` element
- Keyboard accessible (Escape to close)
- Click outside to close dropdown
- Dark theme compatible
- SWUP page transitions compatible

## Installation

1. Copy the `language-switcher` folder to `lib/layouts/components/_partials/`
2. Create a `lib/data/languages.json` configuration file (see below)
3. Import and use the macro in your header or layout template

## Configuration

Create `lib/data/languages.json`:

```json
{
  "defaultLang": "en",
  "fallbackUrl": "/404/",
  "available": [
    { "code": "en", "label": "English" },
    { "code": "de", "label": "Deutsch" },
    { "code": "fr", "label": "Français" }
  ]
}
```

- `defaultLang` - The default language code (pages at root, no URL prefix)
- `fallbackUrl` - Where to navigate when a localized page doesn't exist
- `available` - Array of language objects with `code` (ISO 639-1) and `label` (display name)

## Usage

In your header template:

```nunjucks
{% from "components/_partials/language-switcher/language-switcher.njk" import languageSwitcher %}

{{ languageSwitcher(data.languages.available, data.languages.defaultLang, data.languages.fallbackUrl) }}
```

## How It Works

When a user selects a language, the component:

1. Extracts the base path from the current URL (strips any locale prefix)
2. Constructs the URL for the selected language
3. Checks if that URL exists (via a HEAD request)
4. Navigates there if it exists, or falls back to the configured `fallbackUrl`

For example, on `/de/about/` selecting French:
- Base path: `/about/`
- Target URL: `/fr/about/`
- If `/fr/about/` exists, navigate there
- If not, navigate to the fallback URL

## Content Structure for Multi-Language Sites

Organize your source files with the default language at the root and other languages in subdirectories:

```
src/
  index.md
  about.md
  blog/
    welcome-post.md
  de/
    index.md
    about.md
    blog/
      welcome-post.md
  fr/
    index.md
    about.md
    blog/
      welcome-post.md
```

Each language directory mirrors the default structure exactly. The markdown files have identical frontmatter structure - only the prose content is translated. Metalsmith builds these directories naturally, no special plugins required.

## Creating Translated Content

Copy your default language content:

```bash
cp -r src/ src/de/
```

Then translate the prose fields in each file. The structure, layout references, and metadata stay the same - only the human-readable text changes.

## SEO: hreflang Tags

To help search engines understand language variants, add hreflang tags to your `<head>` template.

First, add a filter to strip locale prefixes (in `lib/nunjucks-filters/string-filters.js`):

```javascript
function stripLocalePrefix(path, locales, defaultLocale) {
  for (const locale of locales) {
    if (locale.code !== defaultLocale && path.startsWith('/' + locale.code + '/')) {
      return path.slice(locale.code.length + 1);
    }
  }
  return path;
}
```

Then in your `<head>` template:

```nunjucks
{% set basePath = urlPath | stripLocalePrefix(data.languages.available, data.languages.defaultLang) %}
{% for lang in data.languages.available %}
  {% if lang.code == data.languages.defaultLang %}
    <link rel="alternate" hreflang="{{ lang.code }}" href="{{ data.site.url }}{{ basePath }}" />
  {% else %}
    <link rel="alternate" hreflang="{{ lang.code }}" href="{{ data.site.url }}/{{ lang.code }}{{ basePath }}" />
  {% endif %}
{% endfor %}
<link rel="alternate" hreflang="x-default" href="{{ data.site.url }}{{ basePath }}" />
```

## Navigation Within a Language

Internal links should stay within the language context. For navigation menus, prepend the current locale:

```nunjucks
{% set localePrefix = '' %}
{% for lang in data.languages.available %}
  {% if lang.code != data.languages.defaultLang and urlPath.startsWith('/' + lang.code + '/') %}
    {% set localePrefix = '/' + lang.code %}
  {% endif %}
{% endfor %}

<a href="{{ localePrefix }}{{ item.url }}">{{ item.label }}</a>
```

## Dependencies

Requires the `icon` partial for the globe icon.

## Files

- `language-switcher.njk` - Nunjucks template macro
- `language-switcher.js` - JavaScript for dropdown behavior and URL navigation
- `language-switcher.css` - Component styles
- `language-switcher.yml` - Example frontmatter
- `manifest.json` - Component metadata
