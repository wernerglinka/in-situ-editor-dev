/**
 * Metalsmith plugin: snapshot the site's build-time data into one artifact
 * (assets/site-data.json) the admin editor fetches read-only, so sections that
 * consume data files or collections can be previewed and (later) authored
 * against the site's real data.
 *
 * The artifact has two parts:
 * - `data`: the metadata.data namespace verbatim (the lib/data/*.json files,
 *   e.g. data.author, data.site). This is authored, already-public content; it
 *   renders into the site, so emitting it is no new exposure.
 * - `collections`: each collection name mapped to the ordered list of its
 *   member source paths (the same .md keys that key assets/pages.json), so the
 *   editor joins to pages.json rather than duplicating entry frontmatter.
 *
 * Placement matters. Run it after collections() (so metadata.collections is
 * populated) and before permalinks() (so the files object still keys members
 * by their source .md path, matching pages.json). Collection entries are the
 * same file objects that are values in the files map, so membership is
 * resolved by object identity.
 */

/**
 * Build the { data, collections } artifact from a Metalsmith files object and
 * metadata. Pure: takes the inputs, returns the serializable artifact.
 * @param {Object} files - The Metalsmith files object.
 * @param {Object} metadata - The Metalsmith metadata (has .data and .collections).
 * @return {Object} { data, collections }.
 */
export function buildDataArtifact( files, metadata ) {
  const meta = metadata || {};
  // file object -> its source path, so collection members map back to the
  // keys used by assets/pages.json.
  const pathOf = new Map();
  for ( const [ filePath, file ] of Object.entries( files ) ) {
    pathOf.set( file, filePath );
  }
  const collections = {};
  for ( const [ name, entries ] of Object.entries( meta.collections || {} ) ) {
    if ( !Array.isArray( entries ) ) {
      continue;
    }
    collections[ name ] = entries.map( ( entry ) => pathOf.get( entry ) ).filter( Boolean );
  }
  return { data: meta.data || {}, collections };
}

/**
 * @param {Object} [options]
 * @param {string} [options.dest='assets/site-data.json'] - Output path in the build.
 * @return {Function} A Metalsmith plugin.
 */
export default function emitDataArtifact( options = {} ) {
  const dest = options.dest || 'assets/site-data.json';
  return function ( files, metalsmith, done ) {
    const artifact = buildDataArtifact( files, metalsmith.metadata() );
    files[ dest ] = { contents: Buffer.from( JSON.stringify( artifact, null, 2 ), 'utf8' ) };
    done();
  };
}
