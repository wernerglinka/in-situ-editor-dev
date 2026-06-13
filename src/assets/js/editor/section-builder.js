/**
 * Section builder: the editor's left-column replacement for the markdown
 * body textarea. A draft holds a `sections` array of lean editor-state
 * objects; the emitter in markdown-utils.js maps them onto the
 * nunjucks-components library schema at generate time.
 *
 * Section state shapes:
 *   { type: 'rich-text',   title, prose }
 *   { type: 'multi-media', imageName, imageId, alt, caption }
 *   { type: 'banner',      title, prose, ctaLabel, ctaUrl }
 */

import { getImage } from '../utils/db-storage.js';
import { processImage } from './image-handler.js';

/** Labels shown in the card header per section type. */
const TYPE_LABELS = {
  'rich-text': 'Text',
  'multi-media': 'Image',
  banner: 'CTA Banner'
};

/** Cache of imageId -> blob URL for thumbnails. */
const thumbCache = new Map();

let uiRef = null;
let onChangeRef = () => {};
let sections = [];
let currentDraft = null;

/**
 * Creates a new empty section of the given type.
 * @param {string} type - One of TYPE_LABELS keys.
 * @return {Object} The section state object.
 */
function newSection(type) {
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
  const card = document.createElement('div');
  card.className = `section-card section-card-${section.type}`;

  const header = document.createElement('div');
  header.className = 'section-card-header';
  const typeEl = document.createElement('span');
  typeEl.className = 'section-card-type';
  typeEl.textContent = TYPE_LABELS[section.type] || section.type;
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
  if (section.type === 'rich-text') {
    body.append(
      boundField(section, 'title', 'Title', { placeholder: 'Section title' }),
      boundField(section, 'prose', 'Prose (Markdown)', {
        textarea: true,
        rows: 6,
        placeholder: 'Write this section in Markdown...'
      })
    );
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
  sections = draft.sections;
  render();
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
  for (const btn of document.querySelectorAll('[data-add-section]')) {
    btn.onclick = () => {
      sections.push(newSection(btn.dataset.addSection));
      render();
      onChangeRef();
    };
  }
}
