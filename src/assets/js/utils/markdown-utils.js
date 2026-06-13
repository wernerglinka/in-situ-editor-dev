/**
 * Structured-frontmatter emitter. Serializes a draft's sections to YAML
 * frontmatter (with an empty body) that lib/layouts/pages/sections.njk
 * renders.
 *
 * Two emit paths coexist during the migration to the schema-driven editor
 * (see docs/manifest-driven-editor.md): schema-driven sections (tagged with
 * `sectionType`) go through the generic serializer in schema/serializer.js,
 * driven by the loaded component schema; legacy lean sections (keyed by
 * `type`) go through the hand-written toLibrarySection below.
 */

import { getSectionFields } from '../editor/schema/schema-loader.js';
import { serializeSection, firstSectionImage } from '../editor/schema/serializer.js';

/**
 * Escapes a scalar string for safe use as a single-line YAML value.
 * @param {string|any} val - The value to escape.
 * @return {string|any} The escaped value.
 */
export function escapeYamlValue(val) {
  if (typeof val !== 'string') {
    return val;
  }
  if (val === '') {
    return "''";
  }
  // Quote if it contains YAML-special characters, starts ambiguously, or
  // would be type-coerced (bare dates become Date objects, which breaks
  // collections' card.date string sort against other posts).
  if (/[#:[\]{}>|&*?%@`'"]/.test(val) || /^[\s-]/.test(val) || /\s$/.test(val) || /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return `"${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return val;
}

/**
 * Serializes a JS value to YAML lines.
 * Multiline strings become |- block scalars; everything else is inline.
 * @param {any} value - The value to serialize.
 * @param {number} indent - Current indentation depth in spaces.
 * @return {string} YAML fragment (without trailing newline).
 */
export function toYaml(value, indent = 0) {
  const pad = ' '.repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null; // caller renders `key: []`
    }
    return value
      .map((item) => {
        if (item !== null && typeof item === 'object') {
          const body = toYaml(item, indent + 2);
          // Hoist the first key onto the dash line
          return `${pad}- ${body.trimStart()}`;
        }
        return `${pad}- ${escapeYamlValue(item)}`;
      })
      .join('\n');
  }

  if (value !== null && typeof value === 'object') {
    return Object.entries(value)
      .map(([ key, val ]) => {
        if (Array.isArray(val)) {
          if (val.length === 0) {
            return `${pad}${key}: []`;
          }
          return `${pad}${key}:\n${toYaml(val, indent + 2)}`;
        }
        if (val !== null && typeof val === 'object') {
          return `${pad}${key}:\n${toYaml(val, indent + 2)}`;
        }
        if (typeof val === 'string' && val.includes('\n')) {
          const block = val
            .split('\n')
            .map((line) => (line ? `${pad}  ${line}` : ''))
            .join('\n');
          return `${pad}${key}: |-\n${block}`;
        }
        return `${pad}${key}: ${escapeYamlValue(val)}`;
      })
      .join('\n');
  }

  return `${pad}${escapeYamlValue(value)}`;
}

/**
 * Slugifies a title the same way the publish path does.
 * @param {string} title - The post title.
 * @return {string} The slug.
 */
const slugify = (title) =>
  (title || 'untitled')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');

/** Shared wrapper fields every emitted section carries. */
const containerDefaults = (overrides = {}) => ({
  containerTag: 'section',
  classes: '',
  id: '',
  isDisabled: false,
  containerFields: {
    inContainer: true,
    isAnimated: false,
    noMargin: { top: false, bottom: false },
    noPadding: { top: false, bottom: false },
    background: {
      color: '',
      image: '',
      imageScreen: 'none',
      isDark: false
    }
  },
  ...overrides
});

/**
 * Maps one lean editor section onto the library schema.
 * @param {Object} s - Editor section state.
 * @param {string} slug - The post slug (for image paths).
 * @return {Object} Library-schema section object.
 */
function toLibrarySection(s, slug) {
  if (s.type === 'multi-media') {
    return {
      sectionType: 'multi-media',
      mediaType: 'image',
      ...containerDefaults(),
      image: {
        src: s.imageName ? `/assets/images/blog/${slug}/${s.imageName}` : '',
        alt: s.alt || '',
        caption: s.caption || ''
      }
    };
  }

  if (s.type === 'banner') {
    // Library banner convention: a full-width dark band. is-dark only
    // switches the text color, so a background color must come with it.
    const section = {
      sectionType: 'banner',
      ...containerDefaults({ containerTag: 'aside', classes: 'cta-banner' }),
      text: {
        leadIn: '',
        title: s.title || '',
        titleTag: 'h2',
        subTitle: '',
        prose: s.prose || ''
      },
      ctas:
        s.ctaUrl && s.ctaLabel
          ? [
              {
                url: s.ctaUrl,
                label: s.ctaLabel,
                isButton: true,
                buttonStyle: 'primary'
              }
            ]
          : []
    };
    section.containerFields.inContainer = false;
    section.containerFields.background.color = '#333333';
    section.containerFields.background.isDark = true;
    return section;
  }

  return {
    sectionType: 'rich-text',
    ...containerDefaults(),
    text: {
      leadIn: '',
      title: s.title || '',
      titleTag: 'h2',
      subTitle: '',
      prose: s.prose || ''
    },
    ctas: []
  };
}

/**
 * Generates a structured-content markdown document (frontmatter only,
 * empty body) from draft data.
 *
 * Signature kept compatible with the previous body-markdown generator;
 * `content` is only used as a legacy fallback when the draft has no
 * sections yet.
 *
 * @param {Object} draft - The draft object.
 * @param {string} title - The post title.
 * @param {string} description - The post description.
 * @param {string} date - The post date.
 * @param {string} tagsValue - Comma-separated tags string.
 * @param {string} content - Legacy markdown body fallback.
 * @param {Array<Object>} [classifierResults=[]] - AI classifier results.
 * @return {string} The formatted Markdown string.
 */
export function generateMarkdown(draft, title, description, date, tagsValue, content, classifierResults = []) {
  const slug = slugify(title);
  const tags = tagsValue
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t);

  let editorSections = Array.isArray(draft.sections) ? draft.sections : null;
  if (!editorSections && content && content.trim()) {
    editorSections = [ { type: 'rich-text', title: '', prose: content } ];
  }

  const thumbnail = computeThumbnail(editorSections || [], slug);

  const doc = {
    layout: 'pages/sections.njk',
    bodyClass: '',
    draft: false,
    seo: {
      title: title || '',
      description: description || '',
      socialImage: thumbnail,
      canonicalOverwrite: ''
    },
    // collections sorts on card.date; collection-list renders the card.
    card: {
      title: title || '',
      description: description || '',
      date,
      author: Array.isArray(draft.authors) ? draft.authors : [],
      thumbnail
    },
    tags,
    ...(classifierResults.length > 0
      ? {
          ad_categories: classifierResults.map((r) => r.id),
          ad_confidences: classifierResults.map((r) => r.confidence)
        }
      : {}),
    sections: (editorSections || []).map((s) => emitSection(s, slug))
  };

  return `---\n${toYaml(doc)}\n---\n`;
}

/**
 * The card thumbnail and social image: the first section image, drawn from a
 * legacy multi-media section or a schema-driven one.
 * @param {Array<Object>} editorSections - The draft's sections.
 * @param {string} slug - The post slug.
 * @return {string} The image path, or ''.
 */
function computeThumbnail(editorSections, slug) {
  const legacyImage = editorSections.find((s) => s.type === 'multi-media' && s.imageName);
  if (legacyImage) {
    return `/assets/images/blog/${slug}/${legacyImage.imageName}`;
  }
  return firstSectionImage(editorSections, getSectionFields, slug);
}

/**
 * Emits one section, choosing the schema-driven or legacy path by model.
 * @param {Object} s - A section state object.
 * @param {string} slug - The post slug.
 * @return {Object} The library-schema section object.
 */
function emitSection(s, slug) {
  if (!s.sectionType) {
    return toLibrarySection(s, slug);
  }
  const fields = getSectionFields(s.sectionType);
  if (fields) {
    return serializeSection(s.sectionType, s, fields, slug);
  }
  // Schema not loaded (e.g. an early preview render before the fetch
  // resolves). The values object is already library-shaped, so emit it with
  // the wrapper fields and let the next render correct any image paths.
  const { type, ...rest } = s;
  void type;
  return { containerTag: 'section', id: '', classes: '', ...rest };
}
