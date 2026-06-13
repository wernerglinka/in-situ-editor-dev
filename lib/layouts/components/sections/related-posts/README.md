# Related Posts Section Component

A curated list of items from any collection, rendered as either a simple text list (title + description + link) or a grid of cards. Intended for placement at the end of a blog post, reference page, or any content item to point readers at a hand-picked set of related reading.

## Features

- **Curated Selection**: Author picks exactly which items appear, by slug
- **Preserved Order**: Items render in the order listed in frontmatter
- **Auto-Collection Discovery**: Resolves slugs across all registered collections — no `collectionName` prop required
- **Two Presentation Modes**: Simple text list (default) or card grid (`hasCard: true`)
- **Silent When Empty**: Renders nothing if no selections resolve to real items
- **Optional Heading**: Include a `text` block for a section title / intro

## Configuration

```yaml
- sectionType: related-posts
  containerTag: aside
  classes: ""
  id: ""
  isDisabled: false
  containerFields:
    inContainer: true
    isAnimated: true
    noMargin:
      top: false
      bottom: false
    noPadding:
      top: false
      bottom: false
    background:
      color: ""
      image: ""
      imageScreen: "none"
  text:
    leadIn: ""
    title: "Related Posts"
    titleTag: "h2"
    subTitle: ""
    prose: ""
  hasCard: false
  selections:
    - building-pages-with-components
    - section-anatomy
    - how-component-bundling-works
```

## Properties

| Property          | Type    | Required | Description |
|-------------------|---------|----------|-------------|
| `sectionType`     | string  | Yes      | Must be `related-posts` |
| `selections`      | array   | Yes      | Slugs (last permalink segment) of items to list, in display order |
| `hasCard`         | boolean | No       | Render as cards instead of a text list. Defaults to `false` |
| `text`            | object  | No       | Optional heading block — standard `text` partial props |
| `isDisabled`      | boolean | No       | Hide the section entirely |
| `containerFields` | object  | No       | Standard container configuration |

## Slug Matching

Each entry in `selections` is matched against the last segment of an item's permalink. For a blog post at `src/blog/section-anatomy.md` with permalink `blog/section-anatomy`, the slug is `section-anatomy`. For a reference page at `src/references/sections/hero.md` with permalink `references/sections/hero`, the slug is `hero`.

## Cross-Collection Resolution

The component iterates every registered collection (`blog`, `sections`, `partials`, etc.) when resolving a slug. The first collection containing a match wins, so a slug is never rendered twice even if two collections share it. This means the author can mix items from different collections in a single block without specifying which collection each slug belongs to.

## Presentation Modes

### Text list (default)

A flat `<ul>` with each entry showing title, description, and a link. Minimal styling, no thumbnails. Best for end-of-article "further reading" lists where density matters more than visual weight.

Each entry's title and description read from `post.card.title` / `post.card.description` when present, with fallbacks to top-level `blogTitle` (or `title`) and `excerpt`. This means the text list works on projects that don't use the `card` frontmatter convention.

### Card grid (`hasCard: true`)

A flex-wrap grid of `collection-card` partials, complete with thumbnail, title, description, and an arrow icon. Best when the section stands on its own and benefits from visual anchoring — for example, a "You might also like" block on an index or landing page.

Card thumbnails come from `post.card.thumbnail` (blog convention) with a fallback to `post.card.image` (reference-page convention), so cards work uniformly across collections.

If `hasCard: true` is set but any resolved post is missing its `card` object, the section silently falls back to the text list rather than rendering partial or broken cards.

## Empty State

If none of the selection slugs resolve, the component renders nothing — no heading, no empty list. Safe to include in templates without worrying about broken references.

## Dependencies

- `text` partial — renders the optional heading block
- `collection-card` partial — renders card items when `hasCard: true`
- `commons` — base container styling

## HTML Structure

### Text list

```html
<div class="content container">
  <ul class="related-posts-list">
    <li class="related-post">
      <a href="/blog/section-anatomy/" class="related-post-link">
        <span class="related-post-title">Section Anatomy</span>
        <span class="related-post-description">Breakdown of how a section component is structured.</span>
      </a>
    </li>
    <!-- additional items -->
  </ul>
</div>
```

### Card grid

```html
<div class="content container">
  <ul class="related-posts-list is-cards">
    <li class="related-post collection-card">
      <!-- collection-card partial output -->
    </li>
    <!-- additional items -->
  </ul>
</div>
```
