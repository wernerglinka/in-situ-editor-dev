/**
 * Unit coverage for the pages artifact: the build-side frontmatter snapshot
 * (buildPagesArtifact) and the editor-side display list (listPages). Pure
 * logic, no DOM or fetch, so it runs under node:test directly.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildPagesArtifact } from '../lib/plugins/emit-pages-artifact.js';
import { listPages } from '../src/assets/js/drafts/pages-loader.js';

// A Metalsmith files object as it looks early in the pipeline: parsed
// frontmatter plus the internal contents/stats/mode keys.
const files = {
  'blog/hello.md': {
    contents: Buffer.from('body text'),
    stats: { size: 9 },
    mode: '0644',
    layout: 'pages/sections.njk',
    card: { title: 'Hello', date: '2026-01-02' },
    tags: ['intro'],
    sections: [{ sectionType: 'banner' }]
  },
  'about.md': {
    contents: Buffer.from(''),
    layout: 'pages/sections.njk',
    bodyClasses: 'about',
    seo: { title: 'About us' },
    navigation: { navLabel: 'About', navIndex: 2 },
    sections: []
  },
  'assets/main.css': { contents: Buffer.from('.x{}') }
};

test('buildPagesArtifact captures only .md sources', () => {
  const artifact = buildPagesArtifact(files);
  assert.deepEqual(Object.keys(artifact).sort(), ['about.md', 'blog/hello.md']);
});

test('buildPagesArtifact strips Metalsmith internals, keeps frontmatter', () => {
  const artifact = buildPagesArtifact(files);
  const fm = artifact['blog/hello.md'].frontmatter;
  assert.ok(!('contents' in fm) && !('stats' in fm) && !('mode' in fm));
  assert.equal(fm.layout, 'pages/sections.njk');
  assert.deepEqual(fm.tags, ['intro']);
  assert.equal(fm.sections.length, 1);
});

test('buildPagesArtifact carries the markdown body as content', () => {
  const artifact = buildPagesArtifact(files);
  assert.equal(artifact['blog/hello.md'].content, 'body text');
  assert.equal(artifact['about.md'].content, '');
});

test('listPages infers page type from a card block and sorts posts first', () => {
  const artifact = buildPagesArtifact(files);
  const list = listPages(artifact);
  assert.equal(list.length, 2);
  // Post (has a card) sorts before the page.
  assert.equal(list[0].path, 'blog/hello.md');
  assert.equal(list[0].pageType, 'post');
  assert.equal(list[0].title, 'Hello');
  assert.equal(list[1].path, 'about.md');
  assert.equal(list[1].pageType, 'page');
  assert.equal(list[1].title, 'About us');
});

test('listPages falls back to the path when no title is present', () => {
  const list = listPages({ 'orphan.md': { frontmatter: {} } });
  assert.equal(list[0].title, 'orphan.md');
  assert.equal(list[0].pageType, 'page');
});

test('listPages sorts posts by date descending', () => {
  const artifact = buildPagesArtifact({
    'blog/old.md': { contents: Buffer.from(''), card: { title: 'Old', date: '2025-01-01' } },
    'blog/new.md': { contents: Buffer.from(''), card: { title: 'New', date: '2026-01-01' } }
  });
  const list = listPages(artifact);
  assert.deepEqual(
    list.map((p) => p.title),
    ['New', 'Old']
  );
});
