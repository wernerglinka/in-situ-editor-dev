---
layout: pages/sections.njk
bodyClasses: 'sections-page'
hasHero: true

navigation:
  navLabel: 'Sections'
  navIndex: 2

seo:
  title: Starter Sections
  description: 'A Metalsmith Starter to build modern websites using structured data and reusable components.'
  socialImage: '/assets/images/sample.jpg'
  canonicalURL: ''

sections:
  - sectionType: hero
    containerTag: section
    classes: 'first-section'
    id: ''
    description: "This is a full screen hero section with a background image and text overlay. The proporty 'isFullScreen' is set to true, which turn a standard hero section into full screen."
    isHero: true
    isDisabled: false
    isReverse: false
    isAnimated: true
    isFullScreen: true
    targetId: 'first-section'
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
        isDark: false
        color: ''
        image: '/assets/images/sample13.jpg'
        imageScreen: 'none' # light, dark, none
    text:
      leadIn: 'Examples'
      title: Various Section Types
      titleTag: 'h1'
      subTitle:
      prose: A set of sectionsexamples starting with the hero section being full page. Click the down arrow at the bottom of the screen to scroll to the next section. That requires 'targetId' to be set to the id of the next section, in this case 'first-section' and the id of the next section is set to 'first-section'. Also, notice the up-arrow in the bottom right screen corner, when scrolling starts, to return to the top of the page.
    ctas:
      - url: 'https://apple.com'
        label: 'go to apple'
        isButton: true
        buttonStyle: 'primary'
    image:
      src: ''
      alt: ''
      caption: ''

  - sectionType: text-only
    containerTag: article
    classes: ''
    id: 'first-section'
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
      leadIn: 'Simple Text Section'
      title: Let's have a look at some section component examples
      titleTag: 'h2'
      subTitle: ''
      prose: |-
        We already have see several examples of various section types on the home and About page. On this page, we will see more examples of section types and their variations. The first one, the one you are reading now, is a text only section. This section will display the body text in two columns if the screen width is large enough. This provides for a better reading experience. When the screen is narrow, text will display in a single column. The text section has a lead-in, title, sub-title, and prose. The prose is markdown text. All of the text parts are optional. At the bottom of the section, can be multiple CTAs, which may be rendered as buttons or links. All CTAs are optional.

    ctas:
      - url: ''
        label: ''
        isButton: true
        buttonStyle: 'primary'

  - sectionType: text-only
    containerTag: article
    classes: ''
    id: 'first-section'
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
      title: Simple Slider
      titleTag: 'h2'
      subTitle: ''
      prose: |-
        Below we see two examples of a simple slider section. One with a typical slider pagination and a second one with a tabbed interface. The sliders are identical but the control is rendered based on the `config` property. If   `config` is set to `isTabs`, the slider will be rendered as a tabbed interface. If `config` is not set, the slider will be rendered as a typical slider with pagination.

    ctas:
      - url: ''
        label: ''
        isButton: true
        buttonStyle: 'primary'

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
        bottom: false
      background:
        isDark: false
        color: ''
        image: ''
    isTabs: true
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
        bottom: false
      background:
        isDark: false
        color: ''
        image: ''
    isTabs: false
    slides:
      - slideClasses: ''
        image:
          src: '/assets/images/sample7.jpg'
          alt: 'nunjucks'
        text:
          leadIn: What's this?
          title: Stair Case
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
          title: Drain Pipe
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
          title: Overpass
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

  - sectionType: text-only
    containerTag: article
    classes: ''
    id: 'first-section'
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
      title: Testimonial
      titleTag: 'h2'
      subTitle: ''
      prose: |-
        Below we see an example of a testimonial section. The section renders a blockquote with a quotee and an optional cite. The quotee can have a portrait, name, title, company, and logo. The quotee is rendered in a flex container, so the portrait, name, title, company, and logo can be rendered in any order.

    ctas:
      - url: ''
        label: ''
        isButton: true
        buttonStyle: 'primary'

  - sectionType: testimonial
    containerTag: aside
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
        color: '#f5f5f5'
        image: ''
        imageScreen: 'none' # light, dark, none
    quote:
      text: "You've got to be very careful if you don't know where you are going, because you might not get there."
      cite: 'https://en.wikipedia.org/wiki/Yogi_Berra'
    quotee:
      portrait:
        src: '/assets/images/yogi-berra-baseball-great.jpg'
        alt: "Lawrence Peter 'Yogi' Berra"
      name: 'Yogi Berra'
      title: 'Baseball Great'
      company: 'New York Yankees'
      logo: '/assets/images/new-york-yankees-logo.svg'

  - sectionType: text-only
    containerTag: article
    classes: ''
    id: 'first-section'
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
      title: Flip Cards
      titleTag: 'h2'
      subTitle: ''
      prose: |-
        And here is an example of group of flip cards. The flip cards are rendered in a flex container, so they can be rendered in any order. The flip cards may have an icon, lead-in, title, and prose. The title and image are optional. The prose is markdown text. A CTA may be aded to the back of the card.
    ctas:
      - url: ''
        label: ''
        isButton: true
        buttonStyle: 'primary'

  - sectionType: flip-cards
    containerTag: aside
    classes: ''
    id: ''
    isDisabled: false
    isReverse: false
    containerFields:
      inContainer: true
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
    cards:
      - front:
          icon: 'activity'
          text:
            leadIn: 'Simple Text Section'
            title: The Card Title
            titleTag: 'h3'
            subTitle: ''
            prose: |-
              Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.
        back:
          text:
            leadIn: ''
            title: This is the back
            titleTag: 'h3'
            subTitle: ''
            prose: |-
              Nullam id dolor id nibh ultricies vehicula ut id elit. Etiam porta sem malesuada magna mollis euismod. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.
          ctas:
            - url: 'https://apple.com'
              label: 'Go Apple'
              isButton: false
              buttonStyle: 'primary'

      - front:
          icon: 'airplay'
          text:
            leadIn: 'Simple Text Section'
            title: The Second Card Title
            titleTag: 'h3'
            subTitle: ''
            prose: |-
              Maecenas faucibus mollis interdum. Cras mattis consectetur purus sit amet fermentum. Fusce dapibus, tellus ac cursus commodo.

        back:
          text:
            leadIn: ''
            title: The Back
            titleTag: 'h3'
            subTitle: ''
            prose: |-
              Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
          ctas:
            - url: ''
              label: ''
              isButton: true
              buttonStyle: 'primary'

      - front:
          icon: 'paperclip'
          text:
            leadIn: 'Simple Text Section'
            title: The Third Card Title
            titleTag: 'h3'
            subTitle: ''
            prose: |-
              Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Fusce dapibus.

        back:
          text:
            leadIn: ''
            title: The Back
            titleTag: 'h3'
            subTitle: ''
            prose: |-
              Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue.
          ctas:
            - url: ''
              label: ''
              isButton: true
              buttonStyle: 'primary'

      - front:
          icon: 'paperclip'
          text:
            leadIn: 'Simple Text Section'
            title: The Third Card Title
            titleTag: 'h3'
            subTitle: ''
            prose: |-
              Cras justo odio, dapibus ac facilisis in, egestas eget quam. Maecenas sed diam eget risus varius blandit sit amet non magna.

        back:
          text:
            leadIn: ''
            title: The Back Title
            titleTag: 'h4'
            subTitle: ''
            prose: |-
              Nullam id dolor id nibh ultricies vehicula ut id elit. Etiam porta sem malesuada magna mollis euismod. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.
          ctas:
            - url: 'http://glinka.co'
              label: 'Learn More'
              isButton: true
              buttonStyle: 'primary small'

  - sectionType: banner
    containerTag: aside
    classes: 'cta-banner'
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
        image: '/assets/images/sample7.jpg'
        imageScreen: 'light' # light, dark, none
    text:
      leadIn: ''
      title: See some more examples
      titleTag: 'h2'
      subTitle: ''
      prose: ''
    ctas:
      - url: '/more-sections'
        label: 'Here'
        isButton: true
        buttonStyle: 'primary'
---
