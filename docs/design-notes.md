# Design notes

Decisions about where the editor is heading. Roadmap order lives in
CLAUDE.md / project memory; this records the why and the shape.

## Edit-in-place (decided 2026-06-12)

End state: the editor renders the page's sections themselves and editing
happens in context, replacing the forms-left / preview-right split. An
empty image section renders a pick-an-image affordance; once picked, the
real image renders in place; clicking a section brings its form back
into focus.

Shape:

- The preview lives in an **iframe** rendering with the real site bundle
  (nunjucks-slim + component njk + main.css), so admin chrome and site
  styles cannot bleed into each other. Clicks report back via
  postMessage.
- The **form stays the editing surface**, summoned in context (popover or
  panel) rather than going contenteditable. Prose is Markdown; editing
  rendered HTML in place would mean Turndown round-trips. Inline text
  editing is a possible later refinement.
- Staging, each step shipping value alone:
  1. Manifest-driven section forms (needed regardless).
  2. Iframe Nunjucks preview replacing the YAML pane.
  3. Bridge: clicking a section in the preview scrolls/highlights its
     form. If this feels good, the two-surface layout may be enough.
  4. Collapse: forms move into in-context popovers.

## Container fields as a disclosure pane (decided 2026-06-12)

`containerFields` (inContainer, margins, padding, background, is-dark,
classes, id) are set once and rarely revisited. Each section form gets a
collapsed `▸ Container settings` disclosure holding them. Because
containerFields is its own subtree in every component manifest, the form
generator can split common fields from the disclosure mechanically.

This also retires the banner's hardcoded background placeholder
(`#333333` + `isDark: true` in the emitter): background and is-dark
become real authored controls, honoring the rule that is-dark is the
author's call, never inferred.

## AI assistance vs. the component-driven model (open, raised 2026-06-28)

The Chrome built-in AI integration is inherited, along with in-site
authoring and the publish-from-browser flow, from Google Chrome's
[starter-extended-blog](https://github.com/GoogleChrome/starter-extended-blog).
That example assists **freeform prose** in a single body field. This
editor instead edits **structured, per-component fields** driven by the
manifests, so the inherited AI model does not map over cleanly.

Open question, not yet evaluated: where does AI assistance attach in a
component-driven editor? Candidate framings to weigh later:

- **Per-field**: assistance scoped to the field being edited (a section's
  prose, a card's summary), with the manifest naming which fields are
  prose-like and AI-eligible.
- **Per-section**: assistance over a whole section's authored content,
  aware of the component's shape.
- **Page-level**: assistance over the assembled page, closest to the
  freeform-blog framing but furthest from the structured surface.

Resolve before the build concludes; likely a blog-post topic either way.
