# Distributing the editor to a new site

The goal is that a fresh
[metalsmith2025-structured-content-starter](https://github.com/wernerglinka/metalsmith2025-structured-content-starter)
site can adopt this editor cleanly: a small set of copied files plus an
install script that wires a couple of plugins and the publish Function.
The editor must not require the host site to be hand-edited per component.

## Why the manifest-driven design carries this

The editor never hardcodes a site's components. The build compiles every
component manifest into one schema artifact
(`/assets/components-schema.json`), and the editor reads it read-only:
`materializeDefaults` builds an empty section, `renderFields` draws the
form, `serializer` writes it back to frontmatter. None of that is per-type.
Point the editor at a different site and it adapts to that site's component
set. So hardening the generic path (full component coverage) is the same
work as making the editor trustworthy to install anywhere.

## Install surface

The two heaviest pieces of machinery are already (or will be) published
Metalsmith plugins, not bespoke glue in the consuming site:

- **Schema generation** — `metalsmith-bundled-components` with
  `schema.enabled: true` (`metalsmith.js`). Already published; a starter
  site already runs the plugin, so this is one option to turn on.
- **Editor artifacts** — `metalsmith-site-data`, a formal plugin package
  (published on npm, a normal `^0.1.0` dependency) exporting two plugins:
  - `pagesArtifact()` → `assets/pages.json`, the page-frontmatter snapshot the
    "Open from site" feature fetches. Runs before `collections()`/`permalinks()`.
  - `dataArtifact()` → `assets/site-data.json`, the `metadata.data` namespace
    plus collection membership, backing the source-driven pickers and preview
    of data-driven sections. Runs after `collections()`, before `permalinks()`.
    Members are the source `.md` keys, so the editor joins to `pages.json`
    rather than duplicating entries.

  This replaced the two ad-hoc `lib/plugins/emit-*-artifact.js` files; the
  package has its own tests and README and is the second leg of the
  plugin-based distribution story (alongside `metalsmith-bundled-components`).

The editor proper is a contained set the install script copies:

- `src/assets/js/editor/*` (incl. `schema/`) — the editor
- `src/assets/js/utils/*` — shared helpers it depends on
- `src/assets/css/admin-styles.css` — admin styles
- `src/admin/index.html` — the admin page
- `netlify/functions/publish.js` + `netlify.toml` — the publish backend
  (Netlify Identity holds the GitHub PAT; role enforcement lives in the
  Function, never the UI)

## This-site coupling to sever

- **The add-menu allowlist.** Done (work item 1): the menu now derives from
  the loaded schema (`getSectionTypes` + `populateAddMenu`), so it offers
  whatever the site emits. The former four-type `SCHEMA_DRIVEN` gate is gone.
- **Legacy draft migration.** Removed. `migrateSection` / `TYPE_ALIASES` /
  `carryLegacyFields` and the bare-`content` wrap existed only to open this
  site's pre-schema drafts. Migration was a self-completing upgrade (it ran on
  open and the next save persisted the new shape), the active draft store was
  already all new-format, and POC drafts live under a different origin and were
  never reachable, so the exposure was nil. `loadSections` keeps a one-line
  crash guard (`sections` defaults to `[]`) and nothing else. If `content`
  authoring is ever wanted, reintroduce a wrap then.
- **Hardcoded paths/hostnames** (basePath, `localhost:3000`,
  `wernerglinka.github.io`) belong to this deployment and must be
  parameterized for the install.

## Work items

1. **Schema-derived add menu.** Done. Removes the keystone coupling and
   unblocks full coverage.
2. **Coverage QA sweep** — mostly done. The method that worked: generate one
   page containing all 39 sections from the editor's own serializer output
   (`scripts/qa-build-page.mjs`), build it through the real component
   templates, and read the rendered DOM plus the build's validation output.
   This beat diffing against the components' example `.yml` and manifest
   `fields` blocks, both of which had drifted from the templates.

   The generic renderer/serializer never crashed; the real gaps were in the
   component manifests (their `fields` blocks not matching their templates),
   fixed in the `nunjucks-components` library and synced here:
   - artwork: `dimensions` was one text field; the template renders
     `{width,height,depth,unit}`. Made it a group.
   - Numeric fields (artist-slider, hero-slider, logos-list, podcast,
     search-only, artwork) used `widget:text`, emitting strings that failed
     number validation. Added a **number widget** and switched them.
   - social-shares `platforms` is a closed enum the section wants as a
     string array; the manifest declared an object array. Added a
     **multiselect widget** and switched it.
   - code `theme` and pricing-table `layout`: enum fields declared as text /
     with a stale enum; corrected to selects matching the template.

   Confirmed: the all-sections build now has zero validation errors and no
   NaN / `[object Object]` / undefined in any section. Data-driven sections
   (collection-links, collection-list, related-posts, blog-author) render
   empty on the QA page because they need the site's collections/author
   data, not because the editor can't author them.

   **Postponed: compound.** Its template loops `compoundSections` and renders
   each child as a full section via the recursive `renderSection` helper, so
   each item is a complete section object (its own `sectionType` plus that
   type's fields). The field-tree schema can't express polymorphic
   section-typed array items, so authoring it needs a new `sections` widget: a
   mini section-builder per child reusing `getSectionTypes` (the type picker)
   + `renderFields(getSectionFields(childType), …)` + `serializeSection` per
   child (thread a `fieldsFor` lookup into the serializer, as `firstSectionImage`
   already does). Decision when resumed: one level only (a compound's type
   picker omits `compound`). The library side is itself unfinished here
   (`compound.yml` has no `compoundSections`, validation has none), so it also
   needs a real example and a validation entry. Deferred by choice for now.

   The legacy-migration baggage (`migrateSection` and friends) has since been
   dropped outright, so `section-builder.js` carries no this-site history.
3. **Package + publish the build plugins.** Done: the two artifact emitters
   are consolidated into `metalsmith-site-data`, published on npm and consumed
   here as a normal `^0.1.0` dependency, with its own tests and README.
   `scripts/install-editor.mjs <target-site>` copies the editor surface (the
   admin page + `admin.njk` layout, the editor JS tree and its vendored libs,
   `admin-styles.css`, the Netlify Function + `netlify.toml`) into a target
   site and prints the remaining wiring (the `npm install`, the `metalsmith.js`
   plugin calls, and the Netlify Identity / Function setup), which are too
   site-specific to patch safely.
4. **Live in-situ preview** — render section cards (or a preview pane) with
   the actual component njk + css so the editor matches published output.
   A separate effort on top of the above.

## Status (end of last session) and next step

Everything above through work item 3 is done and committed. The
`nunjucks-components` library is up to date (all the manifest/widget fixes, the
source-backed select convention, and the code-section Shiki redesign were
merged there).

**Next step (planned for next session): test `scripts/install-editor.mjs`
against a fresh "virgin" `metalsmith2025-structured-content-starter` site.**
Run the script at a clean checkout of the starter, follow the printed manual
steps, and confirm the admin comes up and can author/publish. Things to watch
during that test:

- The starter likely already runs `metalsmith-bundled-components`; the install
  just needs `schema: { enabled: true }` turned on for the editor schema.
- `dataArtifact()` needs `metadata.data` populated before it runs — confirm the
  starter loads `lib/data/*.json` (inline loader or `@metalsmith/metadata`).
- Hardcoded host/basePath values (see "This-site coupling to sever") may need
  parameterizing for a different deploy.
- The install manifest copies the editor frontend + Netlify backend, but **not**
  `nunjucks-filters/markdown-filter.js`: code highlighting is a site-render
  concern, not the editor's. The starter renders prose with its own filter. If
  Shiki highlighting is wanted on the new site too, that is a separate site
  change (this repo's `markdown-filter.js` is the reference — Shiki in marked's
  `code()` renderer; see below).

## Code highlighting (Shiki)

Build-time code highlighting moved from `metalsmith-prism` to **Shiki**, inside
marked's `code()` renderer in `nunjucks-filters/markdown-filter.js` (monokai,
JS regex engine so the filter stays synchronous). Colors are inlined; no theme
stylesheet is needed. This covers prose fenced blocks and the code section
(which also pipes through `mdToHTML`). `metalsmith-prism` is removed.

Open highlighting follow-ups: the editor's **browser preview** still uses the
vendored prism for live highlighting (so preview won't match published output
until it moves to Shiki); and the demo `code-highlighting-demo.md` body text
still says "Prism.js" (stale copy). The code **section** component's Shiki
redesign was handed to the library.
