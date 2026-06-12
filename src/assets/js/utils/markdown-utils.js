/**
 * Structured-frontmatter emitter. Maps the editor's lean section state
 * (see editor/section-builder.js) onto the nunjucks-components library
 * schema and serializes the whole document as YAML frontmatter with an
 * empty body. Rendered by lib/layouts/pages/sections.njk.
 */

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
  if (s.type === 'media-image') {
    return {
      sectionType: 'media-image',
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
    sectionType: 'text-only',
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
    editorSections = [ { type: 'text-only', title: '', prose: content } ];
  }

  // First section image doubles as the card thumbnail and social image.
  const firstImage = (editorSections || []).find((s) => s.type === 'media-image' && s.imageName);
  const thumbnail = firstImage ? `/assets/images/blog/${slug}/${firstImage.imageName}` : '';

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
    sections: (editorSections || []).map((s) => toLibrarySection(s, slug))
  };

  return `---\n${toYaml(doc)}\n---\n`;
}
