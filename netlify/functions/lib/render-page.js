/**
 * Faithful in-browser preview render.
 *
 * The whole point of this module is zero drift: it renders a draft through the
 * SAME Nunjucks templates and the SAME custom filters the Metalsmith build
 * uses, so the preview an author sees is the production render, not a
 * re-implementation. It mirrors metalsmith.js: a Nunjucks environment rooted at
 * `lib/layouts` with every filter from `nunjucks-filters/`, and the global site
 * data loaded from `lib/data/*.json` (so head/header/footer chrome renders).
 *
 * What it deliberately does NOT reproduce is the site-wide, collection-derived
 * context (the built menu, breadcrumbs, related-posts data). A single in-progress
 * draft has none of that, so those are stubbed empty and data-driven section
 * types render a labeled placeholder (see PLACEHOLDER_TYPES) — the author sees
 * where the section sits without inventing content.
 */

import fs from 'node:fs';
import path from 'node:path';

import nunjucks from 'nunjucks';
import * as nunjucksFilters from '../../../nunjucks-filters/index.js';

// Repo/deploy root. Netlify's esbuild bundler emits CJS, so import.meta.url is
// unavailable; resolve from the runtime root instead — LAMBDA_TASK_ROOT in a
// deployed function (where included_files land under lib/), else the process
// cwd (the repo root under `netlify dev` and in tests). The layout templates
// and data are shipped via netlify.toml [functions.preview] included_files.
const ROOT = process.env.LAMBDA_TASK_ROOT || process.cwd();
const LAYOUTS_DIR = path.join(ROOT, 'lib', 'layouts');
const DATA_DIR = path.join(ROOT, 'lib', 'data');

/**
 * Section types that render from site-wide collections/data a lone draft does
 * not have. In preview these render a placeholder instead of the real
 * component, which would either error or show nothing without that context.
 */
export const PLACEHOLDER_TYPES = new Set([
  'collection-list',
  'collection-links',
  'related-posts',
  'blog-author',
  'compound',
  'multi-tab'
]);

let env;

/**
 * Build (once) the Nunjucks environment that mirrors the build's engine:
 * FileSystemLoader over lib/layouts plus every custom filter. noCache is off
 * here on purpose — templates are stable per process.
 * @return {nunjucks.Environment}
 */
function getEnv() {
  if (env) {
    return env;
  }
  env = new nunjucks.Environment(new nunjucks.FileSystemLoader(LAYOUTS_DIR), {
    autoescape: true
  });
  for (const [name, fn] of Object.entries(nunjucksFilters)) {
    if (typeof fn === 'function') {
      env.addFilter(name, fn);
    }
  }
  return env;
}

/**
 * Load the site's global data the same way the build does: every JSON file in
 * lib/data becomes a key under `data` (site.json -> data.site). Read fresh each
 * call so edits to data files show up without a restart, matching watch mode.
 * @return {Object} The `data` metadata object.
 */
function loadData() {
  const data = {};
  for (const file of fs.readdirSync(DATA_DIR)) {
    if (file.endsWith('.json')) {
      const key = file.replace('.json', '');
      data[key] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
    }
  }
  return data;
}

/**
 * Render a draft's frontmatter to a full HTML page string.
 *
 * @param {Object} frontmatter - The serialized draft (same object publishing
 *   commits): `sections`, `bodyClasses`, `hasHero`, etc. In content mode it
 *   carries `contents` (the Markdown body) and `bodyMode: 'content'`.
 * @param {Object} [opts]
 * @param {boolean} [opts.previewMode=true] - Gates editor-only markup
 *   (placeholders now, source-mapping attributes later). Off reproduces the
 *   production render exactly.
 * @return {string} The rendered HTML document.
 */
export function renderPage(frontmatter = {}, opts = {}) {
  const { previewMode = true } = opts;
  const nj = getEnv();

  // Nunjucks macros (the shared text/ctas/image partials) can't see the render
  // context, only env globals — so previewMode must be a global for those to
  // emit their data-field source-mapping markers. Set per call since the env is
  // cached. Absent in the production build's env, so builds emit no markers.
  nj.addGlobal('previewMode', previewMode);

  const isContent = frontmatter.bodyMode === 'content';
  const template = isContent ? 'pages/simple.njk' : 'pages/sections.njk';

  // Context mirrors a Metalsmith page: the frontmatter IS the context, plus the
  // global `data` and the collection-derived bits stubbed empty.
  const context = {
    ...frontmatter,
    data: loadData(),
    collections: {},
    collection: {},
    mainMenu: [],
    navigation: { breadcrumbs: [] },
    urlPath: frontmatter.urlPath || '/',
    bodyClasses: frontmatter.bodyClasses || (isContent ? 'content-page' : 'sections-page'),
    previewMode,
    placeholderTypes: [...PLACEHOLDER_TYPES]
  };

  return nj.render(template, context);
}
