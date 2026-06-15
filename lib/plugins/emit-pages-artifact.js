/**
 * Metalsmith plugin: snapshot every page's source frontmatter into one build
 * artifact (assets/pages.json) the admin editor fetches read-only to browse
 * and open existing pages.
 *
 * Placement matters. Run it after drafts() so draft:true pages are already
 * excluded, and before collections()/permalinks()/layouts() so the captured
 * frontmatter is the clean authored shape (no injected card/og/collection
 * data) and the file keys are still the source .md paths the publish Function
 * writes to. The editor hydrates from this exactly as it does from a loaded
 * .md file, so the read path stays a static fetch with no GitHub access.
 */

// Metalsmith file internals that are not authored frontmatter.
const INTERNAL_KEYS = new Set( [ 'contents', 'stats', 'mode' ] );

/**
 * Build the { sourcePath: { frontmatter, content } } map from a Metalsmith
 * files object. Pure: takes the files object, returns the serializable
 * artifact. Only .md sources are included; the markdown body (usually empty
 * for structured pages) rides along as `content` so the editor's existing
 * hydration path (frontmatter + content) round-trips unchanged.
 * @param {Object} files - The Metalsmith files object.
 * @return {Object} Map of source path to { frontmatter, content }.
 */
export function buildPagesArtifact( files ) {
  const pages = {};
  for ( const [ filePath, file ] of Object.entries( files ) ) {
    if ( !filePath.endsWith( '.md' ) ) {
      continue;
    }
    const frontmatter = {};
    for ( const [ key, value ] of Object.entries( file ) ) {
      if ( INTERNAL_KEYS.has( key ) ) {
        continue;
      }
      frontmatter[ key ] = value;
    }
    pages[ filePath ] = {
      frontmatter,
      content: file.contents ? file.contents.toString() : ''
    };
  }
  return pages;
}

/**
 * @param {Object} [options]
 * @param {string} [options.dest='assets/pages.json'] - Output path in the build.
 * @return {Function} A Metalsmith plugin.
 */
export default function emitPagesArtifact( options = {} ) {
  const dest = options.dest || 'assets/pages.json';
  return function ( files, metalsmith, done ) {
    const pages = buildPagesArtifact( files );
    files[ dest ] = { contents: Buffer.from( JSON.stringify( pages, null, 2 ), 'utf8' ) };
    done();
  };
}
