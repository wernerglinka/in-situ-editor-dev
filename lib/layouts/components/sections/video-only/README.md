# Video-Only Section Component

A specialized section component for displaying video content from multiple sources including YouTube, Vimeo, and Cloudinary. Supports both modal and inline video playback options with interactive controls.

## Features

- Multi-platform video support (YouTube, Vimeo, Cloudinary)
- Modal and inline playback modes
- Custom video thumbnails with play button overlay
- Time-based video segments (start/end times)
- Interactive JavaScript controls
- Responsive design with mobile optimization
- Support for multiple CTAs

## Video Sources Supported

- **YouTube**: Use video ID from YouTube URL
- **Vimeo**: Use video ID from Vimeo URL  
- **Cloudinary**: Requires cloudname parameter for video delivery

## Usage

### Basic YouTube Video (Modal)

```yaml
- sectionType: video-only
  containerTag: section
  video:
    id: 'dQw4w9WgXcQ'
    src: 'youtube'
    tn: '/assets/images/video-thumbnail.jpg'
    inline: false
  ctas:
    - url: 'https://example.com/playlist'
      label: 'View Playlist'
      isButton: true
      buttonStyle: 'primary'
```

### Inline Video with Time Segments

```yaml
- sectionType: video-only
  video:
    id: 'your-video-id'
    src: 'vimeo'
    tn: '/assets/images/thumbnail.jpg'
    inline: true
    start: 30    # Start at 30 seconds
    end: 120     # End at 2 minutes
```

### Cloudinary Video

```yaml
- sectionType: video-only
  video:
    id: 'your-video-id'
    src: 'cloudinary'
    cloudname: 'your-cloud-name'
    tn: '/assets/images/thumbnail.jpg'
```

## Required Properties

- `sectionType`: Must be `"video-only"`
- `video.id`: Video identifier from the platform
- `video.src`: Video platform (`"youtube"`, `"vimeo"`, or `"cloudinary"`)
- `video.tn`: Path to thumbnail image

## Optional Properties

- `video.inline`: Boolean for inline vs modal playback (default: `false`)
- `video.cloudname`: Cloudinary cloud name (required for Cloudinary videos)
- `video.start`: Start time in seconds
- `video.end`: End time in seconds
- `ctas`: Array of call-to-action buttons
- `containerFields`: Standard container options

## JavaScript Functionality

The component automatically initializes video functionality:

- **Modal Videos**: Opens video in overlay modal
- **Inline Videos**: Embeds video player directly in page
- **Play Button**: Interactive overlay with hover effects
- **Platform Detection**: Automatically loads appropriate video API

## Styling

- Responsive video containers with aspect ratio preservation
- Custom play button with scaling animation on hover
- Rounded corners matching site design system
- Dark/light theme support
- Mobile-optimized touch targets

## Files

- `video-only.njk` - Nunjucks template
- `video-only.css` - Component styles
- `video-only.js` - Interactive functionality
- `manifest.json` - Component configuration and validation
- `README.md` - This documentation

## Dependencies

- `ctas` partial component for call-to-action buttons
- `video` partial component for video rendering
- `commons` for shared styling utilities
- Modal video and inline video JavaScript modules