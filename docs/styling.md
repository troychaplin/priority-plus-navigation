# Styling Priority Plus Navigation

This guide explains how to customize the appearance of the Priority Plus Navigation dropdown menu and toggle button.

## Overview

The Priority Plus Navigation plugin provides two ways to customize styling:

1. **Block Inspector Controls (Recommended)** - Use the sidebar panels for per-block customization with live preview
2. **Theme.json** - Set site-wide defaults that apply to all Priority Plus Navigation blocks

Block-level customizations always take priority over theme.json defaults.

## Using Block Inspector Controls

The easiest way to customize your navigation is through the block inspector sidebar.

### Toggle Button Controls

Found under the **Styles** tab:

**Priority Plus Settings**
- **Button Label**: Text displayed on the "More" button (default: "More")
- **Mobile Collapse**: Toggle to collapse all items into the button at the mobile breakpoint

**Priority Plus Button Colors**
- **Text Color**: Color of the button text
- **Text Hover Color**: Color when hovering over the button
- **Background Color**: Background color of the button
- **Background Hover Color**: Background when hovering

**Priority Plus Button Spacing**
- **Padding**: Internal spacing using theme spacing sizes or custom values

**Priority Plus Button Border**
- **Border**: Color, width, and style with per-side support (top, right, bottom, left)
- **Border Radius**: Corner radius with per-corner support

### Dropdown Menu Controls

Click the **Customize Dropdown Menu** button in the Priority Plus Settings panel to open a modal with live preview:

- **Menu Colors**: Background, item hover background, item text color, item hover text color
- **Menu Styles**: Border (with per-side control), border radius, box shadow presets
- **Submenu Colors**: Background, item hover background, item text color, item hover text color (for nested accordion items)
- **Menu Items**: Item padding, submenu indent, item separator (color, width, style)

## Using Theme.json

For site-wide defaults, add the following to your theme's `theme.json` file:

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
          "borderStyle": "solid",
          "borderRadius": "8px",
          "boxShadow": "0 8px 16px rgba(0, 0, 0, 0.2)",
          "itemSpacing": "1rem 1.5rem",
          "itemHoverBackgroundColor": "rgba(0, 0, 0, 0.08)",
          "itemHoverTextColor": "#007cba",
          "multiLevelIndent": "1.5rem"
        }
      }
    }
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
| `borderStyle` | Style of the dropdown border | `solid` |
| `borderRadius` | Corner radius of the dropdown | `4px` |
| `boxShadow` | Shadow effect for the dropdown | `0 4px 12px rgba(0, 0, 0, 0.15)` |

**Per-side borders**: The block inspector supports per-side border control (top, right, bottom, left). For theme.json, per-side borders can be set using:

| Property | Description |
|----------|-------------|
| `borderTop` | Full border shorthand for top side (e.g., `2px solid #ddd`) |
| `borderRight` | Full border shorthand for right side |
| `borderBottom` | Full border shorthand for bottom side |
| `borderLeft` | Full border shorthand for left side |

### Dropdown Items

| Property | Description | Default Value |
|----------|-------------|---------------|
| `itemSpacing` | Padding around each dropdown item | `0.75rem 1rem` |
| `itemTextColor` | Text color for menu items | `#191919` |
| `itemHoverBackgroundColor` | Background color when hovering over an item | `rgba(0, 0, 0, 0.05)` |
| `itemHoverTextColor` | Text color when hovering over an item | `#191919` |

### Item Separator

| Property | Description | Default Value |
|----------|-------------|---------------|
| `itemSeparatorColor` | Color of the border between items | `transparent` |
| `itemSeparatorWidth` | Width of the border between items | `0` |
| `itemSeparatorStyle` | Style of the border between items | `solid` |

### Submenu Items

These colors apply to nested accordion items (items within expanded submenus):

| Property | Description | Default Value |
|----------|-------------|---------------|
| `submenuBackgroundColor` | Background color for submenu areas | `#ffffff` |
| `submenuItemTextColor` | Text color for submenu items | `#191919` |
| `submenuItemHoverBackgroundColor` | Hover background for submenu items | `rgba(0, 0, 0, 0.05)` |
| `submenuItemHoverTextColor` | Hover text color for submenu items | `#191919` |

**Note:** The submenu background color only applies to first-level submenus to prevent alpha transparency stacking when using semi-transparent colors.

### Multi-level Navigation

| Property | Description | Default Value |
|----------|-------------|---------------|
| `multiLevelIndent` | Indentation for nested submenu levels | `1.25rem` |

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
          "borderStyle": "solid",
          "borderRadius": "8px",
          "boxShadow": "0 8px 16px rgba(0, 0, 0, 0.2)",
          "itemSpacing": "1rem 1.5rem",
          "itemTextColor": "#333333",
          "itemHoverBackgroundColor": "rgba(0, 0, 0, 0.08)",
          "itemHoverTextColor": "#0066cc",
          "itemSeparatorColor": "#e0e0e0",
          "itemSeparatorWidth": "1px",
          "itemSeparatorStyle": "solid",
          "submenuBackgroundColor": "#f0f0f0",
          "submenuItemTextColor": "#444444",
          "submenuItemHoverBackgroundColor": "rgba(0, 0, 0, 0.1)",
          "submenuItemHoverTextColor": "#0066cc",
          "multiLevelIndent": "1.5rem"
        }
      }
    }
  }
}
```

## How It Works

### CSS Custom Properties

The plugin uses a three-layer CSS custom property system:

#### Layer 1: Plugin Defaults (`:root`)

The plugin sets default values on `:root` so they're always available:

```css
:root {
  --wp--custom--priority-plus-navigation--dropdown--background-color: #fff;
  --wp--custom--priority-plus-navigation--dropdown--border-color: #ddd;
  /* ... etc */
}
```

#### Layer 2: Theme.json Overrides (`body`)

WordPress generates CSS custom properties from your theme.json on the `body` selector, which overrides the plugin defaults through CSS cascade:

```css
body {
  --wp--custom--priority-plus-navigation--dropdown--background-color: #f0f0f0;
  --wp--custom--priority-plus-navigation--dropdown--border-color: #999;
  /* ... etc */
}
```

#### Layer 3: Block-level Overrides (inline styles)

When you customize via the block inspector, values are set as inline styles on the `<nav>` element, which has the highest specificity.

### Short Aliases

To keep stylesheets readable, the plugin maps the long `--wp--custom--` names to short `--ppn-dropdown-*` aliases via a shared SCSS mixin:

```scss
// Short alias → long WordPress custom property
--ppn-dropdown-bg: var(--wp--custom--priority-plus-navigation--dropdown--background-color);
--ppn-dropdown-radius: var(--wp--custom--priority-plus-navigation--dropdown--border-radius);
// ... etc
```

These aliases are defined once in `_variables.scss` and included in both the frontend and editor stylesheets.

### Override Hierarchy

1. **Plugin Defaults** (`:root` selector in plugin CSS)
2. **Theme.json** (`body` selector from WordPress)
3. **Block Inspector** (inline styles on the `<nav>` element — highest priority)

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
          "itemTextColor": "#ffffff",
          "itemHoverBackgroundColor": "#ffffff",
          "itemHoverTextColor": "#000000"
        }
      }
    }
  }
}
```

### With Separators

Add visible dividers between menu items:

```json
{
  "settings": {
    "custom": {
      "priorityPlusNavigation": {
        "dropdown": {
          "itemSeparatorColor": "#e0e0e0",
          "itemSeparatorWidth": "1px",
          "itemSeparatorStyle": "solid"
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

Simply remove the `priorityPlusNavigation` section from your theme.json, or delete specific properties you want to reset. In the block inspector, use the "Reset to Defaults" button in the dropdown customizer modal.

## Browser Compatibility

CSS custom properties (CSS variables) are supported in all modern browsers:
- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+

## Resources

- [WordPress theme.json Documentation](https://developer.wordpress.org/block-editor/how-to-guides/themes/global-settings-and-styles/)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [WordPress Custom Settings in theme.json](https://developer.wordpress.org/news/2023/08/adding-and-using-custom-settings-in-theme-json/)
