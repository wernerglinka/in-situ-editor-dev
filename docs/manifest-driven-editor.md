# Manifest-driven editor

The development guide for moving the editor from hand-written, blog-only
section forms to a schema-driven editor that can create and edit any page.
This is the detailed plan behind the direction recorded in
[design-notes.md](design-notes.md); read that first for the why and the
shape, this for the contract and the sequence.

## Goal

Today the editor creates new blog posts from three hand-coded section
types. The target is an editor that composes any of the library's section
types and edits any existing page, without per-type code in the editor and
without losing fields it does not understand.

The lever is that we own all three layers: the
`metalsmith2025-structured-content-starter` (this site's base), the
component library under `lib/layouts/components/`, and the
`metalsmith-bundled-components` plugin that discovers, resolves, and
bundles those components at build time. Because we own all three, the
component manifests can become a single source of truth that drives the
build, the content validation, and the editor at once.

## Where we are

The editor knows three section types (`text-only`, `media-image`,
`banner`) out of seventeen in the library. Each is hand-written in
[section-builder.js](../src/assets/js/editor/section-builder.js) and
hand-mapped onto the library schema by the emitter in
[markdown-utils.js](../src/assets/js/utils/markdown-utils.js). The editor
holds a lean editor-state object per section and the emitter is a one-way
function from that lean state to library frontmatter. There is no path
from existing frontmatter back into the editor, so nothing can edit a page
that already exists.

Every component already ships a `manifest.json`. Those manifests carry a
`requires` list (the composition graph), `styles` and `scripts` (the
bundler's asset inputs), and a `validation` block in a flattened
dotted-key JSON-Schema dialect (for example `containerFields.background.isDark`).
The plugin reads all of these at build time: it discovers every component,
resolves the transitive `requires` graph, and validates authored sections
against the `validation` block.

Two properties of the current manifests make them awkward for an editor.
They are incomplete: `validation.properties` lists only fields with
constraints worth validating, so plain free-text fields like `text.title`,
`text.prose`, and the CTA `url` and `label` appear nowhere in a section's
manifest and are only discoverable by reading the partials it requires.
And they are flattened: dotted keys have to be un-flattened into the nested
object the frontmatter actually uses. A form generator cannot render
fields it cannot see, and should not have to reverse-engineer the shape.

## The decision

Each component manifest gains a complete, nested `fields` block that
describes every authored field, its default, and its editor presentation.
Sections compose their fields from partials through the existing `requires`
relationship, so shared field groups like `text`, `ctas`, and `image` are
defined once in the partial that owns them. The `fields` block is additive:
the existing `validation`, `requires`, `styles`, and `scripts` keys keep
working unchanged, so the bundler and the content validator are undisturbed
while the new block is introduced.

The plugin gains an opt-in output that emits the fully composed schema as a
build artifact. The plugin already discovers every component and resolves
the `requires` graph; this step surfaces that result as a single
`components-schema.json` holding, per section type, the resolved nested
field tree. The editor loads that one artifact and never does composition
in the browser.

The editor becomes generic. It renders forms from the schema, serializes
frontmatter from the schema, and hydrates an existing page's frontmatter
back into the form from the same schema. The lean editor-state model and
the hand-written per-type emitter both retire. Because one definition
describes the complete shape of every section, the inverse direction
(frontmatter back to form) is faithful rather than lossy, which is what
makes editing arbitrary existing pages safe.

### Layering discipline

`metalsmith-bundled-components` is a published, general-purpose plugin that
other sites depend on. The manifest format is the shared contract, but the
plugin must stay generic. It reads the manifest, resolves dependencies,
validates content, and optionally emits the composed schema. It does not
interpret editor-only keys like `widget`, `label`, or `order`; it carries
them through opaquely. The bundler validates content shape, the editor
reads presentation intent, and the two concerns share a file without
sharing logic. Every plugin change ships backward compatible and behind an
option so existing consumers are never forced to adopt it.

## The `fields` format

Proven on the banner spike (the `banner` section plus the `commons`,
`text`, `image`, and `ctas` partials) and confirmed against the bundler's
schema emitter. The rules below are what the emitter implements today.

`fields` mirrors the data shape. A node with a `widget` key is a field; any
other object is a group whose entries are nested fields, and a group's
nesting becomes the field's path in the frontmatter. Declaration order is
the render order. Because `containerFields` is its own subtree, the
editor's "container settings" disclosure pane (see
[design-notes.md](design-notes.md)) falls out structurally, with no flag
needed.

A leaf field carries `widget` (one of `text`, `markdown`, `select`,
`checkbox`, `image`, and others as needed), a human `label`, an optional
`default`, optional `help`, and the constraint keys the validator already
understands (`enum`, `required`, `type`). An array of objects uses
`widget: array` with an `items` field-tree describing one entry.

Composition has two forms, both expanded by the bundler:

- `$use` inserts a partial's fields **under a named key**. `"text": { "$use": "text" }`
  draws the text group from the `text` partial. Sibling keys on the same
  node deep-merge over the inherited fields, so a section can tune one
  inherited field (a different `titleTag` default, say) without redefining
  the group. A partial whose entire `fields` block is a single field also
  resolves through `$use`: the `ctas` partial is one `widget: array` field,
  and `"ctas": { "$use": "ctas" }` yields that array field.
- `$extends` spreads one or more partials' fields **into the current level**
  rather than nesting them. The section-root fields every section shares
  (the `containerFields` wrapper and `isDisabled`) live on the `commons`
  partial, and each section pulls them in with `"$extends": ["commons"]`.

Every `$use` and `$extends` target should also appear in `requires`.

The real `banner` section:

```jsonc
{
  "name": "banner",
  "requires": ["ctas", "text", "image", "commons"],
  "fields": {
    "isReverse": { "widget": "checkbox", "label": "Reverse layout (image on the right)", "default": false },
    "text":  { "$use": "text" },
    "image": { "$use": "image" },
    "ctas":  { "$use": "ctas" },
    "$extends": ["commons"]
  }
}
```

The `text` partial owns its group once, and `commons` owns the shared
section-root wrapper:

```jsonc
// _partials/text
"fields": {
  "leadIn":   { "widget": "text", "label": "Lead-in", "default": "" },
  "title":    { "widget": "text", "label": "Title", "default": "" },
  "titleTag": { "widget": "select", "label": "Title level", "enum": ["h1","h2","h3","h4","h5","h6"], "default": "h2" },
  "isCentered": { "widget": "checkbox", "label": "Center text", "default": false },
  "subTitle": { "widget": "text", "label": "Subtitle", "default": "" },
  "prose":    { "widget": "markdown", "label": "Body", "default": "" }
}

// sections/commons
"fields": {
  "isDisabled": { "widget": "checkbox", "label": "Disable section (hide from build)", "default": false },
  "containerFields": {
    "inContainer": { "widget": "checkbox", "label": "Constrain to container width", "default": true },
    "background": {
      "color":  { "widget": "text", "label": "Background color", "default": "" },
      "isDark": { "widget": "checkbox", "label": "Dark background (use light text)", "default": false }
    }
    // isAnimated, noMargin, noPadding, background.image, background.imageScreen elided
  }
}
```

This retires the emitter's hardcoded banner background (`#333333` with
`isDark: true`): background color and dark-mode become authored fields with
defaults, honoring the rule that dark mode is the author's call and never
inferred.

## The build artifact

The plugin emits `components-schema.json` into the build output where the
admin can fetch it (alongside the other admin assets). Its shape is the
resolved form of the manifests: a map from `sectionType` to the fully
composed, nested field tree, with every `$use` expanded and every default
present. The editor treats it as read-only data. When a component is added
or its fields change, the next build regenerates the artifact and the
editor reflects it with no editor code change. That is the point of the
exercise: adding a section type is data, not code.

## What the editor becomes

Form generation walks the resolved field tree and renders a control per
leaf from its `widget`, grouping `containerFields` into the disclosure
pane. Serialization walks the same tree, reads the bound values, applies
defaults for untouched fields, and writes nested frontmatter; the per-type
branches in [markdown-utils.js](../src/assets/js/utils/markdown-utils.js)
go away. Hydration reads an existing page's `sections` array and, for each
section, maps its values onto the field tree for that `sectionType`,
populating the form. Fields present in the page but absent from the schema
are surfaced rather than silently dropped, so a hand-authored page never
loses data by being opened in the editor.

## Content boundary: frontmatter versus data files

The editor is a frontmatter editor. A Metalsmith page can render content
that lives in its own frontmatter or content resolved at build time from a
data file (`lib/data/*.json`, merged into `metadata.data`) or from
collections. The browser cannot run the build, so it cannot resolve that
indirection, and it must not try.

The schema draws the line cleanly. Where a section depends on a data file,
the manifest exposes a **reference field**, not the content. The `blurbs`
section is the worked example: its template renders
`data.blurbs[section.blurbs.source]`, so the blurb items live in a data file
and the section's `fields` carry only `blurbs.source` (a string naming the
data key), `blurbs.layout`, the `text` header, and `ctas`. The editor edits
the pointer and the surrounding config; the build owns the target. Writing
changes is therefore unambiguous: the editor only ever writes the page
frontmatter, and never the data file.

Sections that take no authored input at all (the auto/chrome types like
`featured-posts`, `blog-list`, `header`, `footer`) carry no `fields`, stay
out of the schema, and are preserved verbatim on round-trip rather than
edited. Two limits follow honestly from this: the editor shows no
build-faithful preview of data-resolved content, and it cannot edit the
referenced items (the blurbs themselves) through a section form.

Editing data-file content is a separate future track. The natural shape
mirrors `components-schema.json`: a build-emitted aggregate data artifact
(every `lib/data` file, e.g. `data.blurbs`) that the editor fetches
read-only to populate reference dropdowns and to preview or edit referenced
content, with the publish Function gaining write access to `lib/data` and a
rebuild regenerating the artifact. It needs a build-pipeline change and is
gated on that artifact; hydration does not wait on it.

## Beyond sections: editing all pages

Section coverage and faithful round-trips are the foundation, but "all
pages" also means decoupling from blog.

**Page abstraction landed.** A draft now has a `pageType` (`post` | `page`).
A `PAGE_TYPES` registry in the emitter maps each type to its output directory
and image root: a post lives under `src/blog/` with a `card` + `tags` +
collection membership and images at `/assets/images/blog/<slug>/`; a page
lives at the top level with an opt-in `navigation` block (no card/tags) and
images at `/assets/images/<slug>/`. The emitter assembles the frontmatter per
type and preserves unmanaged top-level keys via `draft.extra` (the
document-level twin of the section-level lossless walk), so editing a page
keeps its `bodyClasses`/`hasHero`/etc. The publish Function maps `pageType`
to an allowlisted directory (never a client path) and builds the markdown and
image paths from it, staying the security boundary. The editor UI offers a
page-type selector, shows blog-only fields only for posts, and exposes a
"show in menu" toggle with menu label/order for pages; hydration infers the
type from the presence of a `card` block.

What remains for "edit any page": a way to browse and open existing pages
straight from the repo (a Function read endpoint), so editing isn't limited
to local file loads. That builds on this rather than blocking on it.

## Sequence

The change spans three repos, so it is staged to keep each shippable.

1. **Plugin first — done.** `metalsmith-bundled-components` now reads a
   nested `fields` block and emits the composed schema behind an opt-in
   `schema` option (`schema.enabled`, default off; `schema.dest` defaults to
   `assets/components-schema.json`). The resolver handles `$use`, `$extends`,
   leaf-target `$use`, override merge, and array `items`, with unit coverage
   in `test/unit/schema-emitter.test.js`. Letting the content validator
   derive from `fields` instead of the parallel `validation` block is still
   pending and stays a later cleanup.
2. **Library — done.** `fields` authored for the partials (`commons`,
   `text`, `image`, `ctas`, `flip-card`) and every author-facing section:
   `banner`, `text-only`, `media-image`, `hero`, `testimonial`, `composed`,
   `flip-cards`, `slider`, `logos-list`, and the minimal-config
   `collection-list` and `blog-author` (11 sections emitted). `commons` is
   marked `"abstract": true`. The fully auto/chrome sections
   (`featured-posts`, `blog-list`, `blog-navigation`, `header`, `footer`)
   take no authored input, so they carry no `fields` and stay out of the
   schema by design. A few `requires` gaps surfaced and were fixed while
   authoring (`composed` now requires the text/image/ctas it imports,
   `flip-cards` requires `flip-card`, `collection-list` requires `commons`).
3. **Site wiring — done.** The site is on `metalsmith-bundled-components`
   1.1.0 with `schema.enabled` set in `metalsmith.js`; the production build
   writes `build/assets/components-schema.json` (served at
   `/assets/components-schema.json`) with `banner` fully composed, and the
   0.6 -> 1.1 jump left the rest of the build unchanged.
4. **Editor — in progress.** The first thin slice has landed: a schema
   loader (`schema/schema-loader.js`) fetches the artifact once and caches
   it; a generic recursive form renderer (`schema/form-renderer.js`) renders
   any field tree (text, markdown, select, checkbox, image-as-text, and the
   repeatable `array` widget, with `containerFields` collapsing into a
   disclosure pane); a generic serializer (`schema/serializer.js`) walks the
   same tree to emit nested library frontmatter, filling defaults and adding
   the wrapper fields the template needs (`containerTag`, `id`, `classes`).
   `rich-text`, `image-only`, and `banner` run end to end on this path: their
   add buttons materialize defaults from the schema, the form binds into a
   library-shaped values object, and the emitter serializes it (notably
   emitting `text.isCentered`, which the old hand-mapped path dropped).
   Moving `banner` over retired the emitter's hardcoded dark full-width band
   (`#333333`, `isDark: true`, `inContainer: false`): background color, dark
   mode, and width are now authored through the Container settings pane with
   the library's own defaults, honoring the rule that dark mode is the
   author's call. The `image` widget is real: a text field (for
   URLs and hydrated values) plus a file picker that runs the existing
   `processImage` pipeline, so the IndexedDB blob and `draft.imageFiles`
   linkage publish needs is preserved; it fills empty sibling alt/caption on
   upload and shows a thumbnail. The renderer threads an editor context
   (`processFile`, `resolveThumb`, `rerender`) to the image widget without
   coupling itself to the DB. Every author-facing type the editor offers
   (`rich-text`, `image-only`, `multi-media`, `banner`) is now on this path,
   so the lean per-type model, the hand-written `toLibrarySection`, and the
   hand-coded card renderers are gone; the emitter and builder are purely
   schema-driven, and `draft-housekeeping` collects image references
   generically from section values rather than from the old
   `imageName`/`imageId` fields. Loading a draft re-syncs once the schema
   resolves so the preview never lingers on the schema-less fallback. Pure
   logic has node:test coverage in `test/schema-serializer.test.js`; the
   image upload round-trip (pick -> blob -> imageFiles -> emit path) and
   draft persistence were verified in the browser.

   Pre-rename type names (`media-image`, `text-only`, `composed`,
   `blog-navigation`) are aliased to their current names on load so old
   drafts render instead of showing empty cards.

   **Hydration landed.** Loading a `.md`/`.zip` page parses its frontmatter
   with the bundled js-yaml (vendored at `src/assets/js/js-yaml/`, loaded as a
   global in admin.njk; the old line-by-line `parseFrontmatter` couldn't read
   the nested `sections` tree and is now a fallback). `schema/hydrate.js`
   deep-merges each section over its schema defaults so the form renders
   complete, the page's values win, and fields the schema doesn't describe are
   preserved; sections whose type the editor doesn't own (auto/chrome types)
   pass through untouched and show a read-only "preserved on save" note.
   `load-draft.js` maps the nested `seo`/`card`/`tags` into the draft and
   hydrates `sections`. The serializer's `walk` now carries unrecognized keys
   through, so opening and saving a page never drops data. node:test covers
   hydrate + a round-trip; verified in the browser (parse -> hydrate ->
   render -> emit) including unknown-field and unsupported-type preservation.

   Still to do on this stage: nothing blocking. The other library section
   types (hero, slider, columns, and the rest) already render through the
   generic form when added to `SCHEMA_DRIVEN` and given an add button; they
   are held back only until the page abstraction lands.

Validation derivation (folding the dotted `validation` block into `fields`)
comes after the editor works, not before; it is a cleanup, not a
prerequisite.

## First milestone — confirmed

The contract is proven on `banner` before touching the other sections or
writing editor rendering code:

- Schema emit added to the plugin behind a flag.
- `fields` authored for `banner` and the partials it requires (`commons`,
  `text`, `image`, `ctas`).
- The emitted `banner` artifact is a complete, nested field tree: `text`,
  `image`, and `ctas` composed via `$use`, `isDisabled` and the full
  `containerFields` subtree spread in via `$extends`, every default present.
  A form generator can consume it without further massaging.

## Open items before scale-up

- ~~**`commons` emits as a section.**~~ Resolved: the plugin honors
  `"abstract": true` (bundled-components 1.2.0), `commons` carries the flag,
  and the site is on 1.2.0. The emitted artifact lists only the author-facing
  sections (11 of them).
- ~~**How the site consumes the new plugin.**~~ Resolved: published as
  1.1.0 (minor, additive), the site bumped to `^1.1.0`, and `schema.enabled`
  wired into `metalsmith.js`. The build verified clean across the jump.

## Constraints and cautions

- The plugin is published and shared. Keep every change backward
  compatible and opt-in; never make it interpret editor-only keys.
- Changes ripple across three packages. Land the contract in the plugin,
  version it, then migrate the library, then the editor. Do not edit the
  three in a single uncoordinated pass.
- This library is the source of truth for this project (see project
  `CLAUDE.md`), so divergence from the upstream starter is accepted.
  Keeping manifest changes additive also keeps a future upstream sync from
  becoming a merge fight.
- The publish Function remains the security boundary. Generalizing page
  destinations widens its path validation; it does not move the check into
  the UI.

## Keeping this current

This guide tracks an in-progress effort. As stages land, update the
sequence so the doc reflects what is done versus pending, resolve the open
items as they are decided, and keep [editor-guide.md](editor-guide.md) in
step as user-facing behavior changes.
