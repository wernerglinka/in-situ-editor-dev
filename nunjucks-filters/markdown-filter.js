// Shiki language grammars, loaded as plain objects for synchronous highlighting.
import bash from '@shikijs/langs/bash';
import css from '@shikijs/langs/css';
import html from '@shikijs/langs/html';
import javascript from '@shikijs/langs/javascript';
import jinja from '@shikijs/langs/jinja';
import json from '@shikijs/langs/json';
import markdownLang from '@shikijs/langs/markdown';
import typescript from '@shikijs/langs/typescript';
import yaml from '@shikijs/langs/yaml';
import theme from '@shikijs/themes/monokai';
import { Marked } from 'marked';
import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

/**
 * Markdown rendering for prose fields and the code section. Code blocks are
 * highlighted at build time inside marked's `code` renderer with Shiki, so the
 * emitted HTML already carries the highlighting (no post-pass, no client-side
 * highlighter). Mirrors the approach in @wernerglinka/m-plus.
 *
 * Shiki is created once, synchronously, with the JavaScript regex engine so the
 * filter stays a plain synchronous function (Nunjucks filters are sync).
 */

/** Language aliases: write ```nunjucks but tokenize with the jinja-html grammar. */
const LANG_ALIASES = { nunjucks: 'jinja-html', njk: 'jinja-html' };

const highlighter = createHighlighterCoreSync( {
  themes: [ theme ],
  langs: [ javascript, typescript, css, html, bash, json, yaml, markdownLang, ...jinja ],
  engine: createJavaScriptRegexEngine()
} );

const markedInstance = new Marked();

markedInstance.use( {
  renderer: {
    /**
     * Highlight a fenced code block with Shiki, wrapped with a language label.
     * Falls back to a plain escaped block if the grammar is unknown.
     * @param {{ text: string, lang: string }} token - The code token.
     * @return {string} The HTML.
     */
    code( { text, lang } ) {
      const grammar = LANG_ALIASES[ lang ] || lang || 'text';
      const label = lang || 'text';
      try {
        const highlighted = highlighter.codeToHtml( text, { lang: grammar, theme: theme.name } );
        return `<div class="code-block"><span class="code-lang">${label}</span>${highlighted}</div>`;
      } catch {
        const escaped = text.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
        return `<div class="code-block"><span class="code-lang">${label}</span><pre><code>${escaped}</code></pre></div>`;
      }
    }
  }
} );

/**
 * Converts a markdown string to HTML, highlighting any code blocks.
 * @param {string} mdString - The markdown string to convert.
 * @returns {string} The HTML output.
 */
export const mdToHTML = ( mdString ) => {
  try {
    return markedInstance.parse( mdString, {
      mangle: false,
      headerIds: false
    } );
  } catch ( e ) {
    console.error( 'Error parsing markdown:', e );
    return mdString;
  }
};

/**
 * Converts inline markdown (emphasis, links, inline code) to HTML without the
 * block-level <p> wrapper that mdToHTML adds. For short one-line strings like
 * the header's top-message banner, where a wrapping <p> would be invalid inside
 * the surrounding <p> and would force a line break.
 * @param {string} mdString - The markdown string to convert.
 * @returns {string} The inline HTML output.
 */
export const mdInline = ( mdString ) => {
  try {
    return markedInstance.parseInline( mdString );
  } catch ( e ) {
    console.error( 'Error parsing inline markdown:', e );
    return mdString;
  }
};
