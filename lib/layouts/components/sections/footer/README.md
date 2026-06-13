# Footer Section

Site footer component with flexible content areas for links, contact information, social media, and copyright details.

## Features

- **Multi-Column Layout**: Flexible column system for organized content
- **Link Groups**: Organized navigation and resource links
- **Contact Information**: Address, phone, email display
- **Social Media**: Social media platform links with icons
- **Copyright**: Automatic year updating and legal information
- **Responsive Design**: Collapses gracefully on mobile devices

## Data Structure

```yaml
- sectionType: footer
  containerFields:
    inContainer: true
    background:
      color: "#1a1a1a"
  columns:
    - title: "Company"
      links:
        - label: "About Us"
          url: "/about"
        - label: "Careers"
          url: "/careers"
        - label: "Contact"
          url: "/contact"
    - title: "Services"
      links:
        - label: "Web Design"
          url: "/services/web-design"
        - label: "Development"
          url: "/services/development"
    - title: "Resources"
      links:
        - label: "Blog"
          url: "/blog"
        - label: "Documentation"
          url: "/docs"
  contact:
    address: "123 Main St, City, State 12345"
    phone: "+1 (555) 123-4567"
    email: "hello@example.com"
  social:
    - platform: "twitter"
      url: "https://twitter.com/username"
    - platform: "linkedin"
      url: "https://linkedin.com/company/name"
    - platform: "github"
      url: "https://github.com/username"
  copyright:
    year: 2023
    text: "Your Company Name. All rights reserved."
```

## Properties

### Columns
- `title`: Column heading
- `links`: Array of navigation links
- `links.label`: Link text
- `links.url`: Link destination

### Contact Information
- `address`: Physical address
- `phone`: Phone number
- `email`: Email address

### Social Media
- `platform`: Social platform identifier
- `url`: Profile/page URL

### Copyright
- `year`: Copyright year
- `text`: Copyright text

## HTML Structure

```html
<footer class="site-footer">
  <div class="container">
    <div class="footer-content">
      <!-- Link Columns -->
      <div class="footer-columns">
        <div class="footer-column">
          <h3 class="footer-column-title">Company</h3>
          <ul class="footer-links">
            <li><a href="/about">About Us</a></li>
            <li><a href="/careers">Careers</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        
        <div class="footer-column">
          <h3 class="footer-column-title">Services</h3>
          <ul class="footer-links">
            <li><a href="/services/web-design">Web Design</a></li>
            <li><a href="/services/development">Development</a></li>
          </ul>
        </div>
      </div>
      
      <!-- Contact Information -->
      <div class="footer-contact">
        <h3 class="footer-section-title">Contact Us</h3>
        <div class="contact-info">
          <p class="address">123 Main St, City, State 12345</p>
          <p class="phone">
            <a href="tel:+15551234567">+1 (555) 123-4567</a>
          </p>
          <p class="email">
            <a href="mailto:hello@example.com">hello@example.com</a>
          </p>
        </div>
      </div>
      
      <!-- Social Media -->
      <div class="footer-social">
        <h3 class="footer-section-title">Follow Us</h3>
        <ul class="social-links">
          <li>
            <a href="https://twitter.com/username" aria-label="Follow us on Twitter">
              <svg class="social-icon"><!-- Twitter icon --></svg>
            </a>
          </li>
          <li>
            <a href="https://linkedin.com/company/name" aria-label="Connect on LinkedIn">
              <svg class="social-icon"><!-- LinkedIn icon --></svg>
            </a>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Copyright -->
    <div class="footer-bottom">
      <p class="copyright">
        &copy; 2023 Your Company Name. All rights reserved.
      </p>
    </div>
  </div>
</footer>
```

## CSS Classes

- `.site-footer`: Main footer container
- `.footer-content`: Main content area
- `.footer-columns`: Link columns container
- `.footer-column`: Individual link column
- `.footer-column-title`: Column heading
- `.footer-links`: Link list
- `.footer-contact`: Contact information section
- `.footer-social`: Social media section
- `.social-links`: Social media link list
- `.social-icon`: Social media icons
- `.footer-bottom`: Copyright area
- `.copyright`: Copyright text

## Usage Examples

### Basic Footer
```yaml
- sectionType: footer
  columns:
    - title: "Company"
      links:
        - label: "About"
          url: "/about"
        - label: "Contact"
          url: "/contact"
  copyright:
    year: 2023
    text: "Company Name. All rights reserved."
```

### Comprehensive Footer
```yaml
- sectionType: footer
  columns:
    - title: "Products"
      links:
        - label: "Web Apps"
          url: "/products/web-apps"
        - label: "Mobile Apps"
          url: "/products/mobile-apps"
    - title: "Support"
      links:
        - label: "Help Center"
          url: "/support"
        - label: "Documentation"
          url: "/docs"
        - label: "API Reference"
          url: "/api"
    - title: "Legal"
      links:
        - label: "Privacy Policy"
          url: "/privacy"
        - label: "Terms of Service"
          url: "/terms"
  contact:
    address: "456 Business Ave, Suite 789, Metro City, State 54321"
    phone: "+1 (555) 987-6543"
    email: "support@company.com"
  social:
    - platform: "facebook"
      url: "https://facebook.com/company"
    - platform: "twitter"
      url: "https://twitter.com/company"
    - platform: "instagram"
      url: "https://instagram.com/company"
    - platform: "youtube"
      url: "https://youtube.com/company"
  copyright:
    year: 2023
    text: "Company Name Inc. All rights reserved."
```

### Minimal Footer
```yaml
- sectionType: footer
  social:
    - platform: "twitter"
      url: "https://twitter.com/username"
    - platform: "github"
      url: "https://github.com/username"
  copyright:
    year: 2023
    text: "Personal Portfolio. Built with Metalsmith."
```

## Responsive Design

```css
.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .footer-columns {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .footer-columns {
    grid-template-columns: 1fr;
  }
}
```

## Social Media Icons

### Supported Platforms
- Facebook
- Twitter  
- Instagram
- LinkedIn
- GitHub
- YouTube
- Pinterest
- TikTok

### Icon Implementation
```html
<!-- Using SVG sprites -->
<svg class="social-icon">
  <use href="/assets/icons/social-sprite.svg#twitter"></use>
</svg>

<!-- Using icon font -->
<i class="fab fa-twitter social-icon"></i>

<!-- Inline SVG -->
<svg class="social-icon" viewBox="0 0 24 24">
  <path d="M23 3a10.9 10.9 0 01-3.14 1.53..."/>
</svg>
```

## Copyright Year

### Automatic Year Update
```javascript
// Update copyright year automatically
document.addEventListener('DOMContentLoaded', () => {
  const copyrightElement = document.querySelector('.copyright');
  if (copyrightElement) {
    const currentYear = new Date().getFullYear();
    copyrightElement.innerHTML = copyrightElement.innerHTML.replace(
      /©\s*\d{4}/,
      `© ${currentYear}`
    );
  }
});
```

### Static Year in Data
```yaml
copyright:
  year: 2023  # Will display as "© 2023"
  text: "Company Name. All rights reserved."
```

## Accessibility Features

- **Semantic HTML**: Proper use of `footer`, navigation elements
- **Heading Hierarchy**: Logical heading structure with h3 elements
- **ARIA Labels**: Descriptive labels for social media links
- **Keyboard Navigation**: All links accessible via keyboard
- **Screen Readers**: Clear link purposes and destinations

## SEO Considerations

- **Internal Linking**: Footer links help with site structure
- **Contact Information**: Structured contact data for local SEO
- **Social Signals**: Social media links for brand presence
- **Legal Pages**: Links to privacy policy, terms of service

## Performance Optimization

### Social Media Icons
```css
.social-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

/* Use CSS sprites for better performance */
.social-icons {
  background-image: url('/assets/icons/social-sprite.png');
}
```

### Lazy Loading
Consider lazy loading social media widgets or embedded content in the footer.

## Customization Options

### Column Layout
```yaml
columns:
  - title: "Quick Links"
    links:
      - label: "Home"
        url: "/"
      - label: "About"
        url: "/about"
    layout: "horizontal"  # vertical, horizontal
```

### Styling Variants
```yaml
style:
  theme: "dark"           # light, dark
  alignment: "center"     # left, center, right
  showDividers: true      # Add visual dividers
```

## Best Practices

1. **Link Organization**: Group related links logically
2. **Contact Accessibility**: Make contact information clickable
3. **Social Media**: Include only active social profiles
4. **Legal Compliance**: Include required legal links
5. **Mobile Experience**: Ensure footer works well on mobile devices
6. **Performance**: Optimize icons and avoid heavy widgets