#!/usr/bin/env node
/**
 * Scope the vendored EasyMDE stylesheet to the Markdown overlay dialog.
 *
 * EasyMDE ships bare class selectors — .editor-toolbar, .editor-preview,
 * .CodeMirror, .editor-statusbar — that collide with the admin's own elements
 * of the same name and bleed borders/backgrounds onto the form and preview
 * pane. EasyMDE only ever renders inside #markdown-editor-dialog, so prefixing
 * every rule with that scope confines the sheet and removes the collision.
 *
 * Idempotent. Re-run after re-vendoring a new EasyMDE release:
 *   curl -sSL -o src/assets/js/easymde/easymde.min.css https://unpkg.com/easymde/dist/easymde.min.css
 *   node scripts/scope-easymde-css.mjs
 */
import postcss from 'postcss';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCOPE = '.markdown-editor-dialog';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = resolve(ROOT, 'src/assets/js/easymde/easymde.min.css');
const MARKER = `/* scoped-to: ${SCOPE} */`;

const raw = readFileSync(FILE, 'utf8');
// Strip a prior banner so re-runs don't stack it; the selector guard below
// keeps already-scoped selectors from being double-prefixed.
const css = raw.startsWith(MARKER) ? raw.slice(raw.indexOf('*/') + 2).trimStart() : raw;

const root = postcss.parse(css);
root.walkRules((rule) => {
  const parent = rule.parent;
  if (parent && parent.type === 'atrule' && /keyframes/i.test(parent.name)) {
    return; // keyframe steps (0%, to, …) are not selectors
  }
  rule.selectors = rule.selectors.map((sel) => (sel.startsWith(SCOPE) ? sel : `${SCOPE} ${sel}`));
});

writeFileSync(FILE, `${MARKER}\n${root.toString()}`);
console.log(`Scoped ${FILE} to ${SCOPE}`);
