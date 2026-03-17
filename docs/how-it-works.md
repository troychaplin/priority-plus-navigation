# How Priority Plus Navigation Works

This document explains how the Priority Plus Navigation plugin implements the Priority+ design pattern in WordPress.

## The Priority+ Pattern

### Concept

Priority Plus Navigation prioritizes the most important navigation items by keeping them visible. As horizontal space decreases, less important items progressively move into a "More" dropdown menu.

### Visual Example

**Wide Screen:**
```
[Home] [About] [Services] [Products] [Blog] [Contact]
```

**Medium Screen:**
```
[Home] [About] [Services] [Products] [More v]
                                      +-- Blog
                                      +-- Contact
```

**Narrow Screen:**
```
[Home] [About] [More v]
               +-- Services
               +-- Products
               +-- Blog
               +-- Contact
```

**Very Narrow Screen (all items overflow):**
```
[More v]
+-- Home
+-- About
+-- Services
+-- Products
+-- Blog
+-- Contact
```

### Key Principles

1. **Progressive disclosure** - Items hide one by one, not all at once
2. **Dynamic adjustment** - Responds to viewport changes in real-time
3. **Predictable behavior** - Items hide in reverse order (last items first)
4. **Full overflow support** - All items can move to the dropdown when space is insufficient

## Implementation

### Architecture

The plugin uses a **block variation** approach:

```
core/navigation (WordPress block)
    |
Priority+ Variation
    +-- Inherits all core navigation features
    +-- Adds custom attributes (30+ for toggle, menu, submenu)
    +-- Injects frontend JavaScript via PHP render filter
    +-- Adds inspector controls via editor filters
```

**Why block variation?**
- Reuses WordPress menus — no need to rebuild
- Automatic theme compatibility
- Benefits from core updates
- Easy to convert back and forth via block toolbar

### Frontend Lifecycle

#### 1. Initialization

When the page loads, the Priority+ script:

```javascript
// Find all Priority Plus Navigation blocks
const navs = document.querySelectorAll(
  '.wp-block-navigation.is-style-priority-plus-navigation'
);

// Initialize each one
navs.forEach(nav => new PriorityNav(nav));
```

Each instance gets a unique ID (`priority-nav-0`, `priority-nav-1`, etc.) used for ARIA relationships.

#### 2. Initial Calculation

For each navigation:

1. **Check compatibility**
   ```javascript
   if (overlayMenu === 'always') return; // Not compatible
   ```

2. **Check hamburger mode**
   ```javascript
   if (isInHamburgerMode()) {
     disablePriorityNav(); // Let WordPress handle it
   }
   ```

3. **Measure items**
   ```javascript
   // Cache width of each navigation item (sub-pixel accuracy)
   itemWidths = [125.5, 98.2, 156.7, 88.3, 112.9];
   ```

4. **Calculate overflow**
   ```javascript
   visibleCount = calculateVisibleItems();
   showVisibleItems(visibleCount);
   buildDropdown(visibleCount);
   ```

#### 3. Responsive Updates

The plugin watches for viewport changes:

```javascript
// Use ResizeObserver for efficient detection
resizeObserver.observe(nav);

// On resize:
checkOverflow(); // Recalculate visible items
```

### The Overflow Algorithm

This is the core of Priority+:

```javascript
function calculateVisibleItems(availableWidth, moreButtonWidth, gap) {
  let usedWidth = 0;
  let visibleCount = 0;

  for (let i = 0; i < items.length; i++) {
    const itemWidth = itemWidths[i];
    const gapWidth = i > 0 ? gap : 0;

    // Would this item + More button fit?
    const totalNeeded = usedWidth + gapWidth + itemWidth + gap + moreButtonWidth;

    if (totalNeeded <= availableWidth) {
      usedWidth += gapWidth + itemWidth;
      visibleCount++;
    } else {
      // No room — this and remaining items go to dropdown
      break;
    }
  }

  return visibleCount;
}
```

**Key points:**
- Accounts for gaps between items
- Always includes the More button width in the calculation
- All items can overflow (visibleCount can be 0)
- Uses cached widths for performance

### Width Caching

To avoid constant re-measurement:

```javascript
// Measure once, on initialization
function cacheItemWidths(items) {
  // Temporarily show all items
  items.forEach(item => item.style.display = '');

  // Measure each one (sub-pixel accuracy)
  const widths = items.map(item => {
    return item.getBoundingClientRect().width;
  });

  return widths; // [125.5, 98.2, 156.7, ...]
}
```

**Cache invalidation:**
- When transitioning from hamburger to desktop mode
- When items might have been hidden/resized
- When zero-width values are detected

### Hamburger Mode Detection

WordPress overlay menu integration:

```javascript
function isInHamburgerMode(responsiveContainer) {
  if (!responsiveContainer) {
    return false; // overlayMenu: 'never'
  }

  // WordPress adds 'is-menu-open' when hamburger is active
  return responsiveContainer.classList.contains('is-menu-open');
}
```

**Behavior by overlay menu setting:**

| Setting | Container Exists? | Priority+ Behavior |
|---------|------------------|-------------------|
| **Never** | No | Always active |
| **Mobile** | Yes (hidden) | Active on desktop, disables when hamburger opens |
| **Always** | Yes (visible) | Blocked — not compatible |

### Mobile Collapse

When the `priorityPlusMobileCollapse` attribute is enabled (default: `true`), the plugin collapses all navigation items into the toggle button at the mobile breakpoint (600px). This provides a clean mobile experience without relying on the WordPress hamburger menu.

### Dropdown Building

Items that don't fit are dynamically added to the dropdown:

```javascript
function buildDropdown(visibleCount) {
  dropdown.innerHTML = ''; // Clear existing

  for (let i = visibleCount; i < items.length; i++) {
    const item = items[i];
    const data = extractNavItemData(item);

    if (data.hasSubmenu) {
      const accordion = buildAccordion(data);
      dropdown.appendChild(accordion);
    } else {
      const li = buildDropdownItem(data);
      dropdown.appendChild(li);
    }
  }
}
```

### Accordion Pattern

Items with submenus become accordions in the dropdown:

**Two modes based on WordPress setting:**

1. **Click mode** (`openSubmenusOnClick: true`)
   - Entire item is a clickable button
   - Toggles submenu open/closed
   - Link is not functional (acts as toggle)

2. **Arrow mode** (`openSubmenusOnClick: false`)
   - Link remains functional
   - Separate arrow button for submenu toggle
   - Better for touch devices

## Performance

### Optimization Techniques

1. **Width Caching** — Measure once, reuse many times, only invalidate when necessary
2. **ResizeObserver** — Native browser API, more efficient than polling or resize events
3. **requestAnimationFrame** — Smooth calculations that don't block the main thread
4. **Debouncing** — `isCalculating` flag prevents overlapping calculations
5. **Early Returns** — Skip work when disabled or unmeasurable

### Performance Metrics

- **Initial load**: Single layout calculation (~5-10ms)
- **Resize**: Recalculation only when needed (~2-5ms)
- **Hamburger toggle**: Simple class check (~1ms)

## Responsive Behavior

### Desktop to Mobile Transition

```
Desktop (Priority+ active)
    | viewport narrows
Mobile breakpoint reached
    | WordPress adds 'is-menu-open' class
MutationObserver detects change
    | isInHamburgerMode() returns true
Priority+ disables
    | Show all items, hide More button
WordPress hamburger menu takes over
```

### Mobile to Desktop Transition

```
Mobile (WordPress hamburger active)
    | viewport widens
Desktop breakpoint reached
    | WordPress removes 'is-menu-open' class
MutationObserver detects change
    | isInHamburgerMode() returns false
Priority+ enables
    | Cache widths, calculate overflow
Show visible items, build dropdown
```

## Edge Cases

### 1. More Button Larger Than Container

When the More button itself is wider than the available space, all items are hidden and only the More button is shown with all items in the dropdown.

### 2. Hidden Navigation

```javascript
if (!isMeasurable(list)) {
  // Schedule retry when visible
  scheduleRetry();
  return;
}
```

### 3. Multiple Instances

```javascript
// Each instance gets unique ID
this.instanceId = `priority-nav-${instanceCounter++}`;

// Used for accordion ARIA relationships
<button aria-controls="priority-nav-0-submenu-1">
```

### 4. Zero Widths

```javascript
// Detect invalid cache
if (widths.some(w => w === 0)) {
  widths = cacheItemWidths(items); // Remeasure
}
```

## Summary

The Priority Plus Navigation plugin implements a responsive pattern that:

1. **Measures** navigation items accurately with sub-pixel precision
2. **Calculates** how many fit in available space (including zero)
3. **Hides** overflow items progressively
4. **Builds** a dropdown menu dynamically with accordion support
5. **Updates** on viewport changes via ResizeObserver
6. **Integrates** with WordPress hamburger menu
7. **Performs** efficiently through caching and optimization

The result is a navigation system that provides the best of both worlds: horizontal navigation on desktop with graceful degradation on smaller screens, while seamlessly integrating with WordPress's native mobile navigation.
