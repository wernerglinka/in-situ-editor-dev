/**
 * Section builder: the editor's left-column replacement for the markdown
 * body textarea. A draft holds a `sections` array.
 *
 * Every section is schema-driven: a library-shaped values object
 * materialized from the component schema and tagged with `sectionType`,
 * rendered generically by form-renderer.js and serialized generically by
 * schema/serializer.js (see docs/manifest-driven-editor.md). `SCHEMA_DRIVEN`
 * lists the types the add buttons offer.
 *
 * Drafts authored before this used a lean per-type model
 * (`{ type, title, prose, ... }`); migrateSection converts those on load,
 * including the pre-rename type names, so old drafts open without loss.
 */

import { getImage } from '../utils/db-storage.js';
import { processImage } from './image-handler.js';
import { loadSchema, getSectionFields } from './schema/schema-loader.js';
import { materializeDefaults } from './schema/field-utils.js';
import { renderFields } from './schema/form-renderer.js';

/** Section types the add buttons offer, all on the schema-driven path. */
const SCHEMA_DRIVEN = new Set([ 'rich-text', 'image-only', 'multi-media', 'banner' ]);

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
 * Creates a new empty section of the given type by materializing its
 * defaults from the loaded schema. The schema must be loaded first (callers
 * await loadSchema()).
 * @param {string} type - A SCHEMA_DRIVEN section type.
 * @return {Object} The section values object, tagged with sectionType.
 */
function newSection(type) {
  return { sectionType: type, ...materializeDefaults(getSectionFields(type)) };
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
  if (!SCHEMA_DRIVEN.has(type)) {
    return type === s.type ? s : { ...s, type };
  }
  const next = newSection(type);
  carryLegacyFields(type, s, next);
  return next;
}

/**
 * Copies a legacy lean section's fields into its fresh schema-driven values
 * object. Each former per-type editor shape maps onto the library fields.
 * @param {string} type - The schema section type.
 * @param {Object} s - The legacy lean section.
 * @param {Object} next - The fresh schema-driven section (mutated).
 */
function carryLegacyFields(type, s, next) {
  if (type === 'rich-text' || type === 'banner') {
    next.text.title = s.title || '';
    next.text.prose = s.prose || '';
  }
  if (type === 'banner' && (s.ctaUrl || s.ctaLabel)) {
    const cta = materializeDefaults(getSectionFields('banner').ctas.items);
    cta.url = s.ctaUrl || '';
    cta.label = s.ctaLabel || '';
    next.ctas.push(cta);
  }
  if (type === 'multi-media') {
    // The lean shape stored a single uploaded image; the blob stays linked
    // through draft.imageFiles by filename, so only the name is carried.
    next.mediaType = 'image';
    next.image.src = s.imageName || '';
    next.image.alt = s.alt || '';
    next.image.caption = s.caption || '';
  }
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
  const fields = section.sectionType ? getSectionFields(section.sectionType) : null;
  if (fields) {
    body.append(renderFields(fields, section, onChangeRef, formContext()));
  } else {
    // No schema for this type (an auto/chrome or hand-authored section the
    // editor does not own). It is preserved as-is on save, not editable here.
    const note = document.createElement('p');
    note.className = 'field-hint';
    note.textContent = `This “${kind}” section isn’t editable here; it’s preserved unchanged when you save.`;
    body.append(note);
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
