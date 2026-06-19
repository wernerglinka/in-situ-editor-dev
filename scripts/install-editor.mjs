/**
 * Install the in-situ editor into a Metalsmith structured-content site.
 *
 * Copies the editor's frontend surface (admin page + layout, the editor JS
 * tree and its vendored libraries, the admin stylesheet) and the Netlify
 * publish backend into a target site, then prints the wiring that has to be
 * done by hand (the metalsmith.js plugin calls and the Netlify Identity /
 * Function setup, which are too site-specific to patch safely).
 *
 * Usage:
 *   node scripts/install-editor.mjs <target-site-dir> [--force]
 *
 * Run it from this repo; it copies from here into <target-site-dir>. Existing
 * files are skipped unless --force is given. It does not touch the target's
 * metalsmith.js, package.json, or any Netlify dashboard settings — those steps
 * are printed at the end.
 */
import { cpSync, existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The editor surface, as paths relative to the repo root. Each entry is copied
 * verbatim into the same relative path under the target. Directories are
 * copied recursively. The site's own /assets/main.css and /assets/main.js
 * (which the admin layout also loads) are assumed to exist on the target.
 */
const MANIFEST = [
  // The admin page and its layout
  'src/admin/index.html',
  'lib/layouts/admin.njk',
  // The editor frontend and its vendored libraries
  'src/assets/js/editor',
  'src/assets/js/drafts',
  'src/assets/js/utils',
  'src/assets/js/ai',
  'src/assets/js/export',
  'src/assets/js/helpers',
  'src/assets/js/marked',
  'src/assets/js/turndown',
  'src/assets/js/prismjs',
  'src/assets/js/jszip',
  'src/assets/js/js-yaml',
  'src/assets/js/browser-fs-access',
  // Admin styles (layered over the site's main.css)
  'src/assets/css/admin-styles.css',
  // The publish backend
  'netlify/functions/publish.js',
  'netlify.toml'
];

const NPM_DEPS = ['metalsmith-site-data', 'metalsmith-bundled-components'];

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const targetArg = args.find((a) => !a.startsWith('--'));

if (!targetArg) {
  fail('Usage: node scripts/install-editor.mjs <target-site-dir> [--force]');
}

const target = resolve(process.cwd(), targetArg);

if (!existsSync(target) || !statSync(target).isDirectory()) {
  fail(`Target is not a directory: ${target}`);
}
if (target === SRC_ROOT) {
  fail('Target is this repo; choose a different site to install into.');
}
for (const marker of ['metalsmith.js', 'package.json']) {
  if (!existsSync(join(target, marker))) {
    fail(`Target does not look like a Metalsmith site (missing ${marker}): ${target}`);
  }
}

console.log(`\nInstalling the in-situ editor into:\n  ${target}\n`);

let copied = 0;
let skipped = 0;
for (const rel of MANIFEST) {
  const from = join(SRC_ROOT, rel);
  const to = join(target, rel);
  if (!existsSync(from)) {
    console.warn(`  ⚠ source missing, skipped: ${rel}`);
    continue;
  }
  if (existsSync(to) && !force) {
    console.log(`  • exists, skipped (use --force): ${rel}`);
    skipped += 1;
    continue;
  }
  cpSync(from, to, { recursive: true });
  console.log(`  ✓ ${rel}`);
  copied += 1;
}

console.log(`\nCopied ${copied} item(s)${skipped ? `, skipped ${skipped} existing` : ''}.`);

/**
 * Adapt the admin layout's chrome includes to the target site.
 *
 * `admin.njk` shares the site's header/footer so the editor matches the rest
 * of the site. This repo keeps those as section components
 * (`components/sections/header/header.njk`), but a starter-derived site may
 * render its chrome from a different path (the public starter uses
 * `pages/parts/header.njk`). Copying admin.njk verbatim would then make
 * Nunjucks throw on a missing include. So rewrite admin.njk's header/footer
 * includes to whatever the target's own page layout uses.
 */
function adaptAdminChrome() {
  const adminPath = join(target, 'lib/layouts/admin.njk');
  if (!existsSync(adminPath)) {
    return;
  }
  // Find a reference page layout in the target to copy the convention from.
  const refPath = ['lib/layouts/pages/default.njk', 'lib/layouts/pages/sections.njk']
    .map((p) => join(target, p))
    .find((p) => existsSync(p));
  if (!refPath) {
    console.warn(
      '\n  ⚠ Could not find a page layout in the target to copy the header/footer\n' +
        '    convention from. Check lib/layouts/admin.njk includes resolve before building.'
    );
    return;
  }
  const ref = readFileSync(refPath, 'utf8');
  const findInclude = (word) => {
    const m = ref.match(
      new RegExp(`\\{%\\s*include\\s+["']([^"']*${word}[^"']*)["'][^%]*%\\}`, 'i')
    );
    return m ? m[1] : null;
  };
  let admin = readFileSync(adminPath, 'utf8');
  const rewritten = [];
  for (const word of ['header', 'footer']) {
    const inc = findInclude(word);
    if (!inc) {
      continue;
    }
    const re = new RegExp(`\\{%\\s*include\\s+["'][^"']*${word}[^"']*["'][^%]*%\\}`, 'i');
    if (re.test(admin) && !admin.includes(`"${inc}"`)) {
      admin = admin.replace(re, `{% include "${inc}" %}`);
      rewritten.push(`${word} → ${inc}`);
    }
  }
  if (rewritten.length) {
    writeFileSync(adminPath, admin);
    console.log(`\n  ✓ Adapted admin.njk chrome to this site: ${rewritten.join(', ')}`);
  }
}

adaptAdminChrome();

// Remaining steps that are not safe to automate.
const steps = `
Next steps (not automated — they touch your metalsmith.js and Netlify setup):

1. Install the build plugins in the target site:

     npm install ${NPM_DEPS.join(' ')}

2. Wire the plugins into metalsmith.js. Add the imports:

     import { pagesArtifact, dataArtifact } from 'metalsmith-site-data';
     import componentBundler from 'metalsmith-bundled-components';

   Emit the editor schema from the component bundler (add to its options):

     componentBundler({ /* ... */ schema: { enabled: true } })

   Place the two artifact plugins by their pipeline position:

     .use(drafts())
     .use(pagesArtifact())          // BEFORE collections()/permalinks()
     .use(collections({ /* ... */ }))
     .use(dataArtifact())           // AFTER collections(), BEFORE permalinks()
     .use(permalinks())

3. Make sure the site loads its data files into metalsmith.metadata().data
   before dataArtifact() runs (an inline loader or @metalsmith/metadata), so
   data-backed editor fields resolve.

4. Netlify (the publish path):
   - Enable Netlify Identity on the site, and set the roles that may publish.
   - Set the Function's GitHub PAT and repo env vars (see netlify/functions/
     publish.js for the names it reads). The PAT lives only in the Function,
     never in the client.
   - Run locally with \`netlify dev\` so Identity and the Function are proxied.

5. Review the POC globals near the bottom of lib/layouts/admin.njk
   (window.AUTHORS, the locale globals) and set them for this site.

6. The admin is at /admin/. Build, then open /admin/?admin=true. Sign in to
   edit and publish.
`;

console.log(steps);
