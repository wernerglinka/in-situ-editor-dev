---
layout: pages/sections.njk
bodyClasses: 'sections-page'
hasHero: true

navigation:
  navLabel: 'More Sections'
  navIndex: 3
seo:
  title: More Starter Sections
  description: 'A Metalsmith Starter to build modern websites using structured data and reusable components.'
  socialImage: '/assets/images/sample.jpg'
  canonicalURL: ''

sections:
  - sectionType: hero
    containerTag: section
    classes: 'first-section'
    id: ''
    description: "This is a hero section with a background image and text overlay. The background image may be screened with a light or dark screen ( set with 'imageScreen' property in the background object ) so the text is not over powered by the image. The text area has a lead-in, title, sub-title, and prose. The prose is markdown text. All of the text parts are optional. There can be multiple CTAs, which are optional and may be buttons or links."
    isDisabled: false
    isFullScreen: false
    isReverse: true
    isAnimated: true
    date: ''
    author: ''
    containerFields:
      inContainer: false
      noMargin:
        top: true
        bottom: true
      noPadding:
        top: false
        bottom: false
      background:
        isDark: true
        color: ''
        image: '/assets/images/sample12.jpg'
        imageScreen: 'dark' # light, dark, none
    text:
      leadIn: 'More Examples'
      title: Some more Section examples
      titleTag: 'h1'
      subTitle: ''
      prose: Another set of example sections.
    ctas:
      - url: ''
        label: ''
        isButton: true
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
    isAnimated: true
    containerFields:
      inContainer: false
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
      title: Social Links Example
      titleTag: 'h2'
      subTitle: ''
      prose: |-
        Display social media links with 90px width icons and scroll animation for small screens.

    ctas:
      - url: ''
        label: ''
        isButton: true
        buttonStyle: 'primary'

  - sectionType: logos-list
    containerTag: aside
    classes: ''
    id: 'logosList'
    isDisabled: false
    isReverse: true
    containerFields:
      inContainer: false
      isAnimated: true
      noMargin:
        top: true
        bottom: false
      noPadding:
        top: true
        bottom: false
      background:
        color: ''
        image: ''
        imageScreen: 'none' # light, dark, none
    logos:
      source: 'socialLinks'
      logoWidth: 90
      scope: 'all'
      selections: []

  - sectionType: composed
    containerTag: section
    classes: 'text-image-cta'
    id: 'section-id'
    description: 'Implements a text, image, cta layout in a horizontal alignment.'
    isDisabled: false
    isAnimated: true
    containerFields:
      inContainer: true
      noMargin:
        top: false
        bottom: true
      noPadding:
        top: true
        bottom: true
      background:
        color: '#f8f8f8'
        image: ''
    columns:
      - column:
        columnClasses: 'text flow'
        blocks:
          - text:
              leadIn: See what we have here
              title: And there is more
              titleTag: 'h2'
              subTitle: 'what noch mehr?'
              prose: |-
                This is a multi-column section. The columns are defined in the 'columns' array. A column can contain one or more partials. Allowing the composition of custom layouts like the image galley below.

      - column:
        columnClasses: 'image'
        blocks:
          - image:
              src: '/assets/images/sample5.jpg'
              alt: 'nunjucks'
              caption: 'Venenatis Condimentum Vehicula Fermentum'

      - column:
        columnClasses: 'align-center'
        blocks:
          - ctas:
              - url: '/apple.com'
                label: 'go to apple'
                isButton: true
                buttonStyle: 'primary'

  - sectionType: composed
    containerTag: section
    classes: 'image-gallery'
    id: 'section-id'
    description: 'Implements a three column image gallery.'
    isDisabled: false
    isAnimated: true
    containerFields:
      inContainer: true
      noMargin:
        top: false
        bottom: false
      noPadding:
        top: true
        bottom: true
      background:
        isDark: false
        color: '#f8f8f8'
        image: ''
    columns:
      - column:
        columnClasses: 'image'
        blocks:
          - image:
              src: '/assets/images/sample11.jpg'
              alt: 'nunjucks'
              caption: ''

      - column:
        columnClasses: 'image'
        blocks:
          - image:
              src: '/assets/images/sample10.jpg'
              alt: 'nunjucks'
              caption: ''

      - column:
        columnClasses: 'image'
        blocks:
          - image:
              src: '/assets/images/sample9.jpg'
              alt: 'nunjucks'
              caption: ''

  - sectionType: banner
    containerTag: aside
    classes: 'cta-banner'
    id: 'section-id'
    isDisabled: false
    isReverse: false
    isAnimated: true
    containerFields:
      inContainer: false
      noMargin:
        top: true
        bottom: true
      noPadding:
        top: false
        bottom: false
      background:
        color: ''
        image: '/assets/images/sample8.jpg'
        imageScreen: 'light' # light, dark, none
    text:
      leadIn: 'And what is this?'
      title: CTA Banner Example
      titleTag: 'h2'
      subTitle: May use background image of color
      prose: Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Nullam id dolor id nibh ultricies vehicula ut id elit.
    ctas:
      - url: 'https://apple.com'
        label: 'go to apple'
        isButton: true
        buttonStyle: 'primary'
      - url: 'https://ibm.com'
        label: 'go to big brother'
        isButton: false
        buttonStyle: 'primary'
    image:
      src: ''
      alt: ''
      caption: ''

  - sectionType: slider
    containerTag: section
    classes: ''
    id: ''
    description: 'Implements a manual slider section.'
    isDisabled: false
    isAnimated: true
    containerFields:
      inContainer: true
      noMargin:
        top: false
        bottom: false
      noPadding:
        top: true
        bottom: true
      background:
        isDark: false
        color: ''
        image: ''
    slides:
      - slideClasses: ''
        image:
          src: '/assets/images/sample7.jpg'
          alt: 'nunjucks'
        text:
          leadIn: What's this?
          title: Slider Number 1
          titleTag: 'h2'
          subTitle: ''
          prose: |-
            Cras mattis consectetur purus sit amet fermentum. Donec ullamcorper nulla non metus auctor fringilla. Sed posuere consectetur est at lobortis.
        ctas:
          - url: '/apple.com'
            label: 'go to apple'
            isButton: true
            buttonStyle: 'primary'

      - slideClasses: ''
        image:
          src: '/assets/images/sample4.jpg'
          alt: 'nunjucks'
        text:
          leadIn: And this?
          title: Slider Number 2
          titleTag: 'h2'
          subTitle: ''
          prose: |-
            Nullam quis risus eget urna mollis ornare vel eu leo. Sed posuere consectetur est at lobortis.

      - slideClasses: ''
        image:
          src: '/assets/images/sample5.jpg'
          alt: 'nunjucks'
        text:
          leadIn: Oh, one more!
          title: Slider Number 3
          titleTag: 'h2'
          subTitle: ''
          prose: |-
            Aenean lacinia bibendum nulla sed consectetur. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna.
        ctas:
          - url: '/apple.com'
            label: 'go to apple'
            isButton: true
            buttonStyle: 'primary'
          - url: '/apple.com'
            label: 'where to go?'
            isButton: false
            buttonStyle: 'primary'
---
