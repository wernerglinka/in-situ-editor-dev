# Cards List Section Component

A flexible section component for displaying grids of manual cards with customizable layouts and configurations.

## Features

- **Flexible Grid Layouts**: 1-4 column layouts with responsive behavior
- **Manual Card Integration**: Uses the manual-card partial for consistent card rendering
- **Section Headers**: Optional text header with title and description
- **Horizontal Layout Support**: Can display all cards in horizontal layout
- **Animation Support**: Built-in animation capabilities with staggered delays
- **Fully Responsive**: Adapts to different screen sizes automatically

## Usage

### In Frontmatter

```yaml
sections:
  - sectionType: cards-list
    containerTag: section
    classes: 'my-cards'
    id: 'feature-cards'
    isDisabled: false
    isAnimated: true
    inContainer: true
    columns: 3
    text:
      title: 'Our Features'
      prose: 'Explore what we offer'
    cards:
      - image:
          src: '/assets/images/feature.jpg'
          alt: 'Feature'
        text:
          title: 'Feature Name'
          prose: 'Feature description'
        ctas:
          - url: '/learn-more'
            label: 'Learn More'
```

## Properties

### Section Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `sectionType` | string | Yes | Must be "cards-list" |
| `cards` | array | Yes | Array of card configurations |
| `text` | object | No | Section header with title and prose |
| `columns` | number | No | Number of columns (1-4, defaults to 3) |
| `isHorizontal` | boolean | No | Use horizontal layout for all cards |
| `containerTag` | string | No | HTML tag for container (defaults to 'section') |
| `classes` | string | No | Additional CSS classes |
| `id` | string | No | HTML id attribute |
| `isDisabled` | boolean | No | Disable the section |
| `isAnimated` | boolean | No | Enable animations |
| `inContainer` | boolean | No | Wrap content in container |

### Card Properties

Each card in the `cards` array accepts all properties from the manual-card component:

- `image`: Image configuration object
- `icon`: Icon name for decoration
- `text`: Text content with title and prose
- `ctas`: Array of call-to-action buttons
- `link`: URL to make entire card clickable
- `hasImageBackground`: Use image as background
- `pattern`: Pattern name for background
- `isHorizontal`: Override section horizontal setting
- `classes`: Additional CSS classes for the card

## Layout Options

### Column Layouts

- **1 Column**: Single column, centered, max-width 40rem
- **2 Columns**: Two-column grid, min-width 20rem per card
- **3 Columns**: Three-column grid, min-width 18rem per card (default)
- **4 Columns**: Four-column grid, min-width 15rem per card

### Responsive Behavior

- **Desktop**: Shows configured number of columns
- **Tablet** (< 768px): 3 and 4 column layouts adapt to available space
- **Mobile** (< 480px): All layouts collapse to single column

## Examples

### Feature Cards

```yaml
- sectionType: cards-list
  columns: 3
  text:
    title: 'Features'
  cards:
    - icon: 'zap'
      text:
        title: 'Fast'
        prose: 'Lightning quick performance'
      ctas:
        - url: '#'
          label: 'Learn More'
```

### Navigation Cards

```yaml
- sectionType: cards-list
  columns: 4
  cards:
    - link: '/products'
      icon: 'package'
      text:
        title: 'Products'
        prose: 'Browse catalog'
```

### Case Studies (Horizontal)

```yaml
- sectionType: cards-list
  isHorizontal: true
  columns: 1
  cards:
    - image:
        src: '/assets/images/case.jpg'
        alt: 'Case study'
      text:
        title: 'Success Story'
        prose: 'Detailed case study description...'
      ctas:
        - url: '/read-more'
          label: 'Read Case Study'
```

## Styling

The component uses the following CSS classes:
- `.section.cards-list`: Main container
- `.cards-grid`: Grid container
- `.cols-1` through `.cols-4`: Column layout classes
- `.card-item`: Individual card wrapper
- `.is-animated`: Animation state
- `.is-disabled`: Disabled state

## Dependencies

This component requires:
- `text` partial for section headers
- `manual-card` partial for card rendering