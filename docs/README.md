# Priority Plus Navigation - Documentation

## What is Priority+?

Priority Plus Navigation is a responsive design pattern that solves a common problem: fitting many navigation items into limited horizontal space without immediately hiding everything behind a hamburger menu.

### The Problem

Traditional navigation approaches face challenges:

- **Fixed navigation**: Items wrap or overflow on smaller screens
- **Hamburger-only**: Hides all items, reducing discoverability
- **Mega menus**: Complex and difficult to maintain

### The Priority+ Solution

Priority+ provides a progressive approach:

1. **Wide screens**: All navigation items visible
2. **Medium screens**: Less important items move to "More" dropdown
3. **Narrow screens**: Only most important items visible, rest in dropdown
4. **Very narrow screens**: All items can move to dropdown when needed
5. **Dynamic**: Automatically adjusts as viewport changes

### Benefits

- **Better discoverability** - Important items always visible when space allows
- **Graceful degradation** - Progressive disclosure as space decreases
- **No hamburger needed** - Maintains horizontal navigation on desktop
- **Mobile friendly** - Works with WordPress hamburger menu on mobile
- **Mobile collapse** - Optionally collapse all items at the mobile breakpoint

## Documentation

### For Users

See the main [README.md](../README.md) for:
- Installation instructions
- How to use the block
- Configuration options

### For Theme Builders

See [styling.md](styling.md) for:
- Complete theme.json styling guide
- Available CSS custom properties
- Toggle button border and spacing controls
- Dropdown menu customization (colors, borders, shadows, separators)
- Common customization examples
- Troubleshooting styling issues

### For Developers

See [how-it-works.md](how-it-works.md) for:
- The Priority+ pattern explained
- Frontend lifecycle and overflow algorithm
- Width caching and performance
- Hamburger mode detection
- Mobile collapse behavior
- Accordion pattern for submenus

See [architecture.md](architecture.md) for:
- Project structure and file map
- PHP backend (Block_Renderer, CSS_Converter, Enqueues)
- JavaScript frontend (PriorityNav, DOM builders, event handlers)
- Editor integration (block variation, inspector controls, live preview)
- CSS architecture (custom property layers, alias pattern)
- Design tokens and runtime config
- Data flow diagrams

## Support

For issues, questions, or contributions, please visit the plugin repository.
