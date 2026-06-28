# Content-body page mode

Status: implemented. This document is kept as the design record; the user
guide is `docs/editor-guide.md` ("Body mode: sections or content").

One correction surfaced during the build: the rendering side was **not**
already done. The build has no markdown plugin (by design), so `simple.njk`'s
`{{ contents | safe }}` shipped raw markdown. It now pipes the body through
`string | mdToHTML`. Everything else below matched the implementation.

## Stale extras are cleaned on conversion

The editor carries unmanaged top-level frontmatter through `draft.extra` so a
section page round-trips losslessly. Some of those keys are section-layout
presentation hints (`hasHero`, and a `bodyClasses` of `sections-page`) that are
meaningless on a content page. Converting a section page to content mode would
otherwise drag them along, and that kind of cruft accumulates and bites later.

So content mode sheds the section-layout keys on emit (`SECTION_LAYOUT_KEYS` in
`markdown-utils.js`) and sets a clean `bodyClasses: content-page`; genuinely
unknown keys are still preserved. The cleanup is emit-only — the draft keeps
the keys, so switching back to section mode re-emits them unchanged, and the
generic round-trip guarantee for section pages is untouched.

## Why

Some authors want to create a simple page or post that is just frontmatter
plus a single markdown content body, rather than building it out of sections.
The editor today is section-only. This adds a second authoring mode alongside
the section builder.

Decisions already made:

- Content mode is available for **both posts and pages** (not pages only).
- The body is edited in a **plain markdown textarea** (no WYSIWYG dependency).

## Where things stand today

The editor is section-only. Every page it produces, post or page, gets
`layout: pages/sections.njk` and a `sections:` array, with an empty markdown
body. That is hardcoded in the `PAGE_TYPES` registry
(`src/assets/js/utils/markdown-utils.js:105-108`), and `generateMarkdown()`
always emits `---\n{frontmatter}\n---\n` with no body
(`src/assets/js/utils/markdown-utils.js:198`). The `content` parameter it
accepts is currently unused (`:161`).

The `pageType` axis ("post" vs "page") controls the publish destination
(`src/blog/` vs `src/`) and which metadata fields show (card/tags/date for
posts, nav fields for pages). It does **not** control layout, and should not
be overloaded to.

The rendering side is already done. `lib/layouts/pages/simple.njk` exists and
renders a markdown body:

```njk
{% extends "pages/default.njk" %}
{% block body %}<div class="container flow">{{ contents | safe }}</div>{% endblock %}
```

So the site can already serve content-body pages; the editor just cannot
author them.

## Design

Add a second axis to the draft, `bodyMode` of `"sections"` or `"content"`,
independent of post-vs-page. A page or post is either section-built or a
single markdown body. This keeps the destination/metadata logic untouched and
makes the layout choice explicit.

Content mode emits:

- `layout: pages/simple.njk`
- the form's metadata blocks (`seo`, plus `card` + `tags` for posts, or
  `navigation` for pages)
- **no `sections` key**
- the markdown body after the closing `---`

Sections mode is unchanged.

## Touch points

1. **Draft model** — add `bodyMode` (default `"sections"`) to the blank draft
   in `createNewDraft()` (`src/assets/js/drafts/draft-manager.js:47-61`) and
   persist the markdown body in the existing `content` field. Capture both in
   `updateDraftData()`.

2. **Emitter** — in `generateMarkdown()`
   (`src/assets/js/utils/markdown-utils.js:165-199`) branch on `bodyMode`.
   Content mode emits the `simple.njk` layout, omits `sections`, and appends
   the markdown body. The `PAGE_TYPES` layout field becomes per-mode (or the
   layout is chosen in the branch).

3. **Load round-trip** — `draftFromMetadata()`
   (`src/assets/js/drafts/load-draft.js:42-65`) must set `bodyMode: "content"`
   when `layout` is `pages/simple.njk` (or there is a body and no `sections`),
   and read the markdown body into `draft.content`. Without this, editing an
   existing simple page would silently convert it back to sections.

4. **UI** — add a mode toggle near the page-type dropdown in
   `src/admin/index.html`, restore a real content textarea (there is a
   vestigial hidden `#post-content` to repurpose), and extend `applyPageType()`
   (`src/assets/js/editor/editor-ui.js:38-56`) to show the textarea and hide
   the section builder in content mode, following the existing
   `.post-only` / `.page-only` CSS-class pattern.

5. **Publish Function** — largely free. `netlify/functions/publish.js` routes
   on `pageType` (unchanged) and writes whatever markdown string it is handed.
   Add a guard rejecting an empty body for a content page so a blank file is
   never published.

6. **Docs** — update `docs/editor-guide.md` when the feature lands, per repo
   convention.

## The one wrinkle: card thumbnail for content posts

For a section-built post, the card thumbnail is derived from the first
section's image (`src/assets/js/utils/markdown-utils.js:178` via
`firstSectionImage`). A content-mode post has no sections, so nothing to
derive from. Content posts therefore need an **explicit thumbnail / social
image field** in the form, feeding both `card.thumbnail` and
`seo.socialImage`. Pages have no card, so they only need it for
`seo.socialImage`, and it can stay optional. This is a small addition to the
post-mode UI and `postBlocks()`
(`src/assets/js/utils/markdown-utils.js:118-135`), but it is the one piece
that does not fall out for free.

## Before relying on the render path

Confirm the build actually runs `metalsmith-markdown` over body content in
`src/` and `src/blog/` so `{{ contents }}` in `simple.njk` is rendered HTML
and not raw markdown. Posts and pages have empty bodies today, so this path
may be untested in practice. Quick check before committing to the design.

## Effort

Roughly a day, concentrated in `markdown-utils.js`, `draft-manager.js`,
`load-draft.js`, `editor-ui.js`, and the admin HTML.
