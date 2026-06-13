# Podcast Section Component

A comprehensive podcast player section component that dynamically fetches episodes from RSS feeds using the professional [Shikwasa audio player](https://shikwasa.js.org/). Features a single main player with episode selection, progressive loading, and fallback support for optimal user experience.

Shikwasa on [GitHub](https://github.com/jessuni/shikwasa)

## Features

- **Dynamic RSS Parsing** - Automatically fetches episodes from podcast RSS feeds
- **Professional Audio Player** - Powered by Shikwasa with advanced controls, speed adjustment, and keyboard navigation
- **Progressive Loading** - Shows 5 episodes initially with "Load More" functionality
- **Single Main Player** - Clean UI with one player and episode selection list
- **CORS Proxy Fallback** - Handles cross-origin RSS feeds automatically
- **iTunes Metadata** - Full support for iTunes podcast tags and namespaces
- **Responsive Design** - Mobile-optimized interface with touch-friendly controls
- **Graceful Fallbacks** - HTML5 audio fallback when Shikwasa fails to load
- **Container Styling** - Full section styling options (backgrounds, margins, padding)
- **CTA Support** - Optional call-to-action buttons below player

## Usage

### Basic RSS Configuration

```yaml
- sectionType: podcast
  containerTag: section
  podcast: 'ai-fireside-chat' # References data/podcasts/ai-fireside-chat.json
  options:
    showEpisodeList: true # Display episode list (default: true)
    initialEpisodes: 5 # Episodes shown initially (default: 5)
    maxEpisodes: 50 # Max episodes to fetch (default: 50)
    autoplay: false # Auto-play first episode (default: false)
    theme: 'auto' # Player theme: 'light', 'dark', 'auto'
    themeColor: '#007aff' # Player accent color
  ctas:
    - url: 'https://example.com/subscribe'
      label: 'Subscribe to Podcast'
      isButton: true
      buttonStyle: 'primary'
```

### Advanced Configuration

```yaml
- sectionType: podcast
  containerTag: section
  classes: 'featured-podcast'
  containerFields:
    inContainer: true
    isAnimated: true
    noMargin:
      top: false
      bottom: false
    noPadding:
      top: true
      bottom: true
    background:
      isDark: true
      image: '/assets/images/podcast-background.jpg'
      imageScreen: 'dark'
  podcast: 'tech-talk-weekly'
  options:
    showEpisodeList: true
    initialEpisodes: 3
    maxEpisodes: 25
    autoplay: false
    theme: 'dark'
    themeColor: '#ff6b35'
  ctas:
    - url: 'https://podcasts.apple.com/podcast/tech-talk'
      label: 'Listen on Apple Podcasts'
      isButton: true
      buttonStyle: 'inverted'
    - url: 'https://open.spotify.com/show/tech-talk'
      label: 'Spotify'
      isButton: false
```

## Required Properties

- `sectionType`: Must be `"podcast"`
- `podcast`: Name of JSON file in `data/podcasts/` (without `.json` extension)

## Optional Properties

### Podcast Player Options

- `options.showEpisodeList` (boolean, default: true): Display the episode selection list
- `options.initialEpisodes` (number, default: 5): Number of episodes shown initially
- `options.maxEpisodes` (number, default: 50): Maximum episodes to fetch from RSS
- `options.autoplay` (boolean, default: false): Auto-play first episode on load
- `options.theme` (string, default: 'auto'): Player theme ('light', 'dark', 'auto')
- `options.themeColor` (string, default: '#007aff'): Player accent color (hex)

### Container Configuration

- `containerTag` (string): HTML tag for section container (`section`, `article`, `aside`, `div`)
- `classes` (string): Additional CSS classes for the section
- `containerFields`: Standard container styling options
  - `inContainer` (boolean): Wrap content in container div
  - `isAnimated` (boolean): Enable scroll animations
  - `noMargin.top/bottom` (boolean): Remove default margins
  - `noPadding.top/bottom` (boolean): Remove default padding
  - `background`: Background styling options
    - `color` (string): Solid background color
    - `isDark` (boolean): Dark theme variant
    - `image` (string): Background image path
    - `imageScreen` (string): Image overlay ('light', 'dark', 'none')

### Call-to-Action Options

- `ctas` (array): Optional call-to-action buttons
  - `url` (string): Link destination
  - `label` (string): Button text
  - `isButton` (boolean): Style as button vs text link
  - `buttonStyle` (string): Button styling ('primary', 'secondary', 'tertiary', 'inverted')

## Data Structure

The component references JSON podcast files in `lib/data/podcasts/`. Each file should contain:

### RSS-Based Podcast (Recommended)

```json
{
  "title": "AI Fireside Chat",
  "description": "Conversations about artificial intelligence, machine learning, and the future of technology",
  "coverImage": "/assets/images/ai-fireside-cover.jpg",
  "rssUrl": "https://media.rss.com/fire-side-chat-brady-bunch-shoots-the-shit-1/feed.xml",
  "platform": "apple",
  "podcastUrl": "https://podcasts.apple.com/us/podcast/ai-fireside-chat/id1780606504"
}
```

### Static Episodes (Alternative)

```json
{
  "title": "Internal Tech Talk",
  "description": "Weekly discussions about web development and technology",
  "coverImage": "/assets/images/internal-cover.jpg",
  "platform": "internal",
  "episodes": [
    {
      "id": "episode-1",
      "title": "Getting Started with Static Sites",
      "episodeNumber": "001",
      "publishDate": "2024-01-20",
      "duration": "12:45",
      "audioFile": "/assets/audio/episode-001.mp3",
      "thumbnail": "/assets/images/episode-001.jpg",
      "description": "An introduction to static site generators and their benefits."
    }
  ]
}
```

## RSS Feed Support

The component automatically parses RSS feeds and extracts:

- **Episode Metadata**: Title, description, publish date, duration
- **Audio Files**: MP3 enclosures from RSS items
- **iTunes Tags**: Episode numbers, thumbnails, explicit flags
- **Namespace Handling**: Full support for iTunes and other podcast namespaces
- **Error Recovery**: Graceful handling of malformed or incomplete RSS data

### Supported RSS Elements

- `<title>`, `<description>`, `<pubDate>`
- `<enclosure>` for audio files
- `<itunes:duration>`, `<itunes:episode>`, `<itunes:image>`
- `<itunes:explicit>`, `<itunes:episodeType>`

## Progressive Loading Behavior

1. **Initial Load**: Shows first 5 episodes (configurable)
2. **Load More Button**: Displays remaining episode count
3. **Batch Loading**: Loads 5 more episodes per click
4. **Auto-removal**: Button disappears when all episodes loaded
5. **Event Management**: Properly handles listeners for new episodes

## Player Features (Shikwasa)

- **Advanced Controls**: Play/pause, progress bar, volume, speed control
- **Speed Options**: 0.75x, 1x, 1.25x, 1.5x, 2x playback speeds
- **Keyboard Navigation**: Space (play/pause), arrow keys (seek), M (mute)
- **Chapter Support**: Displays chapters if available in podcast
- **Download Option**: Built-in download functionality
- **Theme Support**: Light, dark, and auto (system preference) themes
- **Mobile Optimized**: Touch-friendly controls and responsive design

## Fallback Strategy

When Shikwasa fails to load:

1. **HTML5 Audio**: Falls back to native browser audio controls
2. **Episode Switching**: Maintains episode selection functionality
3. **Loading Indicator**: Shows fallback state to user
4. **Error Logging**: Logs specific failure reasons to console

## Styling Examples

### Podcast with Dark Theme

```yaml
- sectionType: podcast
  containerFields:
    background:
      isDark: true
      color: '#1a1a1a'
  podcast: 'tech-podcast'
  options:
    theme: 'dark'
    themeColor: '#ff6b35'
  ctas:
    - label: 'Subscribe'
      isButton: true
      buttonStyle: 'inverted'
```

### Minimal Podcast Player

```yaml
- sectionType: podcast
  containerFields:
    inContainer: true
    background:
      color: '#f8f9fa'
  podcast: 'minimal-show'
  options:
    initialEpisodes: 3
    theme: 'light'
```

## Use Cases

### Professional Podcasts

- **RSS Integration**: Automatic episode updates from hosting platforms
- **Platform Links**: Direct links to Apple Podcasts, Spotify, etc.
- **Rich Metadata**: Episode descriptions, thumbnails, publish dates
- **Subscribe CTAs**: Encourage platform subscriptions

### Internal Company Podcasts

- **Mixed Content**: Combine RSS feeds with internal audio files
- **Custom Branding**: Match company colors and themes
- **Progressive Disclosure**: Don't overwhelm with too many episodes

### Educational Content

- **Course Series**: Sequential lessons with clear progression
- **Topic Organization**: Group related episodes logically
- **Accessibility**: Full keyboard navigation and screen reader support

## Performance Considerations

- **Lazy Loading**: Episodes loaded progressively to reduce initial page weight
- **CORS Proxy**: Only used when direct RSS access fails
- **Efficient Parsing**: Optimized XML parsing with namespace support
- **Event Delegation**: Minimal event listeners with proper cleanup
- **CDN Assets**: Shikwasa loaded from jsDelivr CDN

## Accessibility Features

- **Semantic Structure**: Proper heading hierarchy and navigation
- **Keyboard Support**: Full keyboard navigation (Shikwasa built-in)
- **Screen Reader**: Descriptive labels and ARIA attributes
- **Focus Management**: Clear focus indicators and logical tab order
- **Audio Controls**: Native and enhanced audio control accessibility

## Browser Support

- **Modern Browsers**: Full Shikwasa functionality in current browsers
- **Progressive Enhancement**: HTML5 audio fallback for older browsers
- **Mobile Optimized**: Touch-friendly interface on mobile devices
- **Cross-platform**: Consistent experience across operating systems

## Files Structure

```
podcast/
├── podcast.njk                 # Section template
├── podcast.js                  # Main component logic
├── rss-parser.js              # RSS feed parsing utility
├── load-shikwasa.js           # Shikwasa library loader
├── podcast.css                # Complete component styles (includes Shikwasa CSS)
├── manifest.json              # Component configuration
└── README.md                  # This documentation
```

## Dependencies

- **Shikwasa Player**: Professional podcast player (loaded from CDN)
- **ctas partial**: Call-to-action button rendering
- **commons**: Shared styling utilities

## Validation Schema

The component includes comprehensive validation in `manifest.json`:

- **Required fields**: sectionType, podcast
- **Type constraints**: Number ranges for episode counts
- **Enum validation**: Theme options and button styles
- **Default values**: Sensible defaults for all optional settings

## Integration with Build System

- **Automatic bundling**: CSS/JS included only when component is used
- **Data loading**: Podcast JSON files automatically available as `data.podcasts`
- **Asset optimization**: Images and audio files processed through build pipeline
- **Component validation**: JSON schema validation during build

## RSS Feed Requirements

For optimal compatibility, RSS feeds should include:

- **Valid XML**: Well-formed XML with proper encoding
- **iTunes Namespace**: `xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"`
- **Episode Enclosures**: `<enclosure>` tags with MP3 audio files
- **Basic Metadata**: Title, description, publication date for each episode

## Troubleshooting

### Common Issues

1. **CORS Errors**: Component automatically uses proxy fallback
2. **Invalid RSS**: Check console for specific parsing errors
3. **Missing Audio**: Verify enclosure URLs are accessible
4. **Player Not Loading**: Check network connectivity and CDN access

### Debug Mode

Enable console logging by checking browser developer tools for detailed parsing information including:

- RSS fetch method used (direct vs proxy)
- Number of episodes found
- XML parsing results
- Episode validation details
