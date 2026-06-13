# Code Section Component

A specialized component for displaying syntax-highlighted code blocks with enhanced features. Extends the existing Prism.js implementation used in rich-text sections with additional functionality including language labels, copy-to-clipboard, dynamic theme loading, and file naming capabilities.

## Features

- **Syntax Highlighting**: Uses Prism.js via metalsmith-prism plugin for accurate syntax highlighting
- **Language Labels**: Displays the programming language in a styled header tab
- **Copy to Clipboard**: One-click copying with visual feedback and accessibility support
- **Dynamic Theme Loading**: Load Prism themes on-demand from CDN for enhanced styling
- **File Names**: Optional filename display in the code header
- **Theme Display**: Shows current theme name for reference
- **Responsive Design**: Mobile-friendly layout with proper scaling
- **Accessibility**: ARIA labels and keyboard support for all interactive elements
- **Integration**: Works seamlessly with existing metalsmith-prism build pipeline

## Data Structure

```yaml
- sectionType: code
  containerTag: section      # section, article, or div
  disabled: false
  id: ""
  classes: ""
  containerFields:
    inContainer: true
    isAnimated: true
    noMargin:
      top: false
      bottom: false
    noPadding:
      top: false
      bottom: false
    background:
      color: ""
      image: ""
      imageScreen: "none"
  code:
    language: "javascript"    # Programming language for highlighting
    theme: "prism"           # Prism theme (see Available Themes)
    filename: "example.js"   # Optional filename display
    showCopy: true          # Enable/disable copy button (default: true)
    content: |-             # Code content as markdown code block
      ```javascript
      /**
       * Example JavaScript function
       * @param {string} name - The name to greet
       * @returns {string} Greeting message
       */
      function greet(name) {
        return `Hello, ${name}!`;
      }
      ```
```

## Available Themes

The component supports multiple Prism themes that are loaded dynamically from CDN:

- `default` - Uses the existing theme from rich-text component
- `tomorrow` - GitHub-style dark theme
- `okaidia` - Monokai-inspired theme
- `twilight` - TextMate twilight theme
- `prism` - Clean light theme
- `dark` - High contrast dark theme
- `solarizedlight` - Solarized light theme
- `coy` - Minimal light theme

### Adding New Themes

To add a new Prism theme:

1. **Add to PRISM_THEMES object** in `code.js`:
```javascript
const PRISM_THEMES = {
  // existing themes...
  newtheme: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/themes/prism-newtheme.min.css'
};
```

2. **Update manifest validation** in `manifest.json` to include the new theme in the enum:
```json
"code.theme": {
  "type": "string",
  "enum": ["default", "tomorrow", "okaidia", "twilight", "prism", "dark", "solarizedlight", "coy", "newtheme"],
  "default": "default",
  "description": "Prism theme to load dynamically"
}
```

3. **Update documentation** to include the new theme in the Available Themes list above

4. **Use in content** by setting `theme: 'newtheme'` in your code configuration

**Note**: If you don't update the manifest.json enum, you'll get validation warnings during the build process.

## Supported Languages

The component supports all languages available in Prism.js including:
- JavaScript, TypeScript, JSX, TSX
- HTML, CSS, SCSS, Less, Stylus
- Python, PHP, Ruby, Java, C#, C++
- Go, Rust, Swift, Kotlin
- YAML, JSON, XML, Markdown
- Bash, PowerShell, SQL
- And many more...

## HTML Structure

```html
<div class="content container">
  <div class="code-block theme-prism" data-theme="prism">
    
    <!-- Code Header -->
    <div class="code-header">
      <div class="code-info">
        <span class="filename">example.js</span>
        <span class="theme">Theme: prism</span>
      </div>
      <div class="code-actions">
        <span class="language-label">javascript</span>
        <button class="copy-button" type="button" aria-label="Copy code to clipboard">
          <!-- Copy icon SVG -->
        </button>
      </div>
    </div>
    
    <!-- Code Content (processed by metalsmith-prism) -->
    <div class="code-content">
      <pre class="language-javascript"><code class="language-javascript">
        <!-- Syntax-highlighted code here -->
      </code></pre>
    </div>
    
  </div>
</div>
```

## CSS Architecture

### Theme System
Uses class-based theme isolation to prevent style conflicts:
```css
.code-block.theme-tomorrow {
  /* Theme-specific overrides */
}

.theme-tomorrow pre[class*="language-"] {
  /* Scoped theme styles */
}
```

### Header Layout
```css
.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-s) var(--space-m);
  background: var(--color-light);
  border-bottom: 1px solid var(--color-border);
}
```

### Copy Button
```css
.copy-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: var(--radius-s);
  transition: background-color 0.2s ease;
}
```

## JavaScript Functionality

### Dynamic Theme Loading
Themes are loaded on-demand when code blocks are detected:
```javascript
function loadPrismTheme(theme) {
  // Fetches CSS from CDN and applies with proper scoping
  // Uses theme-specific class targeting for isolation
}
```

### Copy to Clipboard
Robust clipboard functionality with fallbacks:
```javascript
function copyToClipboard(text) {
  // Uses modern Clipboard API with fallback for older browsers
  // Provides visual feedback on successful copy
}
```

### Theme Application
```javascript
// Automatically loads themes for all code blocks on page load
document.addEventListener('DOMContentLoaded', function() {
  const codeBlocks = document.querySelectorAll('.code-block[data-theme]');
  codeBlocks.forEach(block => {
    const theme = block.dataset.theme;
    loadPrismTheme(theme);
  });
});
```

## Usage Patterns

### Basic Code Example
```yaml
- sectionType: code
  code:
    language: "javascript"
    theme: "prism"
    filename: "app.js"
    content: |-
      ```javascript
      console.log('Hello, World!');
      ```
```

### Documentation Code Block
```yaml
- sectionType: code
  containerFields:
    inContainer: true
  code:
    language: "yaml"
    theme: "tomorrow"
    filename: "config.yml"
    showCopy: true
    content: |-
      ```yaml
      # Configuration example
      server:
        host: localhost
        port: 3000
      ```
```

### Styled Code with Dark Theme
```yaml
- sectionType: code
  containerFields:
    background:
      color: "#1a1a1a"
  code:
    language: "css"
    theme: "okaidia"
    filename: "styles.css"
    content: |-
      ```css
      .dark-theme {
        background: #1a1a1a;
        color: #ffffff;
      }
      ```
```

### Multi-language Tutorial
```yaml
# JavaScript Example
- sectionType: code
  code:
    language: "javascript"
    theme: "prism"
    filename: "example.js"
    content: |-
      ```javascript
      const greeting = name => `Hello, ${name}!`;
      ```

# Python Example  
- sectionType: code
  code:
    language: "python"
    theme: "tomorrow"
    filename: "example.py"
    content: |-
      ```python
      def greeting(name):
          return f"Hello, {name}!"
      ```
```

## Content Structure

### Code Properties
- **language**: Programming language for syntax highlighting (required)
- **theme**: Prism theme name for dynamic loading (defaults to 'default')
- **filename**: Optional filename to display in header
- **showCopy**: Boolean to show/hide copy button (defaults to true)
- **content**: Code content as markdown code block with triple backticks

### Content Format
The content field should contain a proper markdown code block:
```yaml
content: |-
  ```language
  // Your code here
  ```
```

This approach:
- Leverages existing metalsmith-prism plugin processing
- Ensures consistency with rich-text component behavior
- Provides build-time syntax highlighting for better performance
- Maintains proper markdown structure in content files

## Dependencies

- `metalsmith-prism`: Core syntax highlighting during build process
- `icon`: Copy button icon rendering
- `mdToHTML`: Markdown processing filter for content
- CDN resources: Dynamic Prism theme loading from cdnjs.cloudflare.com

## Integration

### With metalsmith-prism
The component works seamlessly with the existing metalsmith-prism plugin:
1. Content is stored as markdown code blocks in frontmatter
2. `mdToHTML` filter processes the markdown during template rendering  
3. metalsmith-prism plugin applies syntax highlighting during build
4. Dynamic themes enhance the base highlighting with custom styles

### Build Pipeline
```
Frontmatter YAML → mdToHTML filter → metalsmith-prism → Enhanced styling
```

## Customization

### Custom Classes
Add styling through component classes:
```yaml
classes: "featured-code highlight-block"
```

### Styling Hooks
Key CSS classes for customization:
- `.code-block`: Main component container
- `.code-header`: Header with filename and actions
- `.code-content`: Code display area
- `.copy-button`: Copy to clipboard button
- `.language-label`: Language indicator
- `.filename`: File name display

### Theme Customization
Create custom theme variations:
```css
.code-block.theme-custom {
  border: 2px solid var(--color-primary);
}

.theme-custom .code-header {
  background: var(--color-primary);
  color: white;
}
```

### Header Layout
Customize the code header appearance:
```css
.minimal-header .code-header {
  padding: var(--space-xs);
  font-size: var(--font-small);
}

.no-header .code-header {
  display: none;
}
```

## Accessibility

- **Semantic Structure**: Proper HTML structure with meaningful elements
- **ARIA Labels**: Copy button includes descriptive aria-label
- **Keyboard Support**: Copy button accessible via keyboard navigation
- **Screen Reader Support**: Code content properly announced
- **Focus Management**: Clear focus indicators on interactive elements
- **High Contrast**: Works with high contrast mode and custom themes

## Best Practices

1. **Language Specification**: Always specify the correct language for accurate highlighting
2. **Theme Selection**: Choose themes that complement your site's design system
3. **File Naming**: Use descriptive filenames that help users understand the code context
4. **Content Structure**: Use proper markdown code block formatting with language tags
5. **Accessibility**: Test copy functionality with keyboard navigation
6. **Performance**: Limit to essential themes to minimize network requests

## Performance Considerations

- **Build-time Processing**: Syntax highlighting happens at build time via metalsmith-prism
- **Dynamic Loading**: Themes are loaded only when needed from CDN
- **CSS Scoping**: Theme CSS is scoped to prevent global style conflicts
- **Minimal JavaScript**: Lightweight client-side code for enhanced features
- **Efficient Caching**: CDN resources are cacheable for repeat visits

## SEO Benefits

- **Clean Markup**: Semantic HTML structure aids search engine understanding
- **Code Indexing**: Properly formatted code blocks are indexable by search engines
- **Context Clues**: Filenames and language labels provide additional content context
- **Performance**: Fast loading with build-time processing improves search rankings

The code component provides a comprehensive solution for displaying code examples while maintaining excellent performance, accessibility, and integration with the existing Metalsmith build pipeline.