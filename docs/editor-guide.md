# Editor guide

How to write and publish posts with the in-site editor. This guide tracks
the editor as it evolves; if something here doesn't match what you see,
the guide is behind — say so.

## Opening the editor

The editor lives at `/admin/` on the site. It is gated by sign-in: fresh
visitors see a sign-in prompt, and the editor appears once you sign in
with your Netlify Identity account (invite-only; ask the site owner for
an invite).

For local development without Identity, append `?admin=true` to the URL
(`http://localhost:3000/admin/?admin=true`). This sets a flag in your
browser so subsequent visits stay unlocked. It only reveals the editing
surface — publishing still requires sign-in, and the server enforces
that regardless of what the browser shows.

## Drafts

Drafts live in your browser (localStorage for the text, IndexedDB for
images). Two consequences worth knowing:

- Drafts are per browser *and* per site. A draft started on the live
  site won't appear on localhost, or in another browser or profile.
- Clearing site data in your browser deletes your drafts. Use
  **💾 Save (.zip)** to keep a copy outside the browser.

The sidebar lists your drafts. **+** starts a new one, the trash icon
deletes one, and **📂 Load Draft** restores a draft from a saved file.

## Building a post

A post is a stack of sections, composed in the **Sections** area:

- **Rich Text** — a title and prose plus the full set of fields the
  library's text section supports: lead-in, title level (h1–h6), centering,
  subtitle, any number of call-to-action buttons, and a **Container
  settings** pane for width, spacing, and background. Prose fields take
  Markdown (headings, bold, lists, code blocks).
- **Image Only** — one image with alt text, caption, an optional link, and
  call-to-action buttons. Type a filename or URL, or use **📂 Choose image**
  to upload; alt and caption are filled in for you when you upload, and a
  thumbnail appears.
- **CTA Banner** — a call-to-action band: title, supporting prose, an
  optional image, and any number of buttons. Whether it spans full width and
  whether it uses a dark background are set in **Container settings**, not
  fixed; a plain banner is contained and light by default.

Add sections with the buttons below the stack; reorder with ↑/↓; remove
with ✕.

Rich Text, Image Only, and CTA Banner generate their forms straight from the
component library's schema rather than from hand-written editor code, which
is why they expose every field the library supports and are named after
their library section. The remaining section types are being moved onto the
same schema-driven path, after which more of them (hero, slider, columns, …)
become available without new editor code. Within a section, repeatable fields like
call-to-action buttons add, remove, and reorder the same way the section
stack does. Drafts made before the section types were renamed open without
losing content.

Above the sections sit the post's metadata: title, description, date,
authors, and tags. The title doubles as the post's URL slug
(`Trying Hard not to Smile` → `/blog/trying-hard-not-to-smile/`), so set
it before you publish — image URLs are derived from it, and an untitled
draft files its images under `untitled/`. Everything re-derives live as
you type, so renaming before publish is harmless.

The right-hand pane shows the document that publishing will commit: the
post's structured frontmatter in YAML. (An in-browser preview of the
rendered page is planned to replace it.) It updates a moment after every
edit. Note that long lines are clipped at the pane's edge.

## Images

Pick an image with the **📂 Choose image** button on an Image section.
The file can come from anywhere — your desktop, downloads, wherever. The
editor stores a copy in your browser and, on publish, commits it to the
site alongside the post at `src/assets/images/blog/<slug>/<filename>`.
You never need to know the repository layout.

Picking a file that already exists on the site does not link to the
existing copy — it uploads a fresh one under the post's image folder.

## Publishing

Sign in (Settings → Account, or the sign-in prompt), then:

- **🚀 Publish (as PR)** — available to every signed-in editor. Opens a
  pull request with the post and its images for the site owner to review
  and merge.
- **Publish directly to main** — admins only. Commits straight to the
  live site; Netlify rebuilds and the post is live in a couple of
  minutes.

The server checks your role on every publish — hiding or revealing
buttons in the browser changes nothing.

## Working locally without publishing

Two flows for testing a post against a local build:

- **💾 Save (.zip)** — the archive mirrors the repository layout. Unzip
  it at the repo root and the post (`src/blog/<slug>.md`) and its images
  (`src/assets/images/blog/<slug>/`) land exactly where the build wants
  them.
- **📋 Copy Markdown** — copies just the frontmatter document. Paste it
  into `src/blog/<slug>.md`. Fine for text-only posts; if the post has
  images you must place them at `src/assets/images/blog/<slug>/` by
  hand, so prefer the zip for image-bearing posts.

## AI features

The editor integrates Chrome's built-in AI (Summarizer, Writer,
Rewriter, and friends) for suggesting titles, descriptions, and tags and
for expanding or rewriting prose. The ✨ buttons appear only in Chrome
with the on-device model provisioned; in any other browser the editor
works normally without them. Per-section AI assistance is planned.
