# Audio-Only Section Component

A specialized section component for audio content including podcasts, music, sound effects, or any audio media. Supports multiple audio formats with optional background imagery for enhanced visual presentation.

## Features

- Multi-format audio support (OGG, MP3) for maximum browser compatibility
- Optional cover art or background imagery
- Responsive HTML5 audio controls
- Custom styling that matches site theme
- Dark and light theme variations
- Accessibility-focused design
- Support for CTAs and container styling

## Audio Format Support

The component supports multiple formats for optimal browser compatibility:

- **OGG**: Open-source audio format with excellent quality
- **MP3**: Widely supported format for maximum compatibility
- Browsers automatically select the best supported format

## Usage

### Basic Audio with Cover Art

```yaml
- sectionType: audio-only
  containerTag: section
  audio:
    ogg: '/assets/audio/podcast-episode.ogg'
    mpeg: '/assets/audio/podcast-episode.mp3'
    bgImage: '/assets/images/podcast-cover.jpg'
    alt: 'Podcast episode cover art'
  ctas:
    - url: 'https://example.com/podcast'
      label: 'Subscribe to Podcast'
      isButton: true
      buttonStyle: 'primary'
```

### Simple Audio Player (No Cover)

```yaml
- sectionType: audio-only
  audio:
    ogg: '/assets/audio/music-track.ogg'
    mpeg: '/assets/audio/music-track.mp3'
    bgImage: ''
    alt: ''
```

### Audio with Background Styling

```yaml
- sectionType: audio-only
  containerFields:
    background:
      isDark: true
      image: '/assets/images/studio-background.jpg'
      imageScreen: 'dark'
  audio:
    ogg: '/assets/audio/interview.ogg'
    mpeg: '/assets/audio/interview.mp3'
    bgImage: '/assets/images/guest-photo.jpg'
    alt: 'Photo of interview guest'
```

## Required Properties

- `sectionType`: Must be `"audio-only"`
- `audio.mpeg`: Path to MP3 audio file (required for compatibility)

## Optional Properties

- `audio.ogg`: Path to OGG audio file (recommended for quality)
- `audio.bgImage`: Path to cover art or background image
- `audio.alt`: Alternative text for the background image
- `ctas`: Array of call-to-action buttons
- `containerFields`: Standard container options (background, margins, padding, etc.)

## Use Cases

Perfect for various audio content types:

- **Podcasts**: Episode players with cover art
- **Music**: Song or album samples
- **Interviews**: Audio testimonials or conversations  
- **Sound Effects**: Demo audio for creative projects
- **Educational**: Audio lessons or tutorials
- **Announcements**: Important audio messages

## Styling Features

- Centered layout with responsive design
- Custom audio control styling that matches site theme
- Cover images with rounded corners
- Proper spacing between audio player and CTAs
- Dark theme support with appropriate control styling
- Mobile-optimized touch targets

## Accessibility

- Semantic HTML5 audio elements
- Proper alt text support for cover images
- Keyboard-accessible controls
- Screen reader compatible

## Files

- `audio-only.njk` - Nunjucks template
- `audio-only.css` - Component styles
- `manifest.json` - Component configuration and validation
- `README.md` - This documentation

## Dependencies

- `ctas` partial component for call-to-action buttons
- `audio` partial component for audio rendering
- `commons` for shared styling utilities

## Browser Support

HTML5 audio is supported by all modern browsers. The component provides fallback text for browsers that don't support audio elements.