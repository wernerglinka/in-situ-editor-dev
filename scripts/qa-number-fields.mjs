/**
 * QA helper: find component fields the manifest validates as `type: number`
 * but whose fields-block widget is still `text` (so the editor emits a string
 * that fails number validation). Scans the nunjucks-components library.
 *
 * Run: node scripts/qa-number-fields.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const LIB = '/Users/wernerglinka/Documents/Projects/websites/nunjucks-components/lib/layouts/components/sections';

/** Follow a dotted path into a fields tree, returning the leaf node or null. */
function leafAt(fields, dottedPath) {
  let node = fields;
  for (const part of dottedPath.split('.')) {
    if (!node || typeof node !== 'object') {
      return null;
    }
    // arrays: items hold the per-entry tree
    node = node[part] ?? (node.items ? node.items[part] : undefined);
  }
  return node || null;
}

const out = [];
for (const dir of readdirSync(LIB)) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(resolve(LIB, dir, 'manifest.json'), 'utf8'));
  } catch {
    continue;
  }
  const props = manifest.validation?.properties || {};
  const fields = manifest.fields || {};
  for (const [ path, spec ] of Object.entries(props)) {
    if (spec?.type !== 'number') {
      continue;
    }
    const leaf = leafAt(fields, path);
    const widget = leaf?.widget ?? '(not in fields block)';
    if (widget !== 'number') {
      out.push({ component: dir, path, widget });
    }
  }
}

out.sort((a, b) => a.component.localeCompare(b.component));
console.log(`${out.length} number-typed fields not declared widget:number\n`);
for (const r of out) {
  console.log(`  ${r.component.padEnd(16)} ${r.path.padEnd(34)} widget: ${r.widget}`);
}
