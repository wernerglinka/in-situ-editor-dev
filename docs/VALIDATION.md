# Content Validation Guide

This starter includes built-in validation for structured content to help catch common configuration errors before they cause problems in production.

## Why Validation Matters

The structured content approach relies on frontmatter configuration. Small mistakes can cause "silent failures" - your site builds successfully but doesn't work as expected:

```yaml
# ❌ This builds but breaks functionality
sections:
  - sectionType: hero
    containerFields:
      isAnimated: "false"    # String always evaluates to true!
    text:
      titleTag: "header"     # Invalid HTML - should be h1-h6
    ctas:
      - buttonStyle: "blue"  # CSS class doesn't exist
```

## Common Validation Errors

### 1. String vs Boolean Issues

**Problem**: Strings always evaluate to `true` in templates, even `"false"`

```yaml
# ❌ Wrong - string that always evaluates to true
isAnimated: "false"

# ✅ Correct - actual boolean
isAnimated: false
```

**Validated Fields**:
- `isAnimated`, `isReverse`, `isFullScreen`, `isDisabled`
- `containerFields.inContainer`, `containerFields.isAnimated`
- `containerFields.noMargin.top`, `containerFields.noMargin.bottom`
- `containerFields.noPadding.top`, `containerFields.noPadding.bottom`
- `containerFields.background.isDark`
- `ctas[].isButton`

### 2. Invalid Heading Tags

**Problem**: Invalid heading tags create poor HTML semantics

```yaml
# ❌ Wrong - not a valid HTML heading
text:
  titleTag: "header"

# ✅ Correct - valid HTML heading
text:
  titleTag: "h2"
```

**Valid Values**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`

### 3. Invalid Button Styles

**Problem**: CSS classes don't exist for invalid button styles

```yaml
# ❌ Wrong - CSS class .btn-blue doesn't exist
ctas:
  - buttonStyle: "blue"

# ✅ Correct - CSS class .btn-primary exists
ctas:
  - buttonStyle: "primary"
```

**Valid Values**: `primary`, `secondary`, `ghost`, `none`

### 4. Invalid Background Screen Options

**Problem**: Image overlay classes don't exist for invalid options

```yaml
# ❌ Wrong - CSS class doesn't exist
containerFields:
  background:
    imageScreen: "medium"

# ✅ Correct - valid overlay option
containerFields:
  background:
    imageScreen: "dark"
```

**Valid Values**: `light`, `dark`, `none`

## Error Messages

When validation fails, you'll see helpful error messages:

```
❌ Validation Error in src/index.md

Section 0 (hero):
  - containerFields.isAnimated: expected boolean, got string "false"
  - text.titleTag: "header" is invalid. Must be one of: h1, h2, h3, h4, h5, h6
  - ctas[0].buttonStyle: "blue" is invalid. Must be one of: primary, secondary, ghost, none

Tip: String "false" evaluates to true in templates. Use boolean false instead.
```

## Validated Components

Currently, these components include validation rules:

### Hero Section (`sectionType: hero`)
- Boolean flags: `isReverse`, `isFullScreen`, `isDisabled`
- Container options: `inContainer`, `isAnimated`, margin/padding flags
- Background options: `isDark`, `imageScreen`
- Text options: `titleTag`
- CTA options: `isButton`, `buttonStyle`

### Banner Section (`sectionType: banner`)
- Similar to hero with appropriate defaults
- Boolean flags: `isReverse`, `isDisabled`
- Container and background options
- Text and CTA validation

### Text-Only Section (`sectionType: text-only`)
- Container options: `inContainer`, `isAnimated`
- Text options: `titleTag`
- CTA options: `isButton`, `buttonStyle`

## Best Practices

### 1. Use Actual Booleans
```yaml
# ✅ Good
isAnimated: true
isReverse: false

# ❌ Avoid
isAnimated: "true"
isReverse: "false"
```

### 2. Use Valid Enum Values
Always use the predefined values for fields like `titleTag`, `buttonStyle`, etc.

### 3. Test Your Content
Run `npm run build` to validate your content. The build will fail with helpful error messages if validation errors are found.

### 4. Check Component Documentation
Each component's README.md file documents the expected properties and valid values.

## Extending Validation

Component validation rules are defined in each component's `manifest.json` file. If you create custom components, you can add validation rules:

```json
{
  "name": "my-component",
  "validation": {
    "required": ["sectionType"],
    "properties": {
      "sectionType": {
        "type": "string",
        "const": "my-component"
      },
      "myBooleanField": {
        "type": "boolean"
      },
      "myEnumField": {
        "type": "string",
        "enum": ["option1", "option2", "option3"]
      }
    }
  }
}
```

This validation system helps ensure your structured content is correct and will render properly in production.