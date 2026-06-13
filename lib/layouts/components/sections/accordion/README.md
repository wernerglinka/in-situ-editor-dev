# Accordion Section

Interactive accordion component for FAQ-style content. Loads data from external JSON files with expandable/collapsible panels.

## Features

- Load FAQ data from external JSON files (`lib/data/`)
- Show all items or a filtered selection by ID
- Control initial expanded state with `expandIndex`
- Allow single or multiple panels open simultaneously
- Optional "Toggle All" control when multiple panels allowed
- Markdown support in panel content
- Optional section text and CTAs

## Data Structure

FAQ data is stored in JSON files referenced by `faqs.source`:

```json
[
  {
    "id": "unique-id",
    "title": "Question text",
    "answer": "Answer text with **markdown** support"
  }
]
```

## Configuration

```yaml
- sectionType: accordion
  text:
    title: "Frequently Asked Questions"
    prose: "Find answers to common questions"
  faqs:
    scope: "all"  # or "selections"
    source: "faqs"  # filename without extension
    selections:  # array of IDs when scope is "selections"
      - "unique-id-1"
      - "unique-id-2"
  expandIndex: 0  # Index of initially expanded panel (0-based), null for none
  allowMultiple: false  # Allow multiple panels open at once
  ctas:
    - text: "Still have questions?"
      url: "/contact"
```

## Behavior Options

- `expandIndex`: Specify which panel is expanded initially (0-based index). Set to `null` for all closed.
- `allowMultiple`: When `true`, multiple panels can be open simultaneously and shows a "Toggle All" control. When `false`, opening a panel closes others.
- `scope: "selections"`: Load only specific items by ID from the data source.
- `scope: "all"`: Load all items from the data source.
