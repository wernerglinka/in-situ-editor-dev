# Header Section

Site header component with navigation, branding, and optional utility elements like search and theme switching.

## Features

- **Responsive Navigation**: Collapsible mobile menu with hamburger toggle
- **Brand Identity**: Logo and site title display
- **Multi-Level Menus**: Support for dropdown navigation
- **Utility Elements**: Search, theme toggle, user account access
- **Sticky Header**: Optional fixed positioning on scroll
- **Accessibility**: Full keyboard navigation and screen reader support

## Data Structure

```yaml
- sectionType: header
  containerFields:
    inContainer: true
    background:
      color: "#ffffff"
  branding:
    logo:
      src: "/assets/images/logo.svg"
      alt: "Company Logo"
    title: "Company Name"
    url: "/"
  navigation:
    - label: "Home"
      url: "/"
    - label: "About"
      url: "/about"
    - label: "Services"
      url: "/services"
      children:
        - label: "Web Design"
          url: "/services/web-design"
        - label: "Development"
          url: "/services/development"
    - label: "Blog"
      url: "/blog"
    - label: "Contact"
      url: "/contact"
  utilities:
    search: true
    themeToggle: true
    account:
      enabled: false
      loginUrl: "/login"
  config:
    sticky: true
    mobileBreakpoint: "768px"
```

## Properties

### Branding
- `logo.src`: Logo image path
- `logo.alt`: Logo alt text
- `title`: Site/company name
- `url`: Home page URL

### Navigation
- `label`: Menu item text
- `url`: Link destination
- `children`: Submenu items (optional)

### Utilities
- `search`: Enable search functionality
- `themeToggle`: Enable theme switcher
- `account.enabled`: Enable account/login links
- `account.loginUrl`: Login page URL

### Configuration
- `sticky`: Enable sticky header behavior
- `mobileBreakpoint`: Breakpoint for mobile menu

## HTML Structure

```html
<header class="site-header">
  <div class="container">
    <div class="header-content">
      <!-- Branding -->
      <div class="header-brand">
        <a href="/" class="brand-link">
          <img src="/assets/images/logo.svg" alt="Company Logo" class="brand-logo">
          <span class="brand-title">Company Name</span>
        </a>
      </div>
      
      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle hamburger-menu" aria-label="Toggle navigation menu">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      
      <!-- Navigation -->
      <nav class="header-nav" role="navigation">
        <ul class="nav-menu main-menu">
          <li class="nav-item">
            <a href="/" class="nav-link">Home</a>
          </li>
          <li class="nav-item has-dropdown">
            <a href="/services" class="nav-link">Services</a>
            <ul class="dropdown-menu">
              <li><a href="/services/web-design" class="dropdown-link">Web Design</a></li>
              <li><a href="/services/development" class="dropdown-link">Development</a></li>
            </ul>
          </li>
          <li class="nav-item">
            <a href="/blog" class="nav-link">Blog</a>
          </li>
          <li class="nav-item">
            <a href="/contact" class="nav-link">Contact</a>
          </li>
        </ul>
      </nav>
      
      <!-- Utilities -->
      <div class="header-utilities">
        <button class="search-toggle" aria-label="Open search">
          <svg class="search-icon"><!-- Search icon --></svg>
        </button>
        
        <button class="theme-toggle js-theme-toggle" aria-label="Toggle theme">
          <svg class="theme-icon"><!-- Theme icon --></svg>
        </button>
      </div>
    </div>
  </div>
</header>
```

## CSS Classes

- `.site-header`: Main header container
- `.header-content`: Flex container for header elements
- `.header-brand`: Branding area
- `.brand-link`: Logo/title link
- `.brand-logo`: Logo image
- `.brand-title`: Site title text
- `.mobile-menu-toggle`: Mobile hamburger button
- `.hamburger-menu`: Hamburger icon styling
- `.header-nav`: Navigation container
- `.main-menu`: Main navigation list
- `.nav-item`: Navigation item
- `.nav-link`: Navigation link
- `.has-dropdown`: Dropdown parent item
- `.dropdown-menu`: Dropdown submenu
- `.header-utilities`: Utility elements container
- `.sticky`: Applied when header is sticky

## Usage Examples

### Basic Header
```yaml
- sectionType: header
  branding:
    title: "My Website"
    url: "/"
  navigation:
    - label: "Home"
      url: "/"
    - label: "About"
      url: "/about"
    - label: "Contact"
      url: "/contact"
```

### Full-Featured Header
```yaml
- sectionType: header
  branding:
    logo:
      src: "/assets/images/logo.svg"
      alt: "TechCorp Logo"
    title: "TechCorp"
    url: "/"
  navigation:
    - label: "Home"
      url: "/"
    - label: "Products"
      url: "/products"
      children:
        - label: "Software Solutions"
          url: "/products/software"
        - label: "Hardware"
          url: "/products/hardware"
        - label: "Cloud Services"
          url: "/products/cloud"
    - label: "Industries"
      url: "/industries"
      children:
        - label: "Healthcare"
          url: "/industries/healthcare"
        - label: "Finance"
          url: "/industries/finance"
        - label: "Education"
          url: "/industries/education"
    - label: "Resources"
      url: "/resources"
      children:
        - label: "Documentation"
          url: "/docs"
        - label: "Blog"
          url: "/blog"
        - label: "Case Studies"
          url: "/case-studies"
    - label: "Support"
      url: "/support"
    - label: "Contact"
      url: "/contact"
  utilities:
    search: true
    themeToggle: true
    account:
      enabled: true
      loginUrl: "/login"
  config:
    sticky: true
```

### Minimal Header
```yaml
- sectionType: header
  branding:
    title: "Portfolio"
  navigation:
    - label: "Work"
      url: "/work"
    - label: "About"
      url: "/about"
```

## Responsive Navigation

### Mobile Menu JavaScript
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger-menu');
  const mainMenu = document.querySelector('.main-menu');

  if (hamburger && mainMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mainMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      const isClickInside = hamburger.contains(event.target) || 
                           mainMenu.contains(event.target);

      if (!isClickInside && mainMenu.classList.contains('active')) {
        mainMenu.classList.remove('active');
        hamburger.classList.remove('active');
      }
    });
  }
});
```

### Mobile Styles
```css
@media (max-width: 768px) {
  .main-menu {
    position: fixed;
    top: 100%;
    left: 0;
    width: 100%;
    background: white;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .main-menu.active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-item {
    display: block;
    border-bottom: 1px solid #eee;
  }

  .dropdown-menu {
    position: static;
    box-shadow: none;
    background: #f8f9fa;
  }
}
```

## Sticky Header Behavior

```css
.site-header.sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Adjust body padding when header is sticky */
body.has-sticky-header {
  padding-top: 80px; /* Height of header */
}
```

### Sticky Header JavaScript
```javascript
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  const isSticky = header.classList.contains('sticky-enabled');
  
  if (isSticky) {
    if (window.scrollY > 100) {
      header.classList.add('sticky');
      document.body.classList.add('has-sticky-header');
    } else {
      header.classList.remove('sticky');
      document.body.classList.remove('has-sticky-header');
    }
  }
});
```

## Dropdown Menus

### CSS for Dropdowns
```css
.has-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  z-index: 1000;
}

.has-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
```

### Keyboard Navigation
```javascript
// Handle arrow key navigation in dropdown menus
document.addEventListener('keydown', (e) => {
  const activeElement = document.activeElement;
  
  if (activeElement.classList.contains('nav-link')) {
    const dropdown = activeElement.nextElementSibling;
    
    if (e.key === 'ArrowDown' && dropdown) {
      e.preventDefault();
      dropdown.querySelector('.dropdown-link').focus();
    }
  }
});
```

## Search Integration

### Search Toggle
```html
<div class="header-search">
  <button class="search-toggle" aria-label="Open search">
    <svg class="search-icon"><!-- Search icon --></svg>
  </button>
  
  <div class="search-panel">
    <form class="search-form">
      <input type="search" placeholder="Search..." class="search-input">
      <button type="submit" class="search-submit">Search</button>
    </form>
  </div>
</div>
```

## Accessibility Features

- **Semantic HTML**: Proper use of `header`, `nav`, `role` attributes
- **ARIA Labels**: Descriptive labels for interactive elements
- **Keyboard Navigation**: Full keyboard support for all menus
- **Focus Management**: Logical focus flow through navigation
- **Screen Readers**: Proper announcement of menu states and structure

## Performance Considerations

1. **Logo Optimization**: Use SVG for scalable logos
2. **Critical CSS**: Inline critical header styles
3. **Lazy Loading**: Defer non-critical header JavaScript
4. **Image Loading**: Use appropriate logo formats and sizes

## Browser Support

- **Flexbox**: IE11+ for layout
- **CSS Transforms**: IE10+ for animations
- **Backdrop Filter**: Modern browsers (with fallback)
- **CSS Grid**: For complex layouts in modern browsers