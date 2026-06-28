/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: MIT
 */

/**
 * Markdown overlay editor.
 *
 * A single EasyMDE instance lives inside the #markdown-editor-dialog <dialog>
 * and is reused for every Markdown field. Field controls stay plain textareas;
 * an "Expand" button opens this overlay for distraction-free editing with a
 * toolbar and live preview. The overlay only ever edits a string: it resolves
 * with the new value on Save (or null on Cancel/Escape), and the caller writes
 * that back to its textarea. So the overlay knows nothing about drafts,
 * sections, or obj[key] — the existing field wiring does the commit.
 *
 * EasyMDE wraps CodeMirror 5, which measures its layout on init. Because the
 * dialog is hidden when the instance is created, we refresh() after showModal()
 * reveals it, or the editor renders with zero height and a misplaced cursor.
 */

let editor = null; // the one EasyMDE instance, created on first open
let dialog = null; // the <dialog> element
let titleEl = null;
let resolveOpen = null; // resolver for the in-flight open() promise
let pendingResult = null; // value to resolve with when the dialog closes

/**
 * Build the dialog's single EasyMDE instance and wire Save/Cancel/close. Runs
 * once, lazily, on the first open. The toolbar uses text glyphs rather than
 * FontAwesome classes, and autoDownloadFontAwesome is off, so nothing reaches
 * out to a CDN — the admin stays self-contained.
 */
function ensureEditor() {
  if (editor) {
    return;
  }
  const EasyMDE = window.EasyMDE;
  dialog = document.getElementById('markdown-editor-dialog');
  titleEl = document.getElementById('markdown-editor-title');
  const host = document.getElementById('markdown-editor-host');
  const saveBtn = document.getElementById('markdown-editor-save');
  const cancelBtn = document.getElementById('markdown-editor-cancel');

  editor = new EasyMDE({
    element: host,
    autoDownloadFontAwesome: false,
    spellChecker: false,
    status: false,
    autofocus: false,
    minHeight: '300px',
    placeholder: 'Write Markdown…',
    toolbar: [
      { name: 'bold', action: EasyMDE.toggleBold, title: 'Bold', text: 'B' },
      { name: 'italic', action: EasyMDE.toggleItalic, title: 'Italic', text: 'I' },
      { name: 'heading', action: EasyMDE.toggleHeadingSmaller, title: 'Heading', text: 'H' },
      '|',
      { name: 'quote', action: EasyMDE.toggleBlockquote, title: 'Quote', text: '❝' },
      { name: 'unordered-list', action: EasyMDE.toggleUnorderedList, title: 'Bulleted list', text: '•' },
      { name: 'ordered-list', action: EasyMDE.toggleOrderedList, title: 'Numbered list', text: '1.' },
      '|',
      { name: 'link', action: EasyMDE.drawLink, title: 'Insert link', text: '🔗' },
      '|',
      { name: 'preview', action: EasyMDE.togglePreview, title: 'Toggle preview', text: '👁', noDisable: true }
    ]
  });

  // Save and Cancel set the result, then close. Escape/backdrop close the
  // dialog without touching pendingResult (which open() reset to null), so they
  // resolve as a cancel. Resolving in one place — the 'close' handler — keeps
  // the three paths from double-resolving.
  saveBtn.addEventListener('click', () => {
    pendingResult = editor.value();
    dialog.close();
  });
  cancelBtn.addEventListener('click', () => {
    pendingResult = null;
    dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (resolveOpen) {
      const resolve = resolveOpen;
      resolveOpen = null;
      resolve(pendingResult);
    }
  });
}

/**
 * Opens the overlay to edit a Markdown string.
 * @param {string} initial - The current field value.
 * @param {string} [title] - Heading shown above the editor.
 * @return {Promise<string|null>} The edited value on Save, or null on cancel.
 */
export function openMarkdownOverlay(initial, title) {
  ensureEditor();
  return new Promise((resolve) => {
    resolveOpen = resolve;
    pendingResult = null;
    titleEl.textContent = title || 'Edit Markdown';
    dialog.showModal();
    editor.value(initial || '');
    // The dialog is now laid out; refresh CodeMirror so it has a real height,
    // then focus with the cursor at the top of the document.
    requestAnimationFrame(() => {
      const cm = editor.codemirror;
      cm.refresh();
      cm.setCursor(0, 0);
      cm.focus();
    });
  });
}

/**
 * Adds an "Expand" button after a Markdown textarea that opens the overlay and,
 * on Save, writes the result back to the textarea and dispatches an `input`
 * event. Dispatching the event (rather than mutating obj[key] here) reuses the
 * textarea's own oninput wiring, so this works for both a section field and the
 * page-content body without knowing how either commits its value.
 *
 * The textarea must already be attached to a parent.
 * @param {HTMLTextAreaElement} textarea - The Markdown field.
 * @param {string} [title] - Heading shown in the overlay.
 */
export function attachMarkdownOverlay(textarea, title) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'md-expand-btn';
  btn.textContent = '⤢ Expand';
  btn.title = 'Open the Markdown editor';
  btn.addEventListener('click', async () => {
    const result = await openMarkdownOverlay(textarea.value, title);
    if (result === null) {
      return;
    }
    textarea.value = result;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
  textarea.insertAdjacentElement('afterend', btn);
}
