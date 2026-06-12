---
layout: pages/sections.njk
bodyClass: ''
draft: false

seo:
  title: Code Highlighting Demo
  description: 'Demonstrating code syntax highlighting in blog posts using Prism.js for client-side rendering.'
  socialImage: 'https://res.cloudinary.com/glinkaco/image/upload/v1646849499/tgc2022/social_yitz6j.png'
  canonicalOverwrite: ''

card:
  title: 'Code Highlighting Demo'
  description: Demonstrating code syntax highlighting in blog posts using Prism.js for client-side rendering.
  date: '2025-07-15'
  author:
    - Marie Curie
  thumbnail: '/assets/images/sample7.jpg'

sections:
  - sectionType: hero
    containerTag: section
    classes: 'first-section'
    id: ''
    description: "This is a blog post hero section."
    isDisabled: false
    isFullScreen: false
    isReverse: true
    date: '2025-07-15'
    author:
      - Marie Curie
    containerFields:
      inContainer: false
      isAnimated: true
      noMargin:
        top: true
        bottom: false
      noPadding:
        top: false
        bottom: false
      background:
        isDark: true
        color: ''
        image: '/assets/images/sample7.jpg'
        imageScreen: 'dark'
    text:
      leadIn: ''
      title: Metalsmith 2025 Structured Content Starter
      titleTag: 'h1'
      subTitle: 'Code Highlighting Demo'
      prose: ''
    ctas:
      - url: ''
        label: ''
        isButton: false
        buttonStyle: 'primary'
    image:
      src: ''
      alt: ''
      caption: ''

  - sectionType: text-only
    containerTag: article
    classes: ''
    id: 'section-id'
    isDisabled: false
    isReverse: false
    containerFields:
      inContainer: false
      isAnimated: true
      noMargin:
        top: true
        bottom: false
      noPadding:
        top: false
        bottom: false
      background:
        color: ''
        image: ''
        imageScreen: 'none'
    text:
      leadIn: ''
      title: ''
      titleTag: 'h2'
      subTitle: ''
      prose: |-
        This blog post demonstrates code syntax highlighting using Prism.js. Since markdown in structured content sections is converted to HTML at render time in Nunjucks templates, we use client-side highlighting rather than build-time processing.

        ## JavaScript Example

        Here's a simple function that checks if a number is prime:

        ```javascript
        function isPrime(n) {
          if (n <= 1) return false;
          if (n <= 3) return true;

          if (n % 2 === 0 || n % 3 === 0) return false;

          for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) {
              return false;
            }
          }
          return true;
        }

        // Test the function
        console.log(isPrime(17)); // true
        console.log(isPrime(24)); // false
        ```

        ## CSS Example

        Here's some CSS using modern features like custom properties and nesting:

        ```css
        .card {
          --card-padding: 1.5rem;

          padding: var(--card-padding);
          border-radius: 0.5rem;
          background: var(--color-surface);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .card-title {
            font-size: var(--font-h3);
            margin-bottom: var(--space-s);
          }
        }
        ```

        ## YAML Example

        And here's some YAML configuration, like what you'd find in Metalsmith frontmatter:

        ```yaml
        sections:
          - sectionType: hero
            containerTag: section
            containerFields:
              inContainer: false
              isAnimated: true
              background:
                isDark: true
                image: '/assets/images/hero.jpg'
            text:
              title: Welcome
              titleTag: h1
        ```

        The syntax highlighting is powered by Prism.js running in the browser, with the theme styles bundled directly into the text-only component CSS.

    ctas:
      - url: ''
        label: ''
        isButton: false
        buttonStyle: 'primary'

  - sectionType: blog-author
    containerTag: section
    classes: ''
    id: ''
    isDisabled: false
    isReverse: false
    containerFields:
      inContainer: false
      isAnimated: true
      noMargin:
        top: true
        bottom: true
      noPadding:
        top: true
        bottom: true
      background:
        color: ''
        image: ''
        imageScreen: 'none'
    name: 'Marie Curie'
    logoWidth: 30

  - sectionType: blog-navigation
    containerTag: section
    classes: ''
    id: ''
    isDisabled: false
    isReverse: false
    containerFields:
      inContainer: false
      isAnimated: true
      noMargin:
        top: true
        bottom: false
      noPadding:
        top: false
        bottom: false
      background:
        color: ''
        image: ''
        imageScreen: 'none'
---
