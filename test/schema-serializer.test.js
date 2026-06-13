/**
 * Unit coverage for the schema-driven section helpers: default
 * materialization and serialization to library frontmatter. Pure logic, no
 * DOM or fetch, so it runs under node:test directly.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { materializeDefaults, isLeaf, isGroup, isArrayField } from '../src/assets/js/editor/schema/field-utils.js';
import { serializeSection, firstSectionImage } from '../src/assets/js/editor/schema/serializer.js';

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
    containerFields: { inContainer: true, background: { color: '', image: '' } }
  });
});

test('serializeSection adds wrapper fields and keeps the nested shape', () => {
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

test('banner gets its aside/cta-banner wrapper override', () => {
  const out = serializeSection('banner', materializeDefaults(fields), fields, 'my-post');
  assert.equal(out.containerTag, 'aside');
  assert.equal(out.classes, 'cta-banner');
});

test('image leaves rewrite bare filenames but pass URLs through', () => {
  const values = materializeDefaults(fields);
  values.image.src = 'photo.jpg';
  values.containerFields.background.image = 'https://cdn.example.com/bg.jpg';
  const out = serializeSection('multi-media', values, fields, 'my-post');
  assert.equal(out.image.src, '/assets/images/blog/my-post/photo.jpg');
  assert.equal(out.containerFields.background.image, 'https://cdn.example.com/bg.jpg');
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

test('firstSectionImage finds the first content image across sections', () => {
  const fieldsFor = (type) => (type === 'rich-text' ? fields : null);
  const sections = [
    { sectionType: 'rich-text', image: { src: '', alt: '' } },
    { sectionType: 'rich-text', image: { src: 'hero.png', alt: 'x' } }
  ];
  assert.equal(firstSectionImage(sections, fieldsFor, 'post'), '/assets/images/blog/post/hero.png');
});
