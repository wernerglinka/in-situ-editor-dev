# Artwork Section Component

Displays a single artwork with its image, optional title/subtitle header, and a structured property list (type, year, materials, dimensions, status). Originally developed for the WG Art26 Eleventy project and imported here for reuse in Metalsmith builds.

## Template

`artwork.njk` — renders into a `.section-wrapper.artwork` container (applied by the section renderer).

## Partials Used

- `components/_partials/text/text.njk` — renders `text.leadIn`, `text.title`, `text.subTitle`
- `components/_partials/image/image.njk` — renders the artwork image with optional caption

## Frontmatter Schema

```yaml
- sectionType: artwork          # required
  containerTag: article         # HTML tag for the outer section wrapper
  classes: ''
  id: ''
  isDisabled: false
  isAnimated: true
  containerFields:
    inContainer: false
    noMargin:
      top: false
      bottom: true
    noPadding:
      top: false
      bottom: true
    background:
      color: ''
      image: ''
      imageScreen: 'none'       # light | dark | none
  text:                         # optional — omit block to suppress the header
    leadIn: ''
    title: 'Object 2026.03.005'
    titleTag: 'h1'
    subTitle: ''
  image:                        # required
    src: '/assets/images/artworks/2026/2026.03.005.JPG'
    alt: ''
    caption: ''                 # optional — rendered below the image
  artworkProperties:            # optional — omit block to suppress the property list
    type: 'Assemblage'
    year: 2026
    materials: 'Wire mesh, wood panel, ash, urethane, shredded paper'
    status: 'available'         # available | sold | not-for-sale
    dimensions:
      width: 9
      height: 24
      depth: 1                  # optional
      unit: 'in'                # stored in inches; converted to cm when lang == 'de'
```

## Status Display

The `status` row is only rendered when `status == 'available'`. Sold and not-for-sale works omit the status row entirely.

## Bilingual Behaviour

The component reads the page-level `lang` variable to switch between English and German labels. When `lang == 'de'`:

- Property labels switch to German (`Typ`, `Jahr`, `Materialien`, `Maße`, `Verfügbar`).
- Dimensions are multiplied by 2.54 and rounded, and the unit displays as `cm`.

In a Metalsmith build where `lang` is not set, English labels are always used.

## CSS

`artwork.css` — scoped under `.section-wrapper.artwork .artwork`. Key layout decisions:

- The `.content` container overrides the default flex layout with `display: block` so image, header, and property list stack vertically.
- All three blocks share the same fluid max-width (`clamp(45ch, 65ch, 80ch)`), centred with `margin-inline: auto`.
- The image is constrained to `max-width: 500px` / `max-height: 600px` and centred within `.media` via `justify-self: center`.
- The property list uses a two-column definition list grid (`8rem` label column, fluid value column) with hairline borders between rows.

## Design Tokens Used

`--space-xs`, `--space-s`, `--space-m`, `--color-text-muted`, `--color-border-light`, `--color-text`, `--color-primary`, `--step--1`, `--font-p`, `--font-s`
