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
- **Pages artifact** — `lib/plugins/emit-pages-artifact.js`, the read-only
  snapshot of page frontmatter the "Open from site" feature fetches. Local
  today; to be published as `metalsmith-emit-pages-artifact` (work item 3).
- **Data artifact** — `lib/plugins/emit-data-artifact.js`, the read-only
  snapshot of the `metadata.data` namespace plus collection membership
  (`assets/site-data.json`), so sections that consume data files or
  collections can be authored/previewed against the site's real data. Local
  today; another publishable module. Collection members are the source `.md`
  keys, so the editor joins to `pages.json` rather than duplicating entries.

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
3. **Publish `metalsmith-emit-pages-artifact`** and write the install
   script. Largely independent; lands once 1 and 2 settle the editor shape.
4. **Live in-situ preview** — render section cards (or a preview pane) with
   the actual component njk + css so the editor matches published output.
   A separate effort on top of the above.
