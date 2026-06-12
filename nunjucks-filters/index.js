/**
 * Nunjucks Filters
 *
 * This file imports and re-exports all custom Nunjucks filters used in templates.
 * Filters are organized by category for better maintainability.
 */

// String manipulation filters
export {
  toLower,
  toUpper,
  spaceToDash,
  condenseTitle,
  trimSlashes,
  trimString
} from './string-filters.js';

// Date formatting filters
export {
  currentYear,
  UTCdate,
  blogDate,
  getDate,
  getMonthYear
} from './date-filters.js';

// Markdown processing
export { mdToHTML } from './markdown-filter.js';

// Array manipulation filters
export {
  getSelections,
  toArray,
  getArrayLength,
  isArray,
  isRelated
} from './array-filters.js';

// Debug and JSON formatting filters
export {
  objToString,
  myDump,
  safeDump,
  debugCollections
} from './debug-filters.js';

// Validation and check filters
export {
  isExternal,
  isString,
  hasImage,
  hasCtas,
  hasText,
  hasAuthor,
  hasUrl,
  hasItems,
  hasIcon
} from './validation-filters.js';

// Object manipulation filters
export {
  normalizeIcon,
  mergeProps,
  merge,
  getDownloadUrl
} from './object-filters.js';