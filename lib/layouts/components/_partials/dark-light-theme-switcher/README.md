# Dark Light Theme Switcher Component

Toggle component for switching between light and dark themes with persistent state management using localStorage.

## Features

- **Theme Toggle**: Seamless switching between light and dark themes
- **State Persistence**: Remembers user preference using localStorage
- **Automatic Application**: Applies saved theme on page load
- **Body Class Management**: Toggles `.dark-theme` class on body element
- **JavaScript Integration**: Fully functional toggle with event handling

## Data Structure

```yaml
# No data structure required - component is self-contained
```

## JavaScript Functionality

The component automatically:
1. Listens for click events on `.js-theme-toggle` elements
2. Toggles the `dark-theme` class on the document body
3. Saves the current theme preference to localStorage
4. Applies the saved theme on subsequent page loads

## HTML Structure

```html
<button class="theme-toggle js-theme-toggle" aria-label="Toggle dark/light theme">
  <span class="theme-toggle-icon">🌙</span>
</button>
```

## CSS Classes

- `.theme-toggle`: Main toggle button styling
- `.js-theme-toggle`: JavaScript hook for event handling
- `.dark-theme`: Applied to body when dark theme is active

## Theme Implementation

### CSS Variables Approach
```css
:root {
  --background-color: #ffffff;
  --text-color: #000000;
}

.dark-theme {
  --background-color: #000000;
  --text-color: #ffffff;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
}
```

### Direct CSS Approach
```css
body {
  background-color: #ffffff;
  color: #000000;
}

.dark-theme {
  background-color: #000000;
  color: #ffffff;
}
```

## Usage Examples

### Basic Toggle Button
```html
<button class="theme-toggle js-theme-toggle">
  Toggle Theme
</button>
```

### Icon-Based Toggle
```html
<button class="theme-toggle js-theme-toggle" aria-label="Toggle theme">
  <svg class="theme-icon">
    <!-- Theme icon SVG -->
  </svg>
</button>
```

### Text-Based Toggle
```html
<button class="theme-toggle js-theme-toggle">
  <span class="light-text">🌞 Light</span>
  <span class="dark-text">🌙 Dark</span>
</button>
```

## JavaScript API

### Manual Theme Setting
```javascript
// Set dark theme
document.body.classList.add('dark-theme');
localStorage.setItem('theme', 'dark');

// Set light theme
document.body.classList.remove('dark-theme');
localStorage.setItem('theme', 'light');
```

### Check Current Theme
```javascript
const isDarkTheme = document.body.classList.contains('dark-theme');
const savedTheme = localStorage.getItem('theme');
```

## Browser Support

- **localStorage**: Supported in all modern browsers
- **classList**: Supported in IE10+ and all modern browsers
- **Event Listeners**: Universal support

## Best Practices

1. **Accessibility**: Include proper ARIA labels for screen readers
2. **Visual Feedback**: Provide clear visual indication of current theme
3. **Performance**: Theme switching should be instantaneous
4. **Consistency**: Ensure all components support both themes
5. **Default Theme**: Set a sensible default theme (usually light)

## Accessibility

- Use `aria-label` to describe the toggle function
- Ensure sufficient color contrast in both themes
- Maintain focus indicators in both light and dark modes
- Test with screen readers to ensure proper announcement

## Theme Variables

Consider using CSS custom properties for consistent theming:

```css
:root {
  --primary-bg: #ffffff;
  --primary-text: #000000;
  --secondary-bg: #f5f5f5;
  --accent-color: #007bff;
}

.dark-theme {
  --primary-bg: #1a1a1a;
  --primary-text: #ffffff;
  --secondary-bg: #2d2d2d;
  --accent-color: #66b3ff;
}
```