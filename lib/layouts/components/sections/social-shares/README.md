# Social Shares Section

Renders a row of social share buttons that link to platform share endpoints
for the current page.

## Built-in Platforms

`bluesky`, `linkedin`, `facebook`, `twitter` (X), `mail`.

## URL & Metadata Resolution

The shared URL is always the current page — built as `data.site.url + urlPath`
(`urlPath` is injected by `metalsmith-menu-plus`). All text values (`title`,
`comment`, final URL) are URL-encoded automatically.

## Frontmatter Example

```yaml
- sectionType: social-shares
  hasCenteredContent: true
  text:
    title: "Share This Page"
    titleTag: "h2"
  share:
    title: "Nunjucks Components Library"           # article / subject title
    comment: "Page excerpt that pre-fills the share post body."
    platforms:
      - bluesky
      - linkedin
      - facebook
      - twitter
      - mail
```

## Per-Platform Field Usage

`share.title` and `share.comment` exist because different networks consume
different fields. The component wires them up like this:

| Platform    | Endpoint field        | Uses                          |
|-------------|-----------------------|-------------------------------|
| Bluesky     | `text` (post body)    | `comment` + page URL          |
| LinkedIn    | `url` + `title`       | page URL + `title`            |
| Facebook    | `u` + `quote`         | page URL + `comment`          |
| X (Twitter) | `url` + `text`        | page URL + `comment`          |
| Mail        | `subject` + `body`    | `title` + `comment` + page URL |

## Properties

### Layout

| Property             | Type    | Required | Description                                  |
|----------------------|---------|----------|----------------------------------------------|
| `hasCenteredContent` | boolean | No       | Centers the text block when `true`           |

### Content

| Property | Type   | Required | Description                       |
|----------|--------|----------|-----------------------------------|
| `text`   | object | No       | Optional text block (see `text` partial) |

### Share Configuration

| Property          | Type     | Required | Description |
|-------------------|----------|----------|-------------|
| `share.title`     | string   | No       | Article / subject title (used by LinkedIn and mail) |
| `share.comment`   | string   | No       | Page excerpt — becomes the pre-filled post body on Bluesky / Facebook / X and the email body |
| `share.platforms` | string[] | No       | Subset of built-in platforms to render |
| `share.custom`    | object[] | No       | Extra networks beyond the built-ins (see below) |

## Adding Custom Platforms

Use `share.custom` to add any network not covered by the built-ins. Each entry
needs four fields:

| Field   | Description |
|---------|-------------|
| `name`  | CSS class slug used for the `<li>` |
| `icon`  | File name (no extension) under `lib/layouts/icons/` |
| `label` | `aria-label` for the link |
| `url`   | Share URL template — `{url}`, `{title}`, `{comment}` are replaced with the URL-encoded values |

Example — Reddit and WhatsApp (provide matching `reddit.njk` / `whatsapp.njk`
icon files first):

```yaml
share:
  custom:
    - name: reddit
      icon: reddit
      label: "Share on Reddit"
      url: "https://www.reddit.com/submit?url={url}&title={title}"
    - name: whatsapp
      icon: whatsapp
      label: "Share on WhatsApp"
      url: "https://api.whatsapp.com/send?text={comment}%20{url}"
```
