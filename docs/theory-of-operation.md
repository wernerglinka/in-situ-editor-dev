# The In-Situ Editor: Theory of Operation

This is the definitive technical description of the in-situ editor: what it is,
why it exists, and how every part works. It assumes no prior knowledge of this
project and only passing familiarity with static site generators, because the
editor is a new kind of thing for the Metalsmith world and most readers will be
meeting both at once.

Two audiences are in mind. A developer joining the project should be able to read
this once and know where everything lives and why it is shaped the way it is. A
reader who just wants to understand the ideas (for a talk, an article, or their
own build) should find the "why" behind each decision, not only the "how."

The companion documents go deeper on individual areas and are cross-referenced
throughout: the day-to-day author's guide is `editor-guide.md`; the schema/manifest
contract and its history is `manifest-driven-editor.md`; the packaging model is
`distribution.md`; validation rules are `validation.md`; forward-looking direction
is in `config-as-data.md`; and shorter design records are in `design-notes.md` and
`content-page-mode.md`.


## 1. What it is, in one paragraph

The in-situ editor is a section-building content editor that lives inside a
Metalsmith site. An author opens `/admin/` on their own site, builds a page out
of the site's own components through generated forms, watches the real page render
live beside the form (and edits text directly on that rendered page), and
publishes by opening a pull request or, for admins, committing straight to the
repository. There is no separate CMS server, no database, and no content API. The
editor is static files plus one serverless function, and it edits the same
Markdown-with-YAML-frontmatter files a developer would edit by hand.


## 2. A short Metalsmith primer

Metalsmith is a static site generator built as a pipeline. You give it a source
directory of files, it represents every file as an in-memory object (its parsed
frontmatter plus its `contents`), it runs that set of file objects through an
ordered list of plugins that each transform the set, and it writes the result to
a build directory. A plugin is just a function that receives all the files and
mutates them. There is no runtime and no server: the output is plain HTML, CSS,
and JS.

Two Metalsmith concepts matter for everything below:

- **Frontmatter.** Each content file (`about.md`, `blog/hello.md`) begins with a
  YAML block. In this project that frontmatter is unusually rich: instead of a
  Markdown body, a page carries a `sections` array, where each entry names a
  `sectionType` and holds that section's data. The page's visible content *is*
  structured data.
- **Layouts and Nunjucks.** Templates (here, Nunjucks `.njk` files) turn a file's
  frontmatter into HTML. A single generic template walks the `sections` array and,
  for each entry, includes the component template named by its `sectionType`. So
  rendering a page is: read the `sections` data, dispatch each entry to its
  component, concatenate the HTML.

If you understand "a page is an ordered list of typed sections in YAML, and a
generic renderer dispatches each to a component," you understand the content model
the editor is built around.


## 3. Why this is new for Metalsmith

Metalsmith has always been developer-facing. You edit files and run a build. The
usual ways to add editing are to bolt on an external headless CMS (content lives
in someone else's database, fetched at build time) or a Git-based CMS (a generic
form UI that commits Markdown, but knows nothing about how your site actually
renders). Both decouple *editing* from *rendering*: the person editing does not
see their real page until a separate build runs.

This editor closes that gap in three ways that, together, are novel here:

1. **The forms are generated from the site's own components.** Nobody hand-writes
   an editor form per section type. Each component declares the fields it consumes;
   the build emits those declarations as a single JSON contract; the editor reads
   the contract and generates the form. Add a component to the site and the editor
   gains it with no editor code.
2. **The preview is the real render.** The pane beside the form is not an
   approximation. It is the page rendered by the site's own Nunjucks templates and
   filters, styled by the site's own CSS. What you see is what the build produces.
3. **You edit on the rendered page.** Titles, captions, and button labels are
   editable in place, directly on that live render, while structural changes
   (adding, reordering, removing sections) happen in the form.

The result feels like editing the finished page rather than filling in a form for
a page you cannot see yet.


## 4. The four load-bearing principles

Every design choice traces back to one of these. They are worth stating plainly
because they explain code that otherwise looks like extra work.

**1. Components stay generic; all editing lives in the editor.** The library's
section components and shared partials carry zero knowledge that an editor exists.
They emit no editor markup, no data attributes, no "preview mode." Everything the
editor needs is added by the editor, to the editor's own copy of the rendered
output, after the generic components produce it. This is non-negotiable: a
component installed into any site must render identically whether or not that site
uses the editor.

**2. Contract, not files.** Components install one-directionally from a canonical
library and are local the moment they land; a site may freely change a component's
template, CSS, and JS and owns it thereafter. What stays aligned across sites is
not the files but the *contract*: the emitted `components-schema.json` describing
each component's editable fields. The editor programs against that contract, so it
works on any site that emits one, regardless of how that site has customized its
components.

**3. The preview is the production render (zero drift).** The editor never
reimplements rendering. It calls the same Metalsmith/Nunjucks machinery the build
uses, with the same custom filters and the same data. There is no second copy of
templates or filters to drift out of sync, because there is no second copy.

**4. The server is the security boundary, not the UI.** `/admin/` is publicly
reachable. The UI hides and reveals controls as a courtesy, but every publish is
authorized and validated inside a serverless function that holds the only
credential. Editing the DOM or crafting a raw request changes nothing.


## 5. Architecture at a glance

```
  BUILD (Metalsmith)                          BROWSER (/admin/)
  ┌───────────────────────────┐               ┌────────────────────────────────┐
  │ content + components       │               │  schema-driven form  (left)    │
  │        │                   │   fetches     │        │  edits                 │
  │        ▼                   │  ───────────▶ │        ▼                        │
  │  emits 3 JSON artifacts:   │               │  draft model (localStorage +    │
  │   • components-schema.json │               │   IndexedDB for images)         │
  │   • site-data.json         │               │        │  POST frontmatter      │
  │   • pages.json             │               │        ▼                        │
  │        │                   │               │  render endpoint ──▶ iframe     │
  │        ▼                   │   POST        │   (generic render)   (right)    │
  │  renders the real site     │ ◀───────────  │        │  client annotates DOM  │
  └───────────────────────────┘               │        ▼  → inline edit in page │
             ▲                                 │  publish  ──────────┐           │
             │                                 └─────────────────────┼──────────┘
             │                                                       │ Bearer JWT
             │                    ┌──────────────────────────────────▼─────────┐
             │   rebuild          │  Netlify Function (holds GitHub PAT):        │
             └────────────────────│  validate → commit / open PR → GitHub        │
                                  └──────────────────────────────────────────────┘
```

The build feeds the editor three read-only JSON snapshots. The editor generates
forms from one of them, holds an in-progress draft entirely in the browser, and
gets a faithful preview by posting the draft to a render endpoint that runs the
real templates. Publishing hands the draft to a function that authorizes it and
writes it to the repository, which triggers a normal rebuild. The loop is closed:
what the build renders is what the editor previews and what publishing commits.


## 6. Layer 1: The build and its artifacts

The build is an ordinary Metalsmith pipeline (`metalsmith.js`). What makes it
editor-aware is only that it emits three JSON artifacts the browser can fetch. It
adds no editor logic to the render itself.

### The pipeline, in order

The order is load-bearing; each step mutates the shared file set or metadata for
the next. Abbreviated (see `metalsmith.js:103-320`):

1. **Load data files** (`metalsmith.js:136-147`). A small inline plugin reads every
   `lib/data/*.json` into `metadata().data` (so `site.json` becomes `data.site`).
   It runs on every build, including watch rebuilds, so data edits are live.
2. **`drafts`** (`metalsmith.js:150`). Drops files marked `draft: true` in
   production, keeps them in development. Runs early so nothing downstream sees
   dropped files.
3. **`pagesArtifact()`** (`metalsmith.js:159`, from `metalsmith-site-data`).
   Snapshots each page's clean authored frontmatter, keyed by source `.md` path,
   *before* collections and permalinks mutate things. Produces `pages.json`.
4. **`collections`** (`metalsmith.js:165-172`). Builds `metadata().collections.blog`
   as an ordered array (newest first by `card.date`).
5. **`dataArtifact()`** (`metalsmith.js:182`). Snapshots `metadata().data` plus, per
   collection, the ordered list of member source paths. Runs after collections (so
   membership exists) and before permalinks (so those keys still match
   `pages.json`). Produces `site-data.json`.
6. **Pagination, permalinks, menus** (`metalsmith.js:190-224`). Blog-index
   pagination; clean-URL rewriting (`foo.md` becomes `foo/index.html`, after which
   file keys are no longer source paths, which is exactly why the two artifact
   plugins run before it); an opt-in main menu built only from pages carrying a
   `navigation` block.
7. **`layouts`** (`metalsmith.js:245-252`). Applies Nunjucks templates to every
   `**/*.html`, with the template search path set to `lib/layouts` and the custom
   filters injected (see below).
8. **`safeLinks`, `componentDependencyBundler`** (`metalsmith.js:263-286`).
   External-link hardening; bundling the components' CSS/JS; and, with
   `schema: { enabled: true }`, emitting `components-schema.json`.
9. **Production-only tail** (`metalsmith.js:289-320`): image optimization, SEO tags
   and sitemap, HTML minification. Skipped in development so the editor loop stays
   fast, while the two artifact plugins run unconditionally.

### The three artifacts

All three are written straight into the build's file set at `assets/…` keys, so
they land in `build/assets/` and are served at `/assets/*.json`. The editor
fetches them as static files, with no server access.

- **`components-schema.json`** is the editor contract. It is an object keyed by
  section type (39 at the time of writing), each value `{ name, fields }`, where `fields`
  is a fully resolved nested field tree. It is generated by
  `metalsmith-bundled-components` from each component's `manifest.json` `fields`
  block, expanding `$use` (insert a named partial's fields under a key) and
  `$extends` (spread partials' fields in place) so shared field groups (text,
  image, ctas, the section commons) are declared once and composed. Section-level
  commons (`isDisabled`, `containerTag`, `id`, `classes`, `containerFields`) are
  injected on every section root. Leaves carry a `widget` (`text`, `textarea`,
  `markdown`, `number`, `checkbox`, `select`, `multiselect`, `image`, `array`) plus
  optional `label`, `default`, `enum`, `required`, and `source`. See
  `manifest-driven-editor.md` for the field format in full.
- **`site-data.json`** is `{ data, collections }`. `data` is the `lib/data`
  namespace verbatim (author list, site config, and so on). `collections` maps each
  collection name to its ordered array of member source `.md` paths. A consumer
  joins those paths against `pages.json` rather than duplicating frontmatter.
- **`pages.json`** is a flat object keyed by source `.md` path, each value
  `{ frontmatter, content }`, a snapshot of every published page. This is what
  "Open from site" browses and what the preview uses to reconstruct collections.

### Nunjucks and the custom filters

Rendering uses `@metalsmith/layouts` with the `jstransformer-nunjucks` transformer
(`metalsmith.js:245-252`). The custom filters live in `nunjucks-filters/`; the
whole module namespace is handed to the engine (`metalsmith.js:59-68`), so each
named export becomes a filter of the same name. The important one for content is
`mdToHTML`: because pages carry structured sections rather than a Markdown body,
prose fields are Markdown that the templates convert with this filter. The set an
editor render must reproduce faithfully is exactly this set, which is why the
preview reuses it rather than shipping its own (Section 9).

### The admin page and static assets

The admin page is `src/admin/index.html` (an `.html` file, so it bypasses the
`.md`-scoped steps) wrapped by `lib/layouts/admin.njk`, output at `build/admin/`
and served at `/admin/`. The layout loads the site's own `main.css`/`main.js`
first, then the editor's styles and vendored libraries, the Netlify Identity
widget, and finally the editor entry module `js/editor/create-post.js`
(`admin.njk:35-114`). Everything under `src/assets/` is copied verbatim to
`build/assets/` by Metalsmith's native static passthrough (`metalsmith.js:125`),
which is where the editor's own JS and CSS live.


## 7. Layer 2: The schema-driven form engine

This is the heart of the editor and the reason it needs no per-section code. One
generic engine renders, serializes, and round-trips *any* section type from the
contract. It is documented at depth in `manifest-driven-editor.md`; what follows
is the runtime mechanics.

### Loading the contract

`schema-loader.js` fetches `/assets/components-schema.json` once and caches it
(`schema-loader.js:19-39`), resetting the cache on failure so a later call retries.
`getSectionFields(type)` returns that type's field tree; `getSectionTypes()`
returns the sorted list of all types, which is literally the "Add a section" menu.
A sibling `site-data-loader.js` does the same for `site-data.json`, backing select
fields whose options come from site data (author names, collection names).

### Generating a form from a field tree

`renderFields(fields, values, onChange, ctx)` (`form-renderer.js:548`) walks the
field tree and the live values object together, dispatching on node kind:

- **Leaves** (a node with a string `widget`) become one labeled control. The
  builders cover text, markdown (a textarea plus an "Expand" button into a
  full-screen Markdown overlay), number (kept a real number, empty stays unset),
  select (options from an `enum` or from `source` site data), checkbox, multiselect
  (an array kept in enum order), and image (a URL/filename input, an upload button
  wired to the draft's image pipeline, and a thumbnail). Every control reads and
  writes its value in place on the values object and calls `onChange`.
- **Groups** (a nested object) render as a collapsible disclosure: open at the top
  of a section, collapsed when nested, so deep forms stay scannable.
- **Arrays** (`widget: array`) render as repeatable collapsible cards with
  add/move/remove, each card recursing into `items`. A hero slider's slides or a
  section's CTAs are arrays.
- **Discriminators.** When a `select` leaf's enum values name sibling groups (for
  example multi-media's `mediaType` naming `image`/`video`/`audio`/`icon`/`lottie`),
  the engine shows only the selected variant and re-renders on change. This is
  detected structurally (`form-renderer.js:604`), so an ordinary select is never
  mistaken for one.

Section-level settings (`isDisabled`, `containerTag`, `id`, `classes`) are ordinary
schema leaves that the engine simply hoists to the top of the form;
`containerFields` is an ordinary group the engine simply styles as a closed pane.
There are no special cases in the data, only presentation choices in the renderer.

The "Add a section" menu is filled from `getSectionTypes()`
(`section-builder.js:291`), so adopting a new component is a matter of data, not
code. Creating a section materializes its defaults from the field tree.

### The serialize / hydrate round trip

A section's *values object* (what the form mutates) and the *emitted frontmatter*
(what templates render) are deliberately near-identical, because both are
materialized from the same field tree. Two functions bridge them:

- **Serialize** (`serializer.js`): a structural walk that fills any missing leaf
  from its default, rewrites uploaded image filenames to their published paths, and
  coerces numbers. Crucially it first copies through every key the schema does not
  describe, so wrapper fields and any hand-authored field the schema lacks survive.
- **Hydrate** (`hydrate.js`): the inverse, used when opening an existing page. It
  deep-merges the page's values over the schema defaults, preserving unknown keys,
  and passes through untouched any section whose type the site does not own (shown
  in the form as "preserved unchanged when you save").

Because unknown fields survive in *both* directions, opening and re-saving an
arbitrary hand-authored page is non-destructive. That is what lets the editor be
introduced to an existing site without risk.


## 8. Layer 3: Drafts and local storage

An in-progress page is a *draft*, and drafts live entirely in the browser until
published. There is no server-side draft state.

Text and metadata live in `localStorage` under `blog-drafts` (a JSON array of
draft objects) with `current-draft-id` tracking the active one
(`draft-manager.js:12-30`). A draft object carries its page type and body mode, the
metadata fields, the `sections` array, and an `imageFiles` list of
`{ name, id, type }` descriptors. Image *bytes* never touch `localStorage`; they
live in IndexedDB (`db-storage.js`), keyed by a draft-prefixed id, and sections
reference them only by filename. That filename-as-reference model is what lets
housekeeping, preview, publish, and zip export all join sections back to blobs.

The autosave path is one function, `updateDraftData` (`draft-manager.js:124`),
called on every edit: it reads the form back into the draft, pulls the sections,
folds in any AI results and translations, and saves. Housekeeping
(`draft-housekeeping.js`) runs before publish/download and after delete; it walks
each draft's referenced image names (deliberately over-inclusive, since keeping an
unused blob is safe but deleting a referenced one is not) and purges orphaned
IndexedDB entries.

Because drafts are per-browser and per-site, the guide is explicit that clearing
site data deletes them, and offers a zip save (mirroring the repo layout) as an
outside-the-browser backup. Two flows load existing content back in: opening a
saved `.md` or `.zip`, and "Open from site," which reads `pages.json` and hydrates
a published page through the exact same path as a file
(`open-from-site.js`, `load-draft.js`).


## 9. Layer 4: The live rendered preview

The right-hand pane shows the page as the site will actually render it. It has two
views, toggled at its top: **Rendered** (the default) and **YAML** (the emitted
frontmatter, useful for debugging and as a fallback).

The Rendered view works by posting the draft's serialized frontmatter to a small
render endpoint, `netlify/functions/preview.js`, which returns the page as HTML,
injected into an iframe so it carries the site's real CSS and JS. The endpoint is
read-only and needs no authentication; it just renders content the client already
holds.

The endpoint's core, `netlify/functions/lib/render-page.js`, is where "zero drift"
is enforced. It builds a Nunjucks environment rooted at the site's own
`lib/layouts`, registers the site's own `nunjucks-filters`, loads the site's own
`lib/data`, and renders `pages/sections.njk` (or `pages/simple.njk` for a
content-mode page). It is, deliberately, the production render with nothing added:
the returned HTML contains no editor markup at all.

Two details make the preview faithful for a single unsaved draft:

- **Real collection data.** Sections that draw on site-wide collections (related
  posts, collection lists, the author block) would have nothing to show for a lone
  draft. The endpoint reconstructs the `collections` context from the build
  artifacts, joining `site-data.json`'s membership lists against `pages.json`'s
  per-page frontmatter (deriving each member's permalink from its path, sorting
  newest-first), so those sections render real content from the last deploy. The
  only parts that cannot be reproduced for an unsaved draft are the ones that depend
  on where the page will land in its collection (previous/next links, page
  numbers), which render empty until publication.
- **Generic components, untouched.** The endpoint does not turn on any "preview
  mode" in the templates, because there is none. The source-mapping the editor
  needs is added later, client-side (Section 10).

The one operational requirement is that the render endpoint be running. Locally
that means `netlify dev` (which proxies Functions alongside the dev server) rather
than the plain `npm start`; if the endpoint is unreachable the pane says so and the
YAML view still works.


## 10. Layer 5: In-situ inline editing

This is where Principle 1 (components stay generic) meets the wish to edit on the
rendered page, and the two are reconciled entirely on the editor side.

The rendered HTML that comes back from the endpoint has no editor attributes. So
after each render, the client walks the iframe's DOM and *annotates* it
(`editor-logic.js`, `annotateInlineFields`). It does this using two things the
editor already knows: the draft's own section list (order, types, values) and the
stable class names the generic partials emit (`.title`, `.lead-in`, `.sub-title`,
`.prose`, `.caption`, `.ctas a`).

The annotation:

1. Aligns the rendered section wrappers to the draft's non-disabled sections, in
   order, and stamps each with its true section index.
2. Within each wrapper, tags the editable fields by class, but only when the
   section's own values actually have that field at the top level. This guard is
   what keeps a slider (whose text lives per-slide, not at the section root) from
   having a slide's title mistaken for the section's, without any per-type code.
3. For CTAs, maps each rendered link back to its true index in the section's array
   (skipping any url-less entries that did not render), and wraps just the label
   text in an editable span so the icon is left alone.

With the DOM annotated, editing is wired: plain-string fields become
`contenteditable` and commit on blur; Markdown prose opens its Markdown overlay on
click; and link clicks in the preview are swallowed so editing a button or a linked
caption never navigates away.

The write-back is the elegant part. An inline edit does not mutate the model
directly. It finds the *form control* that owns that field (matching the section
index and field path against the form's own `data-field-path` attributes) and sets
its value and dispatches an `input` event. From there the existing pipeline does
everything: the form control's handler mutates the draft, persistence runs, and the
preview re-renders. The form and the page stay in step because the page drives the
form, and there is exactly one write path.

What is editable in place today: titles, lead-ins, subtitles, image captions, and
CTA labels, including on slider slides. Everything structural (adding, reordering,
removing sections, choosing images, adding a field that is currently empty) stays
in the form. Text edits feel instantaneous because `contenteditable` shows them as
you type; structural changes take the moment the preview needs to re-render.


## 11. Layer 6: Publishing

Publishing turns a browser draft into a commit in the site's Git repository, and
its entire security model rests on Principle 4: the boundary is the function, not
the UI.

The browser posts the generated Markdown (and base64-encoded images) to
`/.netlify/functions/publish.js` with a Netlify Identity JWT in the
`Authorization` header. The GitHub credential (a personal access token) never
reaches the client; it lives only in the function's environment, and every GitHub
call attaches it server-side.

Inside the function (`netlify/functions/publish.js`):

- **Identity and role.** Netlify verifies the JWT and injects the user; no user is a
  401. Roles come from the user's `app_metadata`. Publishing directly to the main
  branch requires the `admin` role (a 403 otherwise); opening a pull request is
  available to any signed-in user. The UI hides the direct-publish button for
  non-admins, but that is cosmetic; the function's check is the real gate.
- **Validation before any path is built.** The slug must match `^[a-z0-9-]{1,100}$`
  and image names a similarly strict pattern; the page type must be a known key;
  destinations are drawn from a hardcoded allowlist, never from the client. The only
  paths the function can ever write are `<dir>/<slug>.md` and
  `<imageDir>/<slug>/<name>`, so a crafted payload cannot escape into, say,
  `.github/workflows/`.
- **Commit mechanics.** PR mode creates a branch off the default branch, commits the
  file and images there, and opens a pull request. Direct mode commits to the
  default branch. Both go through the GitHub Contents API, reusing an existing
  file's blob SHA so updates do not conflict. Either way, the commit triggers a
  normal rebuild, and the loop closes.

Local development without Identity uses `?admin=true`, which sets a flag that
reveals the editing surface (`admin.njk:53-101`). It unlocks *visibility* only:
it grants no JWT, so the publish function still rejects any tokenless request. You
can compose and preview locally; publishing for real always requires signing in.


## 12. Layer 7: AI assistance

The editor integrates Chrome's built-in, on-device AI (the `Summarizer`, `Writer`,
`Rewriter`, `Translator`, `LanguageDetector`, and `LanguageModel` browser APIs).
Every feature is capability-gated and degrades gracefully: each checks for its API
and simply stays hidden when absent, so the editor works normally in any browser
without them. A master toggle, persisted in `localStorage`, turns the whole set on
and lazy-loads the feature modules.

The features: title and description suggestions (Summarizer), tag suggestions
constrained to a taxonomy (LanguageModel), prose expansion and rewriting with
tone/length controls that preserve embedded figures (Writer/Rewriter), image alt
and caption generation on upload (multimodal LanguageModel), and per-locale
translation that writes localized copies into the draft (Translator). A
classification feature is present but inert pending a decision on a non-built-in
API. The AI is assistance layered on top; nothing about authoring or publishing
depends on it.


## 13. Layer 8: Distribution

This repository is the editor's development *fixture*: a full Metalsmith site where
the editor is built and exercised. The thing that ships is a separate,
zero-dependency npm package, `@wernerglinka/in-situ-editor`, materialized from this
fixture by `scripts/export-editor.mjs`. A single manifest,
`scripts/editor-manifest.mjs`, is the one source of truth for what the editor's
surface is: the admin page and layout, the editor's JS and vendored libraries, the
admin styles, and both serverless functions (publish and preview) plus their
config. The same manifest drives the installer (`scripts/install-editor.mjs`, the
package's `bin`) that copies the surface into a consuming site.

Because of Principle 1, the exported package is self-contained. A site with stock,
generic components gets the full rendered preview and inline editing from the
editor package alone; nothing needs to be added to the site's component library.
The consuming site supplies only what any starter-derived site already has: the
components, the `nunjucks-filters`, and a build that emits the three artifacts. See
`distribution.md` for the packaging model in detail.


## 14. End to end: authoring a post

Tying the layers together, here is the life of a blog post:

1. The author opens `/admin/?admin=true` (local) or `/admin/` and signs in (live).
   The editor boots, loads the schema and site data, and shows an empty draft.
2. They set the title and pick "Blog post," then choose "Rich Text" from the
   "Add a section" menu. The engine reads that type from the schema and generates
   its form. They fill in a title and some Markdown prose.
3. Every keystroke updates the draft in `localStorage` and, debounced, posts the
   serialized frontmatter to the render endpoint. The real page comes back and
   renders in the iframe, styled by the site's CSS. The client annotates it, and
   the author edits the title directly on the rendered page; the change flows back
   through the form and re-renders.
4. They add an image section and upload a photo. The bytes go to IndexedDB; the
   section stores the filename; a thumbnail appears; and (if AI is on) alt and
   caption are suggested.
5. They click "Publish (as PR)." The browser generates the Markdown, base64-encodes
   the image, and posts both with the Identity JWT. The function validates the slug,
   creates a branch, commits `src/blog/<slug>.md` and the image, and opens a pull
   request.
6. The site owner merges. Netlify rebuilds. The post is live, `pages.json` now
   includes it, and it appears in "Open from site" for future editing.


## 15. Design decisions and trade-offs

The choices most worth understanding, and what was traded for them:

- **Server-render the preview instead of running Nunjucks in the browser.**
  Rendering in the browser would work offline and instantly, but it would fork the
  templates and the ~35 custom filters into a second copy that drifts from the
  build. Server-rendering keeps a single source of truth at the cost of needing the
  endpoint running (`netlify dev` locally). Fidelity beat convenience.
- **Annotate the rendered DOM client-side instead of marking up templates.** An
  earlier version added editor attributes into the component templates behind a
  "preview mode" flag. It was byte-identical in production, but it still put editor
  knowledge into generic components, violating Principle 1. Moving all annotation
  into the editor keeps components pristine; the cost is that the editor maintains a
  small amount of structural knowledge (the partials' class names), which is
  correctly the editor's concern.
- **Drive the model through the form, not directly.** Inline edits set form
  controls and dispatch events rather than mutating the draft. This reuses one
  write path for both surfaces, so they cannot disagree, at the cost of a lookup
  from rendered element to form control (the `data-field-path` mapping).
- **Drafts in the browser, publish via Git.** No CMS server and no database means
  nothing to run or secure beyond one function, and content stays plain files in
  the repo. The trade is that drafts are per-browser and the preview's collection
  data is only as fresh as the last deploy.
- **The function is the only trusted code.** Putting all authorization and
  validation server-side, with the credential never in the client, means `/admin/`
  can be public and the UI can be permissive without weakening security.


## 16. Where things live (code map)

- **Build and artifacts:** `metalsmith.js`; `nunjucks-filters/`; `lib/data/`;
  emitted `build/assets/{components-schema,site-data,pages}.json`.
- **Components (generic, no editor knowledge):** `lib/layouts/components/`
  (sections, `_partials`, `_helpers/sections-renderer.njk`); page templates in
  `lib/layouts/pages/`.
- **Schema-driven form engine:** `src/assets/js/editor/schema/`
  (`schema-loader`, `form-renderer`, `field-utils`, `serializer`, `hydrate`,
  `site-data-loader`); `src/assets/js/editor/section-builder.js`.
- **Boot and UI:** `src/assets/js/editor/create-post.js` (entry),
  `editor-init.js`, `editor-ui.js`, `ui-elements.js`.
- **Drafts and storage:** `src/assets/js/drafts/`; `src/assets/js/utils/db-storage.js`;
  `src/assets/js/editor/image-handler.js`.
- **Preview and inline editing:** `netlify/functions/preview.js`,
  `netlify/functions/lib/render-page.js`, `src/assets/js/editor/editor-logic.js`;
  `src/assets/js/utils/markdown-utils.js` (frontmatter emission).
- **Publishing and identity:** `netlify/functions/publish.js`,
  `src/assets/js/editor/publish.js`, `identity.js`, `lib/layouts/admin.njk`.
- **AI:** `src/assets/js/ai/`.
- **Export/import and distribution:** `src/assets/js/export/`;
  `scripts/{editor-manifest,install-editor,export-editor}.mjs`; `netlify.toml`.
- **Admin page:** `src/admin/index.html`; styles `src/assets/css/admin-styles.css`.


## 17. Glossary

- **Metalsmith:** a plugin-pipeline static site generator; input files become
  in-memory objects, plugins transform them, output is written to disk.
- **Frontmatter:** the YAML block atop a content file. Here it carries a `sections`
  array rather than a prose body.
- **Section:** one entry in a page's `sections` array, tagged with a `sectionType`.
- **Component:** the template (plus CSS/JS) that renders a section type; lives in the
  generic library and carries no editor knowledge.
- **Manifest / schema / contract:** a component's `manifest.json` declares its
  editable `fields`; the build composes all of them into
  `components-schema.json`, the contract the editor reads.
- **Collection:** a named, ordered group of pages (for example the blog), built by
  `@metalsmith/collections`.
- **Permalink:** the clean URL a source path maps to (`blog/hello.md` to
  `/blog/hello/`).
- **Draft:** an in-progress page held in the browser (`localStorage` plus IndexedDB)
  until published.
- **Render endpoint:** the serverless function that renders a draft through the
  site's real templates for the preview.
- **Netlify Identity / Function:** the auth provider issuing the JWT, and the
  serverless function that holds the GitHub credential and is the security boundary.


## 18. Related documents

- `editor-guide.md` : the author-facing how-to.
- `manifest-driven-editor.md` : the schema/manifest contract and its rationale.
- `distribution.md` : the fixture-vs-package model and installer.
- `validation.md` : validation rules.
- `config-as-data.md` : forward-looking direction (editing build structure as data).
- `design-notes.md`, `content-page-mode.md` : shorter design records (treat as
  history where they predate the current implementation).
