# Priority Plus Navigation Block

A WordPress block plugin that adds Priority Plus pattern functionality to core WordPress navigation block. It automatically moves navigation items that don't fit into a responsive "More" dropdown menu as the viewport narrows.

<img src="assets/informational.png" alt="A graphical representation of a navigation before and after enabling the priority plus navigation functionality" style="width: 100%; height: auto;">

## What is Priority Plus?

Priority Plus Navigation is a responsive design pattern that keeps all navigation items visible at wide screen sizes, but progressively moves overflow items into a "More" dropdown at smaller screen sizes. This ensures the navigation remains usable on all devices without requiring a hamburger menu or breaking the layout.

## Features

- **Core Navigation Variation** - Extends the standard WordPress navigation block as a variation, no need to rebuild your menus
- **Automatic Overflow Detection** - Intelligently calculates available space and moves items to dropdown
- **Easy Conversion** - Transform any Navigation block to Priority Plus Navigation via block variations
- **Customizable Toggle Button** - Choose label text, colors, padding, border, and border radius for the "More" button
- **Customizable Dropdown Menu** - Full control over menu appearance with live preview: colors, borders, shadows, spacing, separators
- **Mobile Collapse** - Optionally collapse all items into the toggle button at the mobile breakpoint
- **Responsive by Design** - Uses ResizeObserver for smooth, performant resizing
- **Core Navigation Integration** - Automatically detects and respects "Open submenus on click" setting
- **Smart Mobile Detection** - Automatically disables on mobile/hamburger mode to avoid conflicts
- **Submenu Accordions** - Items with submenus in the dropdown become accessible accordions
- **Accessible** - Proper ARIA attributes and keyboard support (Escape to close)
- **Block Theme Ready** - Full support for block themes with alignment, spacing, and color controls
- **Multiple Blocks** - Use multiple Priority Plus Navigation blocks on the same page
- **Future-Proof** - Since it extends core navigation, it benefits from WordPress core updates

## Installation

### From Source

1. Clone or download this repository into your WordPress plugins directory:
```bash
cd wp-content/plugins/
git clone [repository-url] priority-plus-navigation
```

2. Install dependencies:
```bash
cd priority-plus-navigation
npm install
composer install
```

3. Build the plugin:
```bash
npm run build
```

4. Activate the plugin in WordPress Admin > Plugins

## Usage

The Priority Plus Navigation is available as a variation of the core Navigation block. There are two ways to use it:

### Option 1: Insert as Variation

1. In the block editor, click the **+** button to add a block
2. Search for **"Priority Plus Navigation"** or **"Navigation"**
3. When you see the Navigation block, look for the **Priority Plus Navigation** variation in the block variations panel
4. Select the Priority Plus Navigation variation
5. Configure your navigation using the familiar WordPress navigation tools
6. Customize the "More" button label and icon in the block sidebar (Priority Plus Settings panel)

### Option 2: Convert Existing Navigation

1. Select any existing **Navigation** block
2. In the block toolbar or block settings, look for the block variations switcher
3. Choose **"Priority Plus Navigation"** from the variations
4. Your navigation now has Priority Plus behavior enabled!

### Converting Back to Standard Navigation

1. Select a **Priority Plus Navigation** block
2. In the block variations switcher, choose the standard **"Navigation"** variation
3. The Priority Plus behavior is disabled, returning to standard WordPress navigation

## Configuration

### Block Settings (Inspector Sidebar)

When Priority Plus Navigation is active, you'll find these control panels in the block inspector sidebar under the "Styles" tab:

#### Priority Plus Settings
- **Toggle Button Label**: Customize the text displayed on the "More" button (default: "More")
- **Mobile Collapse**: Toggle to collapse all items into the button at the mobile breakpoint (default: enabled)
- **Customize Dropdown Menu**: Opens a modal with a live preview for full menu customization

#### Priority Plus Button Colors
- **Text Color**: Color of the button text
- **Text Hover Color**: Color when hovering over the button
- **Background Color**: Background color of the button
- **Background Hover Color**: Background when hovering

#### Priority Plus Button Spacing
- **Padding**: Control the internal padding of the toggle button

#### Priority Plus Button Border
- **Border**: Color, width, and style with per-side support
- **Border Radius**: Corner radius with per-corner support

#### Dropdown Menu (via Customize Dropdown Menu modal)
- **Menu Colors**: Background, item hover background, item text color, item hover text color
- **Menu Styles**: Border (with per-side control), border radius, box shadow
- **Submenu Colors**: Background, item hover background, item text color, item hover text color
- **Menu Items**: Item padding, submenu indent, item separator (color, width, style)

### Core Navigation Settings

The plugin automatically detects and respects settings from the Core Navigation block:

- **Open submenus on click** - When enabled in Core Navigation, submenus in the "More" dropdown become clickable accordions. When disabled, the link remains functional with a separate arrow button to toggle the submenu.

- **Overlay Menu** - Controls when the responsive overlay/hamburger menu appears:
  - **Never**: No overlay menu (Priority Plus works at all screen sizes)
  - **Mobile**: Overlay menu appears at mobile breakpoints (Priority Plus works on desktop, disables when hamburger menu activates)
  - **Always**: Always shows overlay menu (Priority Plus is automatically disabled and the "Always" option is visually disabled in the editor)

### Block Supports

The block supports all standard WordPress block features:

- **Alignment**: Wide, Full
- **Spacing**: Margin, Padding
- **Colors**: Background, Text

### Two Ways to Customize Menu Styles

#### Option 1: Block Inspector (Recommended)

Use the "Customize Dropdown Menu" button in the block inspector to open a modal with a live preview. This is the easiest way to customize your dropdown menu and allows per-block customization.

#### Option 2: Theme.json (Global Defaults)

For site-wide defaults, customize via your theme's `theme.json`. Block-level customizations will override these defaults.

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
                    "multiLevelIndent": "1.5rem"
                }
            }
        }
    }
}
```

For complete styling documentation, examples, and troubleshooting, see [docs/styling.md](docs/styling.md).

## How It Works

### Architecture

The plugin extends the core Navigation block as a **block variation**:

```
core/navigation (with Priority Plus variation enabled)
  +-- core/navigation-link
  +-- core/navigation-submenu
  +-- core/page-list
  +-- etc.
```

The variation approach:
- Extends `core/navigation` with Priority Plus attributes and controls
- Adds priority plus behavior via JavaScript on the frontend
- The core navigation block handles all menu functionality
- This approach is maintainable, future-proof, and integrates seamlessly with WordPress

### Frontend Behavior

1. **On page load**: The script measures all navigation items
2. **Mobile detection**: Automatically detects if WordPress is in hamburger/responsive mode and disables Priority Nav to avoid conflicts
3. **Overflow detection**: Calculates how many items fit in available space
4. **Item distribution**:
   - Visible items stay in the main navigation
   - Overflow items move to the "More" dropdown
   - All items can overflow when space is insufficient
5. **Submenu handling**: Items with submenus in the dropdown are converted to accessible accordions that respect the Core Navigation "Open on click" setting
6. **Responsive updates**: ResizeObserver automatically recalculates on viewport changes
7. **Smooth transitions**: Uses `requestAnimationFrame` for optimal performance

For detailed technical documentation, see [docs/how-it-works.md](docs/how-it-works.md) and [docs/architecture.md](docs/architecture.md).

## Development

### Prerequisites

- Node.js 14+ and npm
- WordPress 6.0+
- PHP 7.4+

### Setup

```bash
# Install dependencies
npm install
composer install

# Start development mode with hot reload
npm run start

# Build for production
npm run build

# Lint JavaScript
npm run lint:js

# Lint CSS/SCSS
npm run lint:css

# Format code
npm run format

# Create plugin zip
npm run plugin-zip
```

### Project Structure

```
priority-plus-navigation/
+-- classes/                    # PHP backend (renderer, CSS converter, enqueues)
+-- src/
|   +-- config.js              # Runtime config (labels, gaps, breakpoints)
|   +-- tokens.js              # Design tokens (default styling values)
|   +-- priority-plus-navigation.js    # Frontend entry point
|   +-- priority-plus-nav-editor.js    # Editor entry point
|   +-- core/                  # PriorityNav class (overflow detection, state)
|   +-- dom/                   # DOM builders and extractors
|   +-- layout/                # Width calculation
|   +-- events/                # Event handlers and accordion logic
|   +-- utils/                 # DOM and HTML utilities
|   +-- styles/                # SCSS (variables, frontend, editor)
|   +-- variation/             # Block variation, controls, and editor components
+-- build/                     # Compiled assets (generated)
+-- docs/                      # Documentation
+-- priority-plus-navigation.php   # Main plugin file
+-- package.json               # Node dependencies & scripts
+-- composer.json              # PHP dependencies
```

For the complete file map and architecture details, see [docs/architecture.md](docs/architecture.md).

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses ResizeObserver API (supported in all modern browsers)
- Falls back gracefully if JavaScript is disabled

## Accessibility

- **ARIA attributes**: `aria-expanded`, `aria-haspopup`, `aria-label`, `aria-controls`, `aria-hidden`
- **Keyboard navigation**: Escape key closes dropdown and accordions
- **Screen reader support**: Proper semantic markup and ARIA relationships
- **Focus management**: Standard browser focus behavior
- **Submenu accordions**: Accessible accordion pattern for nested menus in dropdown

## Performance

- **ResizeObserver**: Efficient viewport change detection
- **requestAnimationFrame**: Smooth, jank-free calculations
- **Width caching**: Minimizes layout recalculations
- **Debounced recalculation**: Prevents excessive computation

## Overlay Menu Compatibility

Priority Plus Navigation intelligently works with WordPress core navigation overlay menu settings:

### How It Works

- **Never**: Priority Plus is always active, providing responsive navigation through the "More" dropdown
- **Mobile**: Priority Plus works on desktop viewports and automatically disables when the hamburger menu becomes active
- **Always**: Priority Plus is completely disabled (not compatible), and the "Always" option appears greyed out and crossed out in the editor

### Technical Details

The plugin detects when WordPress's overlay/hamburger menu is active by checking for the `is-menu-open` class on the responsive container. When this class is present, Priority Plus temporarily disables itself to avoid conflicts with the native hamburger menu.

## Known Limitations

- When using multiple Priority Plus Navigation blocks on the same page with "Open submenus on click" enabled, ensure each block has unique navigation content to avoid potential ID conflicts
- Priority Plus Navigation is not compatible with the "Always" overlay menu setting - it will automatically prevent usage and switch to "Mobile" mode

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history.

## Credits

Built with WordPress block development tools and inspired by the Priority Plus Navigation pattern.

## License

GPL-2.0-or-later

## Support

For issues, questions, or contributions, please visit the plugin repository.
