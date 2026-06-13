/**
 * RSS Feed Parser for Podcast Episodes
 * Handles fetching and parsing podcast RSS feeds with CORS proxy fallback
 */

/**
 * Parse RSS feed and extract episode data
 * @param {string} rssUrl - The RSS feed URL
 * @param {Object} options - Parsing options
 * @returns {Promise<Array>} Array of episode objects
 */
async function parseRSSFeed(rssUrl, options = {}) {
  const {
    maxEpisodes = 50,
    corsProxy = 'https://api.allorigins.win/get?url=',
    timeout = 10000, // 10 second timeout
    localCoverImage = '' // Local cover image to prefer over RSS feed images
  } = options;

  try {
    let response;
    let xmlText;

    try {
      response = await Promise.race([
        fetch(rssUrl),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
      ]);
      if (!response.ok) {throw new Error(`Direct fetch failed: ${response.status}`);}
      xmlText = await response.text();
    } catch (error) {
      // Fallback to CORS proxy
      console.warn('Direct fetch failed, using CORS proxy:', error.message);
      const proxyUrl = `${corsProxy}${encodeURIComponent(rssUrl)}`;
      response = await Promise.race([
        fetch(proxyUrl),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Proxy timeout')), timeout))
      ]);
      if (!response.ok) {throw new Error(`Proxy fetch failed: ${response.status}`);}

      // Sequential await needed - must wait for response before processing
       
      const data = await response.json();
      xmlText = data.contents;
      
      // Check if the response is base64 encoded (common with some CORS proxies)
      if (xmlText.startsWith('data:application/rss+xml;base64,')) {
        const base64Data = xmlText.replace('data:application/rss+xml;base64,', '');
        xmlText = atob(base64Data);
      }
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for parsing errors with detailed debugging
    const parseErrors = xmlDoc.getElementsByTagName('parsererror');
    if (parseErrors.length > 0) {
      console.error('XML parsing errors:', parseErrors[0].textContent);
      console.error('First 500 chars of XML:', xmlText.substring(0, 500));
      throw new Error(`Invalid XML format: ${parseErrors[0].textContent}`);
    }
    
    // Additional validation
    if (!xmlDoc.documentElement) {
      console.error('No document element found');
      throw new Error('No document element in XML');
    }
    
    // Extract channel info
    const channel = xmlDoc.querySelector('channel');
    if (!channel) {throw new Error('No channel found in RSS feed');}

    // Extract channel-level image first to check if episodes use it
    let channelImageUrl = '';
    const channelImages = channel.getElementsByTagNameNS('*', 'image') ||
                         channel.getElementsByTagName('itunes:image') ||
                         channel.getElementsByTagName('image');
    if (channelImages && channelImages.length > 0) {
      channelImageUrl = channelImages[0].getAttribute('href') || channelImages[0].textContent?.trim() || '';
    }

    // Extract episodes from items
    const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, maxEpisodes);

    // eslint-disable-next-line complexity
    const episodes = items.map((item, index) => {
      const title = getTextContent(item, 'title');
      const description = getTextContent(item, 'description');
      const pubDate = getTextContent(item, 'pubDate');
      const enclosure = item.querySelector('enclosure');
      const duration = getTextContent(item, 'itunes\\:duration') ||
                      getTextContent(item, 'duration') ||
                      item.querySelector('duration')?.textContent?.trim();
      const episodeNumber = getTextContent(item, 'itunes\\:episode') ||
                           String(items.length - index).padStart(3, '0');
      // Try to get episode thumbnail using safe namespace handling
      let thumbnail = '';
      let hasEpisodeImage = false;
      const itunesImages = item.getElementsByTagNameNS('*', 'image') ||
                          item.getElementsByTagName('itunes:image') ||
                          item.getElementsByTagName('image');

      if (itunesImages && itunesImages.length > 0) {
        thumbnail = itunesImages[0].getAttribute('href') || itunesImages[0].textContent?.trim() || '';
        hasEpisodeImage = true;
      }

      // If no episode-specific image, prefer local cover over channel fallback
      // This avoids issues with external CDN URLs that may fail to load
      if (!hasEpisodeImage) {
        thumbnail = localCoverImage || channelImageUrl || '';
      }

      return {
        id: `episode-${episodeNumber}`,
        title: title || 'Untitled Episode',
        episodeNumber: episodeNumber,
        publishDate: formatDate(pubDate),
        duration: formatDuration(duration),
        audioFile: enclosure?.getAttribute('url') || '',
        thumbnail: thumbnail || '',
        description: cleanDescription(description)
      };
    });

    const validEpisodes = episodes.filter(episode => episode.audioFile);
    return validEpisodes;

  } catch (error) {
    console.error('Failed to parse RSS feed:', error);
    throw new Error(`RSS parsing failed: ${error.message}`);
  }
}

/**
 * Get text content from XML element, handling namespaces
 */
function getTextContent(parent, selector) {
  // For iTunes namespace, we need to use getElementsByTagName instead of querySelector
  if (selector.includes('itunes')) {
    const tagName = selector.replace('itunes\\:', '').replace('itunes:', '');
    const elements = parent.getElementsByTagNameNS('*', tagName) || 
                    parent.getElementsByTagName(`itunes:${tagName}`) ||
                    parent.getElementsByTagName(tagName);
    
    if (elements && elements.length > 0) {
      return elements[0].textContent?.trim() || elements[0].getAttribute('href') || '';
    }
    return '';
  }
  
  // For regular elements, use querySelector
  try {
    const element = parent.querySelector(selector);
    return element?.textContent?.trim() || '';
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return '';
  }
}

/**
 * Format publication date
 */
function formatDate(pubDate) {
  if (!pubDate) {return '';}
  
  try {
    const date = new Date(pubDate);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch {
    return pubDate;
  }
}

/**
 * Format duration from various formats to MM:SS or HH:MM:SS
 */
function formatDuration(duration) {
  if (!duration) {return '';}
  
  // Handle seconds-only format
  if (/^\d+$/.test(duration)) {
    const totalSeconds = parseInt(duration);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } 
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
  }
  
  // Return as-is if already formatted
  return duration;
}

/**
 * Clean HTML from description and truncate
 */
function cleanDescription(description) {
  if (!description) {return '';}
  
  // Remove HTML tags
  const cleaned = description.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = cleaned;
  const decoded = textarea.value;
  
  // Truncate if too long
  return decoded.length > 200 ? `${decoded.substring(0, 200)  }...` : decoded;
}

export { parseRSSFeed };