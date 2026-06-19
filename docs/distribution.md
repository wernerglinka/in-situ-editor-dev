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
4. **Publish the editor as an npx installer.** Done. This repo is now also the
   published package `@wernerglinka/in-situ-editor`: `scripts/install-editor.mjs`
   is the `bin`, a `files` whitelist ships only the editor surface (the 75 files
   in the install manifest — admin page + layout, the editor JS tree + vendored
   libs, `admin-styles.css`, the Netlify Function + `netlify.toml`), and the
   target defaults to the current directory. The intended workflow is now: clone
   the aligned starter, `cd` in, run `npx @wernerglinka/in-situ-editor`, then
   follow the printed wiring. **Vendor-everything by design** — the editor is
   copied into the site and committed there (that is the point of an in-situ
   editor); updates are a re-run with `--force`.

   Because the installer only uses Node built-ins, the published package is
   zero-dependency: the site/build packages were moved to `devDependencies` so
   `npx` does not drag metalsmith/shiki/`sharp` through a file-copy install (the
   dev site still gets them via `npm install`; `metalsmith.js` now merges
   dev+prod deps for its version metadata). This also retires any need to
   conform this repo's own chrome to the library's chrome model — the install
   adapts `admin.njk`'s header/footer includes to whatever the cloned starter
   uses, so the editor never has to move header/footer out of its component set.

   Verified end to end (2026-06-19): `npm pack` → install the tarball into a
   fresh starter clone → `npx in-situ-editor` (no args, target = cwd) → copies
   the surface, adapts the chrome, builds, admin renders.
5. **Live in-situ preview** — render section cards (or a preview pane) with
   the actual component njk + css so the editor matches published output.
   A separate effort on top of the above.

## Status (end of last session) and next step

Everything above through work item 3 is done and committed. The
`nunjucks-components` library is up to date (all the manifest/widget fixes, the
source-backed select convention, and the code-section Shiki redesign were
merged there).

**Virgin-starter install test: passed (2026-06-19).** Ran
`scripts/install-editor.mjs` against a fresh local clone of
`metalsmith2025-structured-content-starter`, built it, and confirmed in the
browser that the admin comes up and authors against the starter's own emitted
schema. What the test established:

- The starter is already aligned on the two heavy prerequisites and needs no
  hand-editing for them: it runs `metalsmith-bundled-components` with
  `schema: { enabled: true }` (emits `components-schema.json`), and it loads
  `lib/data/*.json` into `metadata().data` via an inline loader.
- The editor mounted inside the starter's chrome, the add-section menu was
  populated from the starter's schema (its 12 authorable sections, not this
  repo's 42), and the live frontmatter preview emitted
  `layout: pages/sections.njk` with the `seo`/`card` blocks the starter renders.
- The one console 404 was `assets/site-data.json` — the not-yet-wired
  `metalsmith-site-data` artifact (`dataArtifact()`), expected and non-blocking
  for authoring. `components-schema.json` served 200.

**The one fix the test forced** is now in `install-editor.mjs`: `admin.njk`
hardcodes this repo's chrome convention
(`{% include "components/sections/header/header.njk" %}` / `footer`), but a
starter-derived site renders chrome from `pages/parts/header.njk` / `footer.njk`.
Copying `admin.njk` verbatim made Nunjucks throw on the missing include. The
install script now reads the target's own page layout
(`lib/layouts/pages/default.njk`, falling back to `sections.njk`) and rewrites
`admin.njk`'s header/footer includes to whatever convention that site uses. It
also prints a step to review the POC globals in `admin.njk` (`window.AUTHORS`,
the locale globals).

**Remaining to exercise the full path on a real deploy** (the manual steps the
script prints, untested locally because they touch npm + Netlify): `npm install
metalsmith-site-data`, wiring `pagesArtifact()`/`dataArtifact()` into the
pipeline (which clears the `site-data.json` 404 and lights up "Open from site"
and the data pickers), and Netlify Identity + the Function PAT for real
publishing. Other notes still in force:

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
