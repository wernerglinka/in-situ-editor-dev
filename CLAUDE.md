# Working on in-suit-editor

A section-builder admin editor living inside a Metalsmith site built on
metalsmith2025-structured-content-starter. Chrome-AI-only, publishing via
Netlify Identity + a Netlify Function. The original POC is frozen at
`../in-suit-editor-poc`; see ~/.claude memory for project background.

## Operating mode

Work through the obvious next step without checking in. When you finish
a logical chunk, commit it on a sensible boundary (whole feature working,
not mid-refactor) and start the next chunk. Report what you did in one
or two sentences and keep moving.

Reserve "pause and ask" for: architectural forks with no obvious right
answer, irreversible operations (force push, history rewrites, deleted
branches), or anything that touches state outside this repo.

Verify UI changes in the browser via Chrome MCP before reporting a pass
complete. The dev server runs at localhost:3000 via `npm start`; the
admin is at `/admin/?admin=true`. For features that touch Netlify
Identity or the publish Function, use `netlify dev` instead so the auth
endpoint and Functions runtime are proxied locally.

Keep `docs/editor-guide.md` current: when a feature lands or editor
behavior changes, update the guide in the same chunk.

## Conventions

- Static assets live in `src/assets/` (copied verbatim to `/assets/` by
  native `statik()`). `lib/assets/` holds only the component bundler's
  entries (main.css, main.js, styles/) — nothing else is copied from it.
- The schema source of truth is this repo's own component library under
  `lib/layouts/components/`; the emitter
  (`src/assets/js/utils/markdown-utils.js`) must emit frontmatter those
  components render. Posts: `layout: pages/sections.njk`, an `seo` block,
  and a `card` block (collections sorts on `card.date`; quote date
  strings or YAML turns them into Date objects and breaks the sort).
- Metalsmith 2.7 watch: pass plain directories to `.watch()` (chokidar 4
  ignores globs) and keep `.clean( isProduction )` (clean(true) + watch
  races into ENOTEMPTY crashes).
- `npm run format` repo-wide would reformat the vendored editor libs;
  they are listed in `.prettierignore` — keep them there.

## Scope guardrails

- The publish path is Netlify Identity + a Netlify Function that holds
  the GitHub PAT. Do not reintroduce client-side PATs or per-user GitHub
  credential inputs in the admin UI.
- Role enforcement lives in the Function (`netlify/functions/publish.js`),
  not in the UI. The UI hides buttons as a courtesy; the Function is the
  actual security boundary. The Function validates slug and image names
  before building Git paths — keep it that way.
- `/admin/` is publicly reachable; sign-in gates the editing surface as
  a courtesy and publishing for real. Don't put sensitive content there.
- Don't add image optimization beyond the starter's own, RSS, i18n, or
  PWA bits unless a feature being built needs them.
