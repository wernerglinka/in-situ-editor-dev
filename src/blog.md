---
layout: pages/sections.njk
bodyClass: ''

navigation:
  navLabel: 'Blog'
  navIndex: 4

seo:
  title: MS2025 Structured Content Starter Blog
  description: 'A Metalsmith Starter to build modern websites using structured data and reusable components.'
  socialImage: '/assets/images/metalsmith-starter-social.png'
  canonicalOverwrite: ''

sections:
  - sectionType: hero
    containerTag: section
    classes: 'first-section'
    id: ''
    description: "This is a blog post hero section. The hero section has a class of 'blog-hero'."
    isDisabled: false
    isFullScreen: false
    isReverse: false
    date: ''
    author: ''
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
        image: '/assets/images/sample10.jpg'
        imageScreen: 'dark' # light, dark, none
    text:
      leadIn: ''
      title: Metalsmith 2025 Blog Example
      titleTag: 'h1'
      subTitle: 'Read on'
      prose: "This is a blog post hero section. The hero section has a class of 'blog-hero'."
    ctas:
      - url: ''
        label: ''
        isButton: false
        buttonStyle: 'primary'
    image:
      src: ''
      alt: ''
      caption: ''

  - sectionType: collection-list
    collectionName: 'blog'
    domainName: 'blog'
    containerTag: section # section || article || aside
    classes: ''
    id: ''
    description: 'section with all blogposts'
    isDisabled: false
    isFullScreen: false
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
        isDark: true
        color: ''
        image: ''
        imageScreen: 'none' # light, dark, none
    hasPagingParams: true
    pagingParams:
      numberOfBlogs: '' # updated by plugin
      numberOfPages: '' # updated by plugin
      pageLength: '' # updated by plugin
      pageStart: '' # updated by plugin
      pageNumber: '' # updated by plugin
---
