---
layout: pages/sections.njk
bodyClass: ''
draft: false

seo:
  title: Getting Started with Structured Content
  description: 'Begin by exploring the existing page configurations to understand how content is organized.'
  socialImage: 'https://res.cloudinary.com/glinkaco/image/upload/v1646849499/tgc2022/social_yitz6j.png'
  canonicalOverwrite: ''

card:
  title: 'Getting Started with Structured Content'
  description: Begin by exploring the existing page configurations to understand how content is organized.
  date: '2025-06-08'
  author:
    - Niels Bohr
  thumbnail: '/assets/images/sample7.jpg'

sections:
  - sectionType: hero
    containerTag: section
    classes: 'first-section'
    id: ''
    description: "This is a blog post hero section. The hero section has a class of 'blog-hero'."
    isDisabled: false
    isFullScreen: false
    isReverse: true
    date: '2025-06-08'
    author:
      - Niels Bohr
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
        imageScreen: 'dark' # light, dark, none
    text:
      leadIn: ''
      title: Metalsmith 2025 Structured Content Starter
      titleTag: 'h1'
      subTitle: 'Getting Started with Structured Content'
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
        bottom: true
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
        Begin by exploring the existing page configurations to understand how content is organized. Each page's frontmatter tells the complete story of its structure and content, making it easy to understand exactly what appears on the page and why.

        Experiment with rearranging sections within a page or moving sections between different pages. The component system makes these changes straightforward and safe, with no risk of breaking markup or losing formatting.

        Try creating variations of existing components by modifying their configuration properties. Most components support multiple display options and content arrangements, allowing you to create visual variety while maintaining underlying consistency.

        Ready to build your own structured content site? Clone the repository and start by modifying the existing page configurations, then gradually add your own content and customize the component templates to match your design requirements.
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
        bottom: false
      noPadding:
        top: false
        bottom: false
      background:
        color: ''
        image: ''
        imageScreen: 'none' # light, dark, none
    name: 'Niels Bohr'
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
