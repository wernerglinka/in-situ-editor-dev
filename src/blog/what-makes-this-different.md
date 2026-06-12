---
layout: pages/sections.njk
bodyClass: ''
draft: false

seo:
  title: What Makes This Different
  description: 'Most static site generators ask you to choose between simplicity and power. This starter bridges that gap by providing a structured approach that scales naturally.'
  socialImage: 'https://res.cloudinary.com/glinkaco/image/upload/v1646849499/tgc2022/social_yitz6j.png'
  canonicalOverwrite: ''

card:
  title: 'What Makes This Different'
  description: |-
    Most static site generators ask you to choose between simplicity and power. This starter bridges that gap by providing a structured approach that scales naturally.
  date: '2025-06-03'
  author:
    - Marie Curie
  thumbnail: '/assets/images/sample11.jpg'

sections:
  - sectionType: hero
    containerTag: section
    classes: 'first-section'
    id: ''
    description: "This is a blog post hero section. The hero section has a class of 'blog-hero'."
    isDisabled: false
    isFullScreen: false
    isReverse: true
    date: '2025-06-03'
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
        image: '/assets/images/sample11.jpg'
        imageScreen: 'dark' # light, dark, none
    text:
      leadIn: ''
      title: Metalsmith 2025 Structured Content Starter
      titleTag: 'h1'
      subTitle: 'What Makes This Different'
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
        Most static site generators ask you to choose between simplicity and power. Simple setups work well for basic sites but become limiting as requirements grow. Powerful configurations often require deep technical knowledge that intimidates content creators.

        This starter bridges that gap by providing a structured approach that scales naturally. Simple sites can be built with minimal configuration. Complex sites benefit from the same architectural patterns without requiring fundamental changes to the approach.

        The component-based architecture means you can start with basic sections and progressively enhance them as your needs evolve. Add new component types when you need them. Extend existing components with additional properties. Each component can include its own CSS and JavaScript, with automatic dependency resolution ensuring everything loads in the correct order without manual intervention.

        The system grows with your requirements rather than constraining them. Components remain truly encapsulated, preventing the asset management complexity that often emerges as component-based sites scale. No more hunting through stylesheets to find the CSS affecting a particular component, or worrying about JavaScript conflicts between different sections.

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
        imageScreen: 'none' # light, dark, none
---
