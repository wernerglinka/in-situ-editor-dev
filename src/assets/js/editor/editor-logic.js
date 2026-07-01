/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: MIT
 */

import { buildFrontmatter, generateMarkdown } from '../utils/markdown-utils.js';

/** The render endpoint (a Netlify Function; available locally under `netlify dev`). */
const PREVIEW_ENDPOINT = '/.netlify/functions/preview';

/**
 * Updates the preview pane. The rendered view POSTs the draft's frontmatter to
 * the render endpoint, which returns the page rendered through the site's own
 * Nunjucks templates and filters, and injects it into an iframe so it carries
 * the real site CSS and JS. The YAML view (the emitted structured frontmatter)
 * stays available behind the toggle, and is the fallback when the endpoint is
 * unreachable (e.g. the plain dev server without `netlify dev`).
 * @param {string} currentId - The ID of the current draft.
 * @param {Object[]} drafts - The list of all drafts.
 * @param {Object} ui - The UI elements.
 * @return {Promise<void>}
 */
export async function updatePreview(currentId, drafts, ui) {
  const draft = drafts.find((d) => d.id === currentId);
  if (!draft) {
    return;
  }
  const classifierResults = window.getSelectedClassifierResults ? window.getSelectedClassifierResults() : [];
  const args = [
    draft,
    ui.titleInput.value,
    ui.descInput.value,
    ui.dateInput.value,
    ui.tagsInput.value,
    ui.contentInput ? ui.contentInput.value : '',
    classifierResults
  ];

  // Keep the YAML view current regardless of which pane is showing.
  const pre = document.createElement('pre');
  pre.className = 'frontmatter-preview';
  pre.textContent = generateMarkdown(...args);
  ui.previewContent.replaceChildren(pre);

  await renderPreviewFrame(ui, ...args);
}

/**
 * Fetches the rendered HTML for the draft and swaps it into the preview iframe,
 * preserving scroll position across the reload. On failure, writes a short
 * notice into the frame and leaves the YAML view as the usable fallback.
 * @param {Object} ui - The UI elements.
 * @param {...any} args - The buildFrontmatter arguments.
 * @return {Promise<void>}
 */
async function renderPreviewFrame(ui, ...args) {
  const frame = ui.previewFrame;
  if (!frame) {
    return;
  }
  const { doc, body, isContent } = buildFrontmatter(...args);
  const frontmatter = { ...doc, bodyMode: isContent ? 'content' : 'sections', contents: body };

  let html;
  try {
    const res = await fetch(PREVIEW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frontmatter })
    });
    html = await res.text();
    if (!res.ok) {
      html = renderNotice('Preview render failed', html);
    }
  } catch {
    html = renderNotice(
      'Rendered preview unavailable',
      'The preview server is not running. Start it with `netlify dev`, or use the YAML view.'
    );
  }

  const prevScroll = frame.contentWindow ? frame.contentWindow.scrollY : 0;
  frame.addEventListener(
    'load',
    () => {
      if (frame.contentWindow) {
        frame.contentWindow.scrollTo(0, prevScroll);
      }
      wireInlineEditing(frame);
    },
    { once: true }
  );
  frame.srcdoc = html;
}

/**
 * The style injected into the preview frame to signal which text is editable
 * in place and to give focus a clear affordance.
 */
const INLINE_EDIT_STYLE = `
  [data-field][contenteditable]:hover { outline: 1px dashed rgba(80,120,255,.55); outline-offset: 3px; }
  [data-field][contenteditable]:focus { outline: 2px solid rgba(80,120,255,.9); outline-offset: 3px; cursor: text; }
  [data-field-markdown] { cursor: pointer; }
  [data-field-markdown]:hover { outline: 1px dashed rgba(80,120,255,.55); outline-offset: 3px; }
`;

/**
 * Makes the rendered preview editable in place. Plain-string fields (marked
 * data-field) become contenteditable and commit on blur; Markdown prose
 * (data-field-markdown) opens the field's Markdown overlay on click. Both route
 * the edit through the matching form control, so the existing bind →
 * persist → re-render pipeline does the actual work. Re-run on every frame load
 * since each render replaces the document.
 * @param {HTMLIFrameElement} frame - The preview iframe.
 */
function wireInlineEditing(frame) {
  const doc = frame.contentDocument;
  if (!doc || !doc.body) {
    return;
  }
  if (doc.head) {
    const style = doc.createElement('style');
    style.textContent = INLINE_EDIT_STYLE;
    doc.head.append(style);
  }

  // The preview is for editing, not navigating: swallow link clicks so editing a
  // CTA label or a linked image caption (both live inside an <a>) never loads
  // another page into the frame. Capture phase, so it wins over the default.
  doc.addEventListener(
    'click',
    (e) => {
      const link = e.target.closest && e.target.closest('a[href]');
      if (link) {
        e.preventDefault();
      }
    },
    true
  );

  for (const el of doc.querySelectorAll('[data-field]:not([data-field-markdown])')) {
    el.contentEditable = 'plaintext-only';
    el.spellcheck = false;
    let original = '';
    el.addEventListener('focus', () => {
      original = el.textContent.trim();
    });
    // These fields are single-line; Enter commits rather than inserting a break.
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        el.blur();
      }
    });
    el.addEventListener('blur', () => {
      const value = el.textContent.trim();
      if (value !== original) {
        commitInlineEdit(el, value);
      }
    });
  }

  for (const el of doc.querySelectorAll('[data-field-markdown]')) {
    el.title = 'Click to edit in the Markdown editor';
    el.addEventListener('click', () => openProseEditor(el));
  }
}

/**
 * Finds the form control that backs a preview element, matching on the
 * section index (nearest data-section-index ancestor) and the field path.
 * @param {Element} el - The edited element in the preview frame.
 * @return {HTMLElement|null} The form input/textarea, or null if not found.
 */
function formControlFor(el) {
  const wrap = el.closest('[data-section-index]');
  if (!wrap) {
    return null;
  }
  const index = wrap.getAttribute('data-section-index');
  const path = el.getAttribute('data-field');
  return document.querySelector(`#sections-list [data-section-index="${index}"] [data-field-path="${path}"]`);
}

/**
 * Writes an inline text edit back through its form control: set the value and
 * dispatch `input`, which fires the control's existing handler (mutate model,
 * sync, re-render preview). No-op if the control can't be found.
 * @param {Element} el - The edited preview element.
 * @param {string} value - The new text.
 */
function commitInlineEdit(el, value) {
  const input = formControlFor(el);
  if (!input) {
    return;
  }
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Opens the Markdown overlay for a prose field by triggering its form field's
 * Expand button. The overlay writes back by dispatching `input` on the
 * textarea, so saving flows through the same pipeline as a form edit.
 * @param {Element} el - The clicked prose element in the preview frame.
 */
function openProseEditor(el) {
  const textarea = formControlFor(el);
  const expandBtn = textarea && textarea.parentElement && textarea.parentElement.querySelector('button');
  if (expandBtn) {
    expandBtn.click();
  }
}

/**
 * A minimal standalone HTML document showing a notice in the preview frame.
 * @param {string} heading - The notice heading.
 * @param {string} detail - The notice detail (plain text).
 * @return {string} An HTML document string.
 */
function renderNotice(heading, detail) {
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  return `<!doctype html><meta charset="utf-8"><body style="font:14px/1.5 system-ui,sans-serif;color:#444;padding:2rem">
    <h2 style="margin:0 0 .5rem;font-size:1rem">${esc(heading)}</h2>
    <p style="margin:0;white-space:pre-wrap">${esc(detail)}</p></body>`;
}

export { wrapText } from '../utils/text-utils.js';
