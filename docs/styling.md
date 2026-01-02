# Styling Priority Plus Navigation

This guide explains how to customize the appearance of the Priority Plus Navigation dropdown menu using theme.json.

## Overview

The Priority Plus Navigation plugin provides sensible defaults for dropdown styling, which can be easily customized through your theme's `theme.json` file. The plugin uses CSS custom properties that can be overridden without writing any custom CSS.

## Quick Start

Add the following to your theme's `theme.json` file:

```json
{
  "version": 3,
  "settings": {
    "custom": {
        "priorityPlusNavigation": {
            "dropdown": {
                "backgroundColor": "#f0f0f0",
                "borderColor": "#999999",
                "borderWidth": "2px",
                "borderRadius": "8px",
                "boxShadow": "0 8px 16px rgba(0, 0, 0, 0.2)",
                "itemSpacing": "1rem 1.5rem",
                "itemHoverBackgroundColor": "rgba(0, 0, 0, 0.08)",
                "itemHoverTextColor": "#007cba",
                "multiLevelIndent": "3.5rem"
            }
        }
    },
  }
}
```

Only specify the properties you want to customize. All properties are optional.

## Available Properties

### Dropdown Container

| Property | Description | Default Value |
|----------|-------------|---------------|
| `backgroundColor` | Background color of the dropdown menu | `#ffffff` |
| `borderColor` | Border color of the dropdown menu | `#dddddd` |
| `borderWidth` | Width of the dropdown border | `1px` |
| `borderRadius` | Corner radius of the dropdown | `4px` |
| `boxShadow` | Shadow effect for the dropdown | `0 4px 12px rgba(0, 0, 0, 0.15)` |

### Dropdown Items

| Property | Description | Default Value |
|----------|-------------|---------------|
| `itemSpacing` | Padding around each dropdown item | `0.75rem 1rem` |
| `itemHoverBackgroundColor` | Background color when hovering over an item | `rgba(0, 0, 0, 0.05)` |
| `itemHoverTextColor` | Text color when hovering over an item | `inherit` |

### Multi-level Navigation

| Property | Description | Default Value |
|----------|-------------|---------------|
| `multiLevelIndent` | Indentation for nested submenu levels | `1rem` |

## Complete Example

Here's a complete example showing all available properties:

```json
{
  "version": 3,
  "settings": {
    "custom": {
      "priorityPlusNavigation": {
        "dropdown": {
          "backgroundColor": "#f8f9fa",
          "borderColor": "#dee2e6",
          "borderWidth": "2px",
          "borderRadius": "8px",
          "boxShadow": "0 8px 16px rgba(0, 0, 0, 0.2)",
          "itemSpacing": "1rem 1.5rem",
          "itemHoverBackgroundColor": "rgba(0, 0, 0, 0.08)",
          "itemHoverTextColor": "#0066cc",
          "multiLevelIndent": "1.5rem"
        }
      }
    }
  }
}
```

## How It Works

### CSS Custom Properties

The plugin defines CSS custom properties on the `:root` selector with default values. WordPress generates CSS custom properties from your theme.json on the `body` selector, which overrides the plugin defaults through CSS cascade.

**Plugin defaults (`:root`):**
```css
:root {
  --wp--custom--priority-plus-navigation--dropdown--background-color: #ffffff;
  --wp--custom--priority-plus-navigation--dropdown--border-color: #dddddd;
  /* ... etc */
}
```

**Theme.json generates (`body`):**
```css
body {
  --wp--custom--priority-plus-navigation--dropdown--background-color: #f0f0f0;
  --wp--custom--priority-plus-navigation--dropdown--border-color: #999999;
  /* ... etc */
}
```

Since both selectors have the same specificity and WordPress theme.json CSS loads after the plugin CSS, theme values override plugin defaults.

### Override Hierarchy

1. **Plugin Defaults** (`:root` selector in plugin CSS)
2. **Theme.json** (`body` selector from WordPress)
3. **Custom CSS** (your theme's custom stylesheet - highest priority)

## Common Customizations

### Minimal Style

Remove borders and shadows for a minimal look:

```json
{
  "settings": {
    "custom": {
      "priorityPlusNavigation": {
        "dropdown": {
          "borderWidth": "0",
          "boxShadow": "none"
        }
      }
    }
  }
}
```

### Card Style

Add more spacing and shadow for a card-like appearance:

```json
{
  "settings": {
    "custom": {
      "priorityPlusNavigation": {
        "dropdown": {
          "borderRadius": "12px",
          "boxShadow": "0 10px 25px rgba(0, 0, 0, 0.1)",
          "itemSpacing": "1.25rem 1.5rem"
        }
      }
    }
  }
}
```

### High Contrast

Increase contrast for better accessibility:

```json
{
  "settings": {
    "custom": {
      "priorityPlusNavigation": {
        "dropdown": {
          "backgroundColor": "#000000",
          "borderColor": "#ffffff",
          "borderWidth": "2px",
          "itemHoverBackgroundColor": "#ffffff",
          "itemHoverTextColor": "#000000"
        }
      }
    }
  }
}
```

## Using WordPress Preset Values

You can reference WordPress color and spacing presets in theme.json:

```json
{
  "settings": {
    "custom": {
      "priorityPlusNavigation": {
        "dropdown": {
          "backgroundColor": "var(--wp--preset--color--base)",
          "borderColor": "var(--wp--preset--color--contrast)",
          "itemSpacing": "var(--wp--preset--spacing--30)"
        }
      }
    }
  }
}
```

## Advanced: Custom CSS

If you need even more control, you can write custom CSS targeting the dropdown elements:

```css
/* In your theme's style.css or custom CSS */
.is-style-priority-plus-navigation .priority-plus-navigation-dropdown {
  /* Your custom styles here */
  backdrop-filter: blur(10px);
  margin-top: 0.5rem;
}

.is-style-priority-plus-navigation .priority-plus-navigation-dropdown li a {
  /* Custom item styles */
  font-weight: 500;
  letter-spacing: 0.025em;
}
```

**Note:** Custom CSS has the highest priority and will override both plugin defaults and theme.json values.

## More Button Styling

The "More" button is styled separately through **block attributes** in the WordPress editor, not theme.json. You can customize it using the block inspector controls:

- Button Label
- Button Icon
- Text Color & Hover Color
- Background Color & Hover Color
- Padding

See the main [README.md](../README.md) for details on using the block controls.

## Troubleshooting

### My theme.json changes aren't applying

1. **Clear WordPress cache** - Theme.json is cached by WordPress
2. **Check file location** - Ensure theme.json is in your theme's root directory
3. **Validate JSON** - Use a JSON validator to check for syntax errors
4. **Check property names** - Property names are case-sensitive (use camelCase)
5. **Enable debugging** - Set `WP_DEBUG` or `SCRIPT_DEBUG` to `true` in wp-config.php to disable caching

### Default values showing instead of my customization

WordPress generates theme.json CSS with the `body` selector. Make sure:
- Your theme.json is valid JSON
- Property names match exactly (e.g., `backgroundColor`, not `background-color`)
- Theme.json version is set to `3`

### Need to reset to defaults

Simply remove the `priorityPlusNavigation` section from your theme.json, or delete specific properties you want to reset.

## Browser Compatibility

CSS custom properties (CSS variables) are supported in all modern browsers:
- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+

## Performance

CSS custom properties have negligible performance impact. They are natively supported by browsers and do not require any JavaScript processing.

## Resources

- [WordPress theme.json Documentation](https://developer.wordpress.org/block-editor/how-to-guides/themes/global-settings-and-styles/)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [WordPress Custom Settings in theme.json](https://developer.wordpress.org/news/2023/08/adding-and-using-custom-settings-in-theme-json/)
