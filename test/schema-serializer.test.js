/**
 * Unit coverage for the schema-driven section helpers: default
 * materialization and serialization to library frontmatter. Pure logic, no
 * DOM or fetch, so it runs under node:test directly.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { materializeDefaults, isLeaf, isGroup, isArrayField } from '../src/assets/js/editor/schema/field-utils.js';
import { serializeSection, firstSectionImage, WRAPPER } from '../src/assets/js/editor/schema/serializer.js';
import { hydrateSection, hydrateSections } from '../src/assets/js/editor/schema/hydrate.js';

// A field tree shaped like a real section: a group, an array of objects,
// a leaf with an explicit default, and a nested containerFields subtree
// carrying an image leaf.
const fields = {
  text: {
    title: { widget: 'text', label: 'Title', default: '' },
    titleTag: { widget: 'select', label: 'Title level', enum: [ 'h1', 'h2' ], default: 'h2' }
  },
  image: {
    src: { widget: 'image', label: 'Image', default: '' },
    alt: { widget: 'text', label: 'Alt', default: '' }
  },
  ctas: {
    widget: 'array',
    label: 'CTAs',
    items: {
      url: { widget: 'text', label: 'URL', default: '' },
      isButton: { widget: 'checkbox', label: 'Button', default: true }
    }
  },
  isDisabled: { widget: 'checkbox', label: 'Disable', default: false },
  containerTag: { widget: 'select', label: 'Container tag', enum: [ 'section', 'article', 'aside', 'div' ], default: 'section' },
  id: { widget: 'text', label: 'Section ID', default: '' },
  classes: { widget: 'text', label: 'CSS classes', default: '' },
  containerFields: {
    inContainer: { widget: 'checkbox', label: 'In container', default: true },
    background: {
      color: { widget: 'text', label: 'Color', default: '' },
      image: { widget: 'image', label: 'Bg image', default: '' }
    }
  }
};

test('node classifiers distinguish leaves, arrays and groups', () => {
  assert.equal(isLeaf(fields.text.title), true);
  assert.equal(isGroup(fields.text), true);
  assert.equal(isArrayField(fields.ctas), true);
  assert.equal(isLeaf(fields.ctas), true); // an array field is still a leaf
  assert.equal(isGroup(fields.ctas), false);
});

test('materializeDefaults builds the nested default tree', () => {
  const v = materializeDefaults(fields);
  assert.deepEqual(v, {
    text: { title: '', titleTag: 'h2' },
    image: { src: '', alt: '' },
    ctas: [],
    isDisabled: false,
    containerTag: 'section',
    id: '',
    classes: '',
    containerFields: { inContainer: true, background: { color: '', image: '' } }
  });
});

test('serializeSection emits the schema wrapper fields and keeps the nested shape', () => {
  // containerTag/id/classes are ordinary schema leaves now, so they serialize
  // from their defaults (or the values) like any other field.
  const values = materializeDefaults(fields);
  values.text.title = 'Hello';
  const out = serializeSection('rich-text', values, fields, 'my-post');
  assert.equal(out.sectionType, 'rich-text');
  assert.equal(out.containerTag, 'section');
  assert.equal(out.id, '');
  assert.equal(out.classes, '');
  assert.equal(out.text.title, 'Hello');
  assert.equal(out.text.titleTag, 'h2');
  assert.deepEqual(out.ctas, []);
});

test('WRAPPER seeds per-type creation defaults; serialize is faithful to them', () => {
  // The per-type override (banner -> aside/cta-banner) is applied when a
  // section is created (section-builder's newSection), not at serialize time;
  // serialize just emits whatever the values hold.
  assert.deepEqual(WRAPPER.banner, { containerTag: 'aside', classes: 'cta-banner' });
  const values = { ...materializeDefaults(fields), ...WRAPPER.banner };
  const out = serializeSection('banner', values, fields, 'my-post');
  assert.equal(out.containerTag, 'aside');
  assert.equal(out.classes, 'cta-banner');
});

test('image leaves rewrite bare filenames but pass URLs through', () => {
  const values = materializeDefaults(fields);
  values.image.src = 'photo.jpg';
  values.containerFields.background.image = 'https://cdn.example.com/bg.jpg';
  const out = serializeSection('multi-media', values, fields, '/assets/images/blog/my-post');
  assert.equal(out.image.src, '/assets/images/blog/my-post/photo.jpg');
  assert.equal(out.containerFields.background.image, 'https://cdn.example.com/bg.jpg');
});

test('a page image base (no blog/) rewrites under the top-level path', () => {
  const values = materializeDefaults(fields);
  values.image.src = 'photo.jpg';
  const out = serializeSection('image-only', values, fields, '/assets/images/about');
  assert.equal(out.image.src, '/assets/images/about/photo.jpg');
});

test('serialization fills missing leaves and array entries from defaults', () => {
  // A partial values object (as hydration of a sparse hand-authored page
  // might produce) still serializes to a complete section.
  const partial = { text: { title: 'Only title' }, ctas: [ { url: '/go' } ] };
  const out = serializeSection('rich-text', partial, fields, 'p');
  assert.equal(out.text.title, 'Only title');
  assert.equal(out.text.titleTag, 'h2'); // filled
  assert.equal(out.image.src, ''); // filled
  assert.equal(out.ctas[0].url, '/go');
  assert.equal(out.ctas[0].isButton, true); // filled from item default
});

const fieldsFor = (type) => (type === 'rich-text' ? fields : null);

test('hydrateSection fills schema defaults while the page values win', () => {
  const page = {
    sectionType: 'rich-text',
    containerTag: 'section',
    text: { title: 'From the page' }
  };
  const h = hydrateSection(page, fieldsFor);
  assert.equal(h.text.title, 'From the page'); // page value wins
  assert.equal(h.text.titleTag, 'h2'); // default filled
  assert.deepEqual(h.image, { src: '', alt: '' }); // group filled
  assert.equal(h.containerTag, 'section'); // wrapper preserved
});

test('hydrateSection preserves fields the schema does not describe', () => {
  const page = { sectionType: 'rich-text', text: { title: 't' }, mystery: { keep: 1 } };
  const h = hydrateSection(page, fieldsFor);
  assert.deepEqual(h.mystery, { keep: 1 });
});

test('hydrateSection passes an unowned section type through untouched', () => {
  const page = { sectionType: 'featured-posts', count: 3 };
  assert.deepEqual(hydrateSection(page, fieldsFor), page);
});

test('round-trip preserves unknown fields and the wrapper through serialize', () => {
  const page = {
    sectionType: 'rich-text',
    containerTag: 'div',
    id: 'lead',
    classes: 'highlight',
    text: { title: 'Hi' },
    mystery: 'keep me'
  };
  const out = serializeSection('rich-text', hydrateSection(page, fieldsFor), fields, 'p');
  assert.equal(out.containerTag, 'div'); // page wrapper, not the default
  assert.equal(out.id, 'lead');
  assert.equal(out.classes, 'highlight');
  assert.equal(out.text.title, 'Hi');
  assert.equal(out.mystery, 'keep me'); // unknown field survived
});

test('hydrateSections maps an array and tolerates non-arrays', () => {
  assert.deepEqual(hydrateSections(undefined, fieldsFor), []);
  const out = hydrateSections([ { sectionType: 'rich-text', text: { title: 'a' } } ], fieldsFor);
  assert.equal(out[0].text.titleTag, 'h2');
});

test('firstSectionImage finds the first content image across sections', () => {
  const fieldsFor = (type) => (type === 'rich-text' ? fields : null);
  const sections = [
    { sectionType: 'rich-text', image: { src: '', alt: '' } },
    { sectionType: 'rich-text', image: { src: 'hero.png', alt: 'x' } }
  ];
  assert.equal(firstSectionImage(sections, fieldsFor, '/assets/images/blog/post'), '/assets/images/blog/post/hero.png');
});
