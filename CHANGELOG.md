# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Prefix the change with one of these keywords:

-   _Added_: for new features.
-   _Changed_: for changes in existing functionality.
-   _Deprecated_: for soon-to-be removed features.
-   _Removed_: for now removed features.
-   _Fixed_: for any bug fixes.
-   _Security_: in case of vulnerabilities.

## [Unreleased]

-   _Added_: Editor preview of the More button that reflects label, colors, and padding settings
-   _Added_: Transform to convert Priority Plus Navigation back to standard Navigation block
-   _Fixed_: Navigation items and More button no longer wrap to a second line
-   _Fixed_: Initial page load now correctly calculates overflow and shows the More button

## [1.0.0]

### Core

-   _Added_: Priority Plus Navigation as a block variation of the core Navigation block
-   _Added_: Automatic overflow detection using ResizeObserver to show/hide items based on available space
-   _Added_: Dynamic "More" dropdown that collects overflow navigation items
-   _Added_: Support for multiple Priority Plus Navigation instances on the same page
-   _Added_: Width caching and requestAnimationFrame for performant resize calculations

### Editor Controls

-   _Added_: Customizable "More" button label
-   _Added_: Button color controls for text, background, and hover states
-   _Added_: Button padding controls with theme spacing size support
-   _Added_: Dropdown customizer modal with live preview
-   _Added_: Dropdown menu color controls (background, item text, hover states)
-   _Added_: Dropdown border controls with per-side support, radius, and box shadow
-   _Added_: Dropdown item padding and separator styling
-   _Added_: Submenu color controls (background, text, hover states)
-   _Added_: Submenu indentation control for nested menu levels
-   _Added_: Reset to defaults for all dropdown styles

### Submenu & Accordion Support

-   _Added_: Accordion pattern for nested submenus within the dropdown
-   _Added_: Click mode (full button toggle) and arrow mode (separate toggle button) based on core submenu settings
-   _Added_: Keyboard navigation with Escape key to close dropdowns and accordions
-   _Added_: Full ARIA support for accordion expand/collapse states

### Overlay Menu Compatibility

-   _Added_: Automatic detection of WordPress overlay/hamburger menu state
-   _Added_: Priority Plus disables when hamburger menu is active, re-enables on desktop
-   _Changed_: "Always" overlay option is prevented and auto-converted to "Mobile" with editor notice

### Theme Integration

-   _Added_: theme.json support via `settings.custom.priorityPlusNavigation.dropdown` path
-   _Added_: CSS custom properties for all styling options
-   _Added_: WordPress preset value support (spacing sizes, colors)
-   _Added_: Block-level overrides that take precedence over theme.json defaults