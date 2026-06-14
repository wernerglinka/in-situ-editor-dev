# The editor's ceiling and config-as-data

A design note capturing where the schema-driven editor naturally stops, why
the obvious escape hatches (Metalsmith in the browser, Metalsmith in the
cloud) are the wrong rabbit hole, and the path that actually raises the
ceiling: making build structure declarative so the editor can edit it as
data. Nothing here is built yet; this is direction to digest, not a spec.

## Three tiers, not two

It is tempting to split the world into "what the editor can do" and "what
needs a developer." There are really three tiers, and only the middle one is
in play:

- **Content.** Pages, sections, images, copy. The editor owns this. It is
  the 80 to 90 percent of day-to-day work.
- **Structure.** Collections, menu shape, where pages live. Today this is
  code in `metalsmith.js`, so it reads as "needs a developer." But most of it
  is *declarative*, which means it does not have to be code.
- **Engineering.** New section components (templates, CSS, manifests), new
  plugins, genuinely novel build behavior. This is real development and
  should stay with a developer.

"Limited editor" is only true if structure stays locked in code. It does not
have to. The point of this note is that the structure tier can move into the
editor without a new engine, and the engineering tier is an appropriate (and
small) place to keep the developer line.

## Why not run Metalsmith in the browser

For a faithful full build, this is not worth it for this stack. The build is
Node-bound: `metalsmith-bundled-components` does filesystem discovery and
bundling, and layouts, permalinks, collections, the pagination plugin, and
the menu plugin all touch `fs` and Node APIs. Running them in a browser means
reimplementing or shimming each one, and staying compatible forever.

There is a narrow, useful version: an in-browser *renderer*, not a builder.
Nunjucks runs in the browser, the component templates are fetchable, and the
data they need could come from a build-emitted snapshot. That would give a
faithful page preview (the thing missing during the blurbs discussion, where
`data.blurbs[source]` cannot be resolved client-side). But note what it does
and does not do: it solves *preview*, not the *config ceiling*. Collections
would still live in `metalsmith.js`. Preview fidelity and structural editing
are separate problems; the browser renderer only addresses the first.

## Why "Metalsmith in the cloud" already exists

The build already runs in a trustworthy place: every publish (PR or direct)
triggers the real Metalsmith build on Netlify, and PR / deploy previews
render the actual site. So "run the builder somewhere safe" is solved.

The lever is not relocating the builder. It is making structure declarative
so the editor can edit it as data and the build we already have consumes it.

## The pattern we already use twice

This project already turns build-time knowledge into data the editor reads:
`metalsmith-bundled-components` emits `components-schema.json`, and the editor
renders forms from it. Hydration reads page frontmatter back into that same
model. The same artifact pattern is the answer to structure:

1. Define structure in a data file (not in `metalsmith.js`).
2. Have the build read that file.
3. Emit a snapshot artifact the editor reads for its pickers and validation.
4. Gate editor writes to the data file through the publish Function.

This is exactly how mature git-based CMSs draw the line. Decap (formerly
Netlify CMS) defines collections in `admin/config.yml`; editors create
entries, the collection definitions are config. Tina does the same with a
schema. Config-as-data is the established answer to "can a content editor
create structure without touching build code."

## How collections actually work, and what changes

The crucial realization: **we do not change what the collections plugin
does.** It still runs at build and builds the whole collection in metadata,
exactly as now. The only thing that changes is where its config object comes
from.

What `collections()` receives today is just a plain object:

```js
.use(collections({
  blog: { pattern: 'blog/*.md', sort: 'card.date:desc' }
}))
```

The declarative version is the same object, lifted into a file:

```jsonc
// lib/data/structure.json
{
  "collections": {
    "blog":     { "pattern": "blog/*.md",     "sort": "card.date:desc" },
    "projects": { "pattern": "projects/*.md", "sort": "card.date:desc" }
  }
}
```

```js
// metalsmith.js: read it, pass it straight in
const structure = JSON.parse(fs.readFileSync('./lib/data/structure.json', 'utf8'));
...
.use(collections(structure.collections))
```

That is the whole build-side change. The plugin still scans the matching
files and populates `metadata.collections.blog` / `.projects` on every build.

**The JSON never holds collection *contents*, only the *definition* (which
folder, how to sort).** The contents are rebuilt fresh from the repo's files
at build time. This is the part that is easy to overthink: the file is just
the arguments to a plugin you already run, externalized as data.

## The data flow

1. An editor (admin) edits `structure.json` through the Function, as a PR, to
   add a `projects` collection. Just a definition.
2. CI runs the build. `metalsmith.js` reads `structure.json`, hands
   `{ blog, projects }` to `collections()`, and the plugin gathers the files
   and builds `metadata.collections.projects`.
3. Pages render against it. A `collection-list` section pointing at
   `"projects"` already works, because the collection name is a reference
   field, the same shape as `blurbs.source`.

The editor only ever touches definitions. The plugin remains the engine.
`metadata.collections` is rebuilt output. The editor never holds collection
contents.

## The rendering side is already built and general

This is worth stressing, because it means config-as-data is the *only*
missing layer, not a rewrite. The component library already renders any
collection, collection-agnostically:

- The `collection-list` section reads `collections[section.collectionName]`
  and paginates it. Its manifest already ships a `collectionName` field, so
  the editor exposes it today as a reference field, the same shape as
  `blurbs.source`.
- The `collection-pagination`, `collection-card`, and `manual-card` partials
  are all general, not blog-specific.
- The `collection-links` section renders previous/next navigation within any
  collection (`collection[name].previous` / `.next`), again driven by a
  `collectionName` reference field.
- The library already runs three collections in production (`blog`,
  `references/sections`, `references/partials`), so "collections beyond blog"
  is proven, not hypothetical.

So a listing page (and prev/next links) for a new collection already work the
moment the collection exists in config. The definition is the only gap.

A note on naming: the `blog` vocabulary scattered through the stack (the
plugin name `metalsmith-sectioned-blog-pagination`, its `blogDirectory`
param, the `'blog'` defaults in the components) is legacy artifact over
machinery that is already collection-generic. Read "blog" as "the default
collection," not as a limitation.

## What it would take

Marked by whether it reuses what exists or is genuinely new:

- **Source of truth (new file).** `lib/data/structure.json` holding the
  collection definitions (and later, menu structure).
- **Build rewire (wiring, no new plugin).** `metalsmith.js` reads the file
  and constructs the `collections()` options from it. `@metalsmith/collections`
  already takes a plain object.
- **Editor read artifact (tiny build step).** Emit the resolved structure to
  `build/assets/structure.json`, the `components-schema.json` pattern again,
  so the editor can populate "which collection" and destination pickers.
- **Editor structure UI (reuse).** A "Manage collections" surface whose form
  is generated from a structure *schema* by the same form-generator that
  drives section editing. The two become one machinery pointed at different
  schemas.
- **Function write path (the one sensitive new piece).** Writing
  `structure.json` through the Function, schema-validated, admin-role-gated,
  and PR-only, so CI builds and validates before anything can break the live
  site.

So "do we need a new plugin?" Mostly no. The collections rewire is
`metalsmith.js` wiring, the artifact emit is a tiny step, and the editor
reuses the form-generator. The real new work is the structure schema, the
build reading config-as-data, and the validated write in the Function. The
cost is not a plugin; it is the safety envelope around letting editors touch
build-affecting config.

## The safety envelope

Structure is config that affects the whole build, not one page, so the blast
radius is the site, not a single file. The envelope:

- **Schema-validate** the payload (reuse the structure schema).
- **Admin-gated.** Structural change is higher privilege than content.
- **PR-only**, never a direct commit, so CI is the safety net before merge.

The Function stays the security boundary, as it does for page and image
writes today.

## Menu: mostly already done

The menu is already config-as-data. `metalsmith-menu-plus` builds the nav
from each page's `navigation` block, which the editor now writes (the page
abstraction work). So *flat* menus are effectively done.

What is left is *nested / grouped* menus (a folder landing page with
children, custom labels, external links). That needs a menu data model and
changes to the nav template. The template work is engineering, not config, so
it is a separate pass.

## Pagination

Already built and already collection-general, despite the plugin's name. The
rendering is done (`collection-list` consumes `section.pagingParams`,
`collection-pagination` draws the controls), and the pagination plugin itself
takes a `collectionName` option that counts from any named collection rather
than scanning a directory. So paginating a `projects` collection is just
invoking the plugin with `collectionName: 'projects'` (plus an output
directory), no plugin code change. The per-collection page size rides on the
same definition:

```jsonc
"projects": { "pattern": "projects/*.md", "sort": "card.date:desc", "paginate": { "perPage": 6 } }
```

So pagination is not a blocker at all. config-as-data just needs to invoke
the already-general plugin once per paginated collection, driven by these
definitions.

## What to defer

- **Nested / grouped menus.** Needs a menu data model plus nav-template work.
  This is the one area that is genuinely template (engineering) work rather
  than config. Listing, prev/next links, and pagination are all already
  general; menus are the exception.

## The product question worth sitting with

Editors, once comfortable, ask for more, so designing for "structure becomes
data" is the forward-looking call. But it is worth deciding deliberately: do
you want editors creating collections and restructuring navigation, or is
"a developer adds a new section type or collection occasionally, editors fill
them endlessly" the healthier division? The architecture can do either; the
answer changes how much of this is worth building.

## A minimal first slice

The slice that proves the whole pattern with zero new security surface:

1. Move the existing `blog` collection definition into `structure.json`.
2. Have `metalsmith.js` read it and build `collections()` from it.
3. Emit `structure.json` to `build/assets/`.
4. Let the editor *read* it to populate the destination / collection pickers.

No editor *writing* yet. That validates the data-driven build end to end.
Editor-writing-structure (the Function piece, with the admin-gated PR-only
envelope) comes second, once the read path is proven.

## The headline

Config-as-data is not a new engine or a new plugin. It is making one config
object declarative, having the build you already run consume it, emitting a
snapshot the editor reads, and wrapping editor writes to it in an
admin-gated, PR-only, schema-validated envelope. The collection contents
never live in the file; only the definition does.
