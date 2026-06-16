/**
 * QA sweep helper: generate one Metalsmith page containing every section type,
 * each populated with representative sample content produced by the editor's
 * own serializer. Building the site then renders all 39 through the real
 * component templates, so visual inspection shows exactly which sections the
 * editor can author correctly and which expose a manifest/template gap.
 *
 * Run: node scripts/qa-build-page.mjs   (writes src/qa-all-sections.md)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { isArrayField, isLeaf, isGroup } from '../src/assets/js/editor/schema/field-utils.js';
import { serializeSection } from '../src/assets/js/editor/schema/serializer.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(resolve(root, 'build/assets/components-schema.json'), 'utf8'));
const SAMPLE_IMG = '/assets/images/sample12.jpg';

/** A representative value for a leaf, chosen by widget and key name so the
 * rendered section has visible, plausible content. */
function sampleLeaf(key, node) {
  const w = node.widget;
  if (w === 'checkbox') {
    return 'default' in node ? node.default : false;
  }
  if (w === 'number') {
    return typeof node.default === 'number' ? node.default : 10;
  }
  if (w === 'multiselect') {
    return Array.isArray(node.default) ? node.default : (node.enum || []);
  }
  if (w === 'select') {
    return Array.isArray(node.enum) ? node.enum[0] : (node.default ?? '');
  }
  if (w === 'image') {
    return SAMPLE_IMG;
  }
  if (w === 'markdown') {
    return 'Sample prose with **bold**, a [link](#), and a short list:\n\n- one\n- two';
  }
  const k = key.toLowerCase();
  if (k.includes('url') || k.includes('link') || k === 'src') {
    return '#';
  }
  if (k.includes('alt')) {
    return 'Sample image';
  }
  if (k.includes('label')) {
    return 'Learn more';
  }
  if (k.includes('title')) {
    return 'Sample Title';
  }
  if (k.includes('caption')) {
    return 'Sample caption';
  }
  if (k === 'year' || k.includes('date')) {
    return '2025';
  }
  if (k === 'width' || k === 'height' || k === 'depth' || k === 'zoom') {
    return '10';
  }
  if (k === 'latitude') {
    return '40.7128';
  }
  if (k === 'longitude') {
    return '-74.0060';
  }
  return 'Sample text';
}

/** Build a fully-populated values object from a field tree, seeding two
 * entries into every array so lists and grids show repetition. */
function populate(fields, depth = 0) {
  const out = {};
  for (const [ key, node ] of Object.entries(fields)) {
    if (isArrayField(node)) {
      out[key] = node.items && depth < 4 ? [ populate(node.items, depth + 1), populate(node.items, depth + 1) ] : [];
    } else if (isLeaf(node)) {
      out[key] = sampleLeaf(key, node);
    } else if (isGroup(node)) {
      out[key] = populate(node, depth);
    }
  }
  return out;
}

const sections = Object.keys(schema).sort().map((type) => {
  const fields = schema[type].fields;
  const values = { sectionType: type, ...populate(fields) };
  return serializeSection(type, values, fields, '/assets/images');
});

const frontmatter = {
  layout: 'pages/sections.njk',
  bodyClasses: 'sections-page',
  seo: {
    title: 'QA: All Sections',
    description: 'Every section type rendered from editor-serialized sample content for QA.',
    socialImage: SAMPLE_IMG
  },
  sections
};

const md = `---\n${yaml.dump(frontmatter, { lineWidth: -1, noRefs: true })}---\n`;
writeFileSync(resolve(root, 'src/qa-all-sections.md'), md, 'utf8');
console.log(`Wrote src/qa-all-sections.md with ${sections.length} sections.`);
