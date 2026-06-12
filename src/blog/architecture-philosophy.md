---
layout: pages/sections.njk
bodyClass: ''
draft: false

seo:
  title: Architecture Philosophy
  description: 'This starter embodies several key principles that make structured content management both powerful and approachable.'
  socialImage: 'https://res.cloudinary.com/glinkaco/image/upload/v1646849499/tgc2022/social_yitz6j.png'
  canonicalOverwrite: ''

card:
  title: 'Architecture Philosophy'
  description: This starter embodies several key principles that make structured content management both powerful and approachable.
  date: '2025-06-02'
  author:
    - Albert Einstein
    - Isaac Newton
  thumbnail: '/assets/images/sample9.jpg'

sections:
  - sectionType: hero
    containerTag: section
    classes: 'first-section'
    id: ''
    description: "This is a blog post hero section. The hero section has a class of 'blog-hero'."
    isDisabled: false
    isFullScreen: false
    isReverse: true
    date: '2025-06-02'
    author:
      - Albert Einstein
      - Isaac Newton
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
        image: '/assets/images/sample9.jpg'
        imageScreen: 'dark' # light, dark, none
    text:
      leadIn: ''
      title: Metalsmith 2025 Structured Content Starter
      titleTag: 'h1'
      subTitle: 'Architecture Philosophy'
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
        imageScreen: 'none' # light, dark, none
    text:
      leadIn: ''
      title: ''
      titleTag: 'h2'
      subTitle: ''
      prose: |-
        This starter embodies several key principles that make structured content management both powerful and approachable. Each page is composed of independent sections that can be arranged, rearranged, and reused across different contexts. Content is defined declaratively through configuration rather than embedded within template files.
        The component system provides flexibility without complexity. You can create sophisticated page layouts by combining simple, focused components. Each component has a single responsibility and a clear interface, making the entire system easier to understand and maintain.

        True component encapsulation means that each component manages not just its template logic, but also its associated styles and JavaScript behavior. This starter demonstrates how components can be truly self-contained units that include their CSS and JavaScript dependencies, with automatic asset bundling and dependency resolution handled transparently by the build system.

        Unlike traditional CMS approaches that mix content with presentation, this starter maintains strict separation of concerns. Content creators work with structured data. Template authors focus on presentation logic. The build system handles asset management and component dependencies automatically, ensuring that components load in the correct order and their styles don't conflict with each other.

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
        imageScreen: 'none' # light, dark, none
    name: 'Albert Einstein'
    logoWidth: 30

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
        top: false
        bottom: true
      noPadding:
        top: true
        bottom: true
      background:
        color: ''
        image: ''
        imageScreen: 'none' # light, dark, none
    name: 'Isaac Newton'
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
        imageScreen: 'none' # light, dark, none
---
