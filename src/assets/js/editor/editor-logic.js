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
    },
    { once: true }
  );
  frame.srcdoc = html;
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
