/**
 * Section builder: the editor's left-column replacement for the markdown
 * body textarea. A draft holds a `sections` array.
 *
 * Two section models coexist while the editor migrates onto the
 * schema-driven path (see docs/manifest-driven-editor.md):
 *
 *   Schema-driven (new): a library-shaped values object materialized from
 *   the component schema, tagged with `sectionType`. Rendered generically by
 *   form-renderer.js and serialized generically by schema/serializer.js. The
 *   set SCHEMA_DRIVEN lists the types on this path; it grows as types
 *   migrate, and the legacy path retires when it covers everything.
 *
 *   Legacy (old): a lean editor-state object keyed by `type`, hand-rendered
 *   below and hand-mapped in markdown-utils.js.
 *     { type: 'multi-media', imageName, imageId, alt, caption }
 *     { type: 'banner',      title, prose, ctaLabel, ctaUrl }
 */

import { getImage } from '../utils/db-storage.js';
import { processImage } from './image-handler.js';
import { loadSchema, getSectionFields } from './schema/schema-loader.js';
import { materializeDefaults } from './schema/field-utils.js';
import { renderFields } from './schema/form-renderer.js';

/** Section types rendered through the generic schema-driven path. */
const SCHEMA_DRIVEN = new Set([ 'rich-text', 'image-only', 'banner' ]);

/**
 * The card header label for a section type: its section name, title-cased
 * from the kebab type so it always matches the library (rich-text -> "Rich
 * Text", multi-media -> "Multi Media").
 * @param {string} type - The sectionType (or legacy type).
 * @return {string} The display label.
 */
function typeLabel(type) {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Cache of imageId -> blob URL for thumbnails. */
const thumbCache = new Map();

let uiRef = null;
let onChangeRef = () => {};
let sections = [];
let currentDraft = null;

/**
 * Creates a new empty section of the given type. Schema-driven types
 * materialize their defaults from the loaded schema; the schema must be
 * loaded first (callers await loadSchema()).
 * @param {string} type - A SCHEMA_DRIVEN type or a legacy TYPE_LABELS key.
 * @return {Object} The section state object (new or legacy model).
 */
function newSection(type) {
  if (SCHEMA_DRIVEN.has(type)) {
    const fields = getSectionFields(type);
    return { sectionType: type, ...materializeDefaults(fields) };
  }
  switch (type) {
    case 'multi-media':
      return { type, imageName: '', imageId: '', alt: '', caption: '' };
    case 'banner':
      return { type, title: '', prose: '', ctaLabel: '', ctaUrl: '' };
    default:
      return { type: 'rich-text', title: '', prose: '' };
  }
}

/**
 * Pre-rename lean type names -> their current names. Drafts saved before the
 * library rename (text-only -> rich-text, etc.) carry the old names; without
 * this they match no render branch and show an empty card.
 */
const TYPE_ALIASES = {
  'text-only': 'rich-text',
  'media-image': 'multi-media',
  composed: 'columns',
  'blog-navigation': 'collection-links'
};

/**
 * Migrates a legacy lean section: renames pre-rename types to current names
 * and converts types that have moved onto the schema path into their
 * schema-driven values object. Already-migrated (schema-driven) sections and
 * legacy types still on the lean path pass through unchanged.
 * @param {Object} s - A section state object.
 * @return {Object} The (possibly migrated) section.
 */
function migrateSection(s) {
  if (s.sectionType) {
    return s;
  }
  const type = TYPE_ALIASES[s.type] || s.type;
  if (SCHEMA_DRIVEN.has(type)) {
    const next = newSection(type);
    if (type === 'rich-text') {
      next.text.title = s.title || '';
      next.text.prose = s.prose || '';
    } else if (type === 'banner') {
      next.text.title = s.title || '';
      next.text.prose = s.prose || '';
      if (s.ctaUrl || s.ctaLabel) {
        const cta = materializeDefaults(getSectionFields('banner').ctas.items);
        cta.url = s.ctaUrl || '';
        cta.label = s.ctaLabel || '';
        next.ctas.push(cta);
      }
    }
    return next;
  }
  return type === s.type ? s : { ...s, type };
}

/**
 * Builds a labeled input or textarea bound to a section field.
 * @param {Object} section - The section state object.
 * @param {string} field - The property name on the section.
 * @param {string} label - The visible label.
 * @param {Object} [opts] - { textarea: boolean, rows: number, placeholder: string }
 * @return {HTMLElement} The form-group element.
 */
function boundField(section, field, label, opts = {}) {
  const group = document.createElement('div');
  group.className = 'form-group section-field';
  const labelEl = document.createElement('label');
  labelEl.textContent = label;
  const input = document.createElement(opts.textarea ? 'textarea' : 'input');
  if (opts.textarea) {
    input.rows = opts.rows || 6;
  } else {
    input.type = 'text';
  }
  input.placeholder = opts.placeholder || '';
  input.value = section[field] || '';
  input.oninput = () => {
    section[field] = input.value;
    onChangeRef();
  };
  group.append(labelEl, input);
  return group;
}

/**
 * The editor context passed to the schema-driven form renderer, giving its
 * generic image widget access to the draft's image pipeline without coupling
 * the renderer to the DB or the upload code.
 * @return {Object} { processFile, resolveThumb, rerender }.
 */
function formContext() {
  return {
    /**
     * Uploads a picked file through the draft's image pipeline.
     * @param {File} file - The chosen image.
     * @return {Promise<Object|null>} { name, alt, caption } or null.
     */
    async processFile(file) {
      if (!currentDraft) {
        return null;
      }
      return processImage(file, currentDraft.id, currentDraft, uiRef);
    },
    /**
     * Resolves a stored image value to a thumbnail blob URL, matching it
     * against the draft's uploaded files by filename.
     * @param {string} value - The stored image value (filename or path).
     * @return {Promise<string|null>} A blob URL, or null.
     */
    async resolveThumb(value) {
      if (!value || !currentDraft) {
        return null;
      }
      const name = value.split('/').pop();
      const entry = (currentDraft.imageFiles || []).find((f) => f.name === name);
      if (!entry) {
        return null;
      }
      if (thumbCache.has(entry.id)) {
        return thumbCache.get(entry.id);
      }
      const data = await getImage(entry.id);
      if (!data) {
        return null;
      }
      const url = URL.createObjectURL(new Blob([ data ]));
      thumbCache.set(entry.id, url);
      return url;
    },
    /** Re-renders the section cards (after an upload fills sibling fields). */
    rerender() {
      render();
    }
  };
}

/**
 * Renders the image picker (button + thumbnail) for a multi-media section.
 * @param {Object} section - The multi-media section state.
 * @return {HTMLElement} The picker element.
 */
function imagePicker(section) {
  const wrap = document.createElement('div');
  wrap.className = 'form-group section-field section-image-picker';

  const thumb = document.createElement('img');
  thumb.className = 'section-thumb';
  thumb.alt = '';
  thumb.hidden = !section.imageId;
  if (section.imageId) {
    const cached = thumbCache.get(section.imageId);
    if (cached) {
      thumb.src = cached;
    } else {
      getImage(section.imageId).then((data) => {
        if (!data) {
          return;
        }
        const url = URL.createObjectURL(new Blob([ data ]));
        thumbCache.set(section.imageId, url);
        thumb.src = url;
      });
    }
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn';
  btn.textContent = section.imageName ? `🖼 ${section.imageName}` : '📂 Choose image';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.hidden = true;
  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file || !currentDraft) {
      return;
    }
    btn.disabled = true;
    btn.textContent = '⏳ Processing...';
    try {
      const info = await processImage(file, currentDraft.id, currentDraft, uiRef);
      section.imageName = info.name;
      // processImage just pushed this file's entry
      const files = currentDraft.imageFiles || [];
      const entry = files[files.length - 1];
      section.imageId = entry && entry.name === info.name ? entry.id : '';
      if (!section.alt) {
        section.alt = info.alt;
      }
      if (!section.caption) {
        section.caption = info.caption;
      }
      render();
      onChangeRef();
    } finally {
      btn.disabled = false;
    }
  };

  btn.onclick = () => fileInput.click();
  wrap.append(thumb, btn, fileInput);
  return wrap;
}

/**
 * Renders one section card.
 * @param {Object} section - The section state object.
 * @param {number} index - Position in the sections array.
 * @return {HTMLElement} The card element.
 */
function renderCard(section, index) {
  const kind = section.sectionType || section.type;
  const card = document.createElement('div');
  card.className = `section-card section-card-${kind}`;

  const header = document.createElement('div');
  header.className = 'section-card-header';
  const typeEl = document.createElement('span');
  typeEl.className = 'section-card-type';
  typeEl.textContent = typeLabel(kind);
  const controls = document.createElement('div');
  controls.className = 'section-card-controls';
  for (const [ act, symbol, title ] of [
    [ 'up', '↑', 'Move up' ],
    [ 'down', '↓', 'Move down' ],
    [ 'remove', '✕', 'Remove section' ]
  ]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn section-card-control';
    b.textContent = symbol;
    b.title = title;
    b.disabled = (act === 'up' && index === 0) || (act === 'down' && index === sections.length - 1);
    b.onclick = () => {
      if (act === 'remove') {
        sections.splice(index, 1);
      } else {
        const to = act === 'up' ? index - 1 : index + 1;
        [ sections[index], sections[to] ] = [ sections[to], sections[index] ];
      }
      render();
      onChangeRef();
    };
    controls.append(b);
  }
  header.append(typeEl, controls);

  const body = document.createElement('div');
  body.className = 'section-card-body';
  if (section.sectionType) {
    const fields = getSectionFields(section.sectionType);
    if (fields) {
      body.append(renderFields(fields, section, onChangeRef, formContext()));
    } else {
      const pending = document.createElement('p');
      pending.className = 'field-hint';
      pending.textContent = 'Loading schema...';
      body.append(pending);
    }
  } else if (section.type === 'multi-media') {
    body.append(
      imagePicker(section),
      boundField(section, 'alt', 'Alt text', { placeholder: 'Describe the image' }),
      boundField(section, 'caption', 'Caption', { placeholder: 'Optional caption' })
    );
  } else if (section.type === 'banner') {
    body.append(
      boundField(section, 'title', 'Title', { placeholder: 'Banner title' }),
      boundField(section, 'prose', 'Prose (Markdown)', {
        textarea: true,
        rows: 3,
        placeholder: 'Optional supporting text...'
      }),
      boundField(section, 'ctaLabel', 'CTA label', { placeholder: 'Read more' }),
      boundField(section, 'ctaUrl', 'CTA URL', { placeholder: '/blog/ or https://...' })
    );
  }

  card.append(header, body);
  return card;
}

/**
 * Re-renders all section cards into the container.
 */
function render() {
  if (!uiRef || !uiRef.sectionsList) {
    return;
  }
  uiRef.sectionsList.replaceChildren(...sections.map((s, i) => renderCard(s, i)));
  if (sections.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'field-hint sections-empty';
    empty.textContent = 'No sections yet. Add one below.';
    uiRef.sectionsList.append(empty);
  }
}

/**
 * Loads a draft's sections into the builder, migrating legacy
 * markdown-body drafts into a single text section.
 * @param {Object} draft - The draft object (mutated in place).
 */
export function loadSections(draft) {
  currentDraft = draft;
  if (!Array.isArray(draft.sections)) {
    draft.sections =
      draft.content && draft.content.trim() ? [ { type: 'rich-text', title: '', prose: draft.content } ] : [];
  }
  // Schema-driven types need the schema loaded before they can render or be
  // migrated, so defer to ensure the cache is warm.
  loadSchema()
    .then(() => {
      draft.sections = draft.sections.map(migrateSection);
      sections = draft.sections;
      render();
      // Re-emit now that the schema is loaded: the first preview may have
      // run through the schema-less fallback (bare image paths, no defaults).
      onChangeRef();
    })
    .catch(() => {
      sections = draft.sections;
      render();
    });
}

/**
 * Wires the add-section buttons and exposes the sections getter on ui.
 * Call once at startup, before the first draft is loaded.
 * @param {Object} ui - The UI elements.
 * @param {Function} onChange - Called after any section edit (the sync fn).
 */
export function initSectionBuilder(ui, onChange) {
  uiRef = ui;
  onChangeRef = onChange;
  ui.getSections = () => sections;
  // Warm the schema cache so schema-driven cards render without a flash.
  loadSchema().catch((err) => console.error('schema load failed', err));
  for (const btn of document.querySelectorAll('[data-add-section]')) {
    const type = btn.dataset.addSection;
    btn.onclick = async () => {
      if (SCHEMA_DRIVEN.has(type)) {
        await loadSchema();
      }
      sections.push(newSection(type));
      render();
      onChangeRef();
    };
  }
}
