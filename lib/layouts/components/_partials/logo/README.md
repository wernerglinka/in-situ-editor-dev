# Logo List Partial Component

An animated logo carousel component that displays logos in a marquee-style animation when they exceed viewport width, or as a static list when they fit.

## Data Structure

```yaml
# Component configuration
info:
  scope: "all"  # or "selections"
  listSource: "artMuseums"  # data source key
  selections: ["Art Unit", "Museum of Flight"', SFMOMA]  # array of titles (when scope is "selections")
  logoWidth: 120  # width in pixels for each logo
```

## Data source (referenced by listSource)
`artMuseumns.json`
```json
[
  {
    "url": "https://artunit.com",
    "logo": "/assets/images/art/art-unit.svg",
    "title": "Art Unit" 
  },
  {
    "url": "https://design-museum.com",
    "logo": "/assets/images/art/design-museum.svg",
    "title": "Design Museum" 
  },
  {
    "url": "https://museum-of-flight.com",
    "logo": "/assets/images/art/museum-of-flight.svg",
    "title": "Museum of Flight" 
  },
  ...
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `info.scope` | String | Yes | "all" or "selections" - determines which logos to show |
| `info.listSource` | String | Yes | Key name of the data source |
| `info.selections` | Array | No | Array of indices (required when scope is "selections") |
| `info.logoWidth` | Number | Yes | Width in pixels for each logo |
| `data[].url` | String | Yes | Path to entity website |
| `data[].logo` | String | Yes | Path to logo image |
| `data[].title` | String | Yes | Logo alt text and title |

## HTML Output

```html
<div class="marquee" style="--list-width: 720px">
  <div class="logos-wrapper">
    <ul class="logos js-logos-list">
      <li>
        <a href="https://artunit.com">
          <img src="/assets/images/art/art-unit.svg" alt="Art Unit" width="120" />
        </a>
      </li>
      <!-- More logos... -->
    </ul>
    <!-- Duplicate list for seamless animation -->
    <ul class="logos js-logos-list">
      <!-- Same logos repeated -->
    </ul>
  </div>
</div>
```
> For properly using external links, use the `metalsmith-safe-links` plugin. 

## Usage Examples

### Show All Logos
```yaml
info:
  scope: "all"
  listSource: "partners"
  selections: []
  logoWidth: 100
```

### Show Selected Logos
```yaml
info:
  scope: "selections"
  listSource: "clients"
  selections:
    - IBM
    - HP
    - Salesforce
    - Apple
  logoWidth: 150
```

## Template Usage

```nunjucks
{% from "components/_partials/logo-list/logo-list.njk" import logoList %}

<div class="container logo-list content {% if section.reverse %}is-reverse{% endif %}">
  {{ logoList(section, artMuseums) }}
</div>
```

## Features

- **Responsive Animation**: Automatically animates when logos exceed viewport width
- **Static Display**: Shows static list when logos fit in viewport
- **Flexible Selection**: Show all logos or specific selections
- **External Link Handling**: Proper attributes for external links
- **Seamless Loop**: Duplicate lists create smooth infinite scroll
- **Resize Observer**: Adapts to viewport changes dynamically
