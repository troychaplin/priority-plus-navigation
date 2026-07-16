# Plan: Stage D — Interactivity API Migration (Phase 1)

## Context

The plugin's frontend is a class-based UMD script (`src/priority-plus-navigation.js` → `src/core/PriorityNav.js`) that manually manages ResizeObserver, MutationObserver, event listeners, DOM manipulation, and innerHTML rebuilding. There are no backwards-compatibility concerns — this is a full replacement targeting the best long-term architecture.

**Why the Interactivity API?**
- Proper lifecycle via `callbacks.init` (returning a cleanup function) fixes the dead `destroy()` method that leaks observers today — nothing ever calls it
- `data-wp-context` replaces scattered `data-more-label` / `data-overlay-menu` / `data-mobile-collapse` attributes with one structured object
- Event directives on the `<nav>` replace document-level `addEventListener` calls
- Server-rendering the More button (required for directives) positions Phase 2 (server-rendered dropdown content) to delete all of `dom-builder.js`, `dom-extractor.js`, and `html-utils.js` — the biggest long-term win

**What the API does NOT change**: the ResizeObserver width-measurement kernel is inherently imperative and stays inside `callbacks.init`. This is expected — no core block does measure-and-collapse either.

**Permanent caveat**: core registers `store('core/navigation', …, { lock: true })`. We cannot read `state.isMenuOpen`. The MutationObserver that watches `.is-menu-open` / `.has-modal-open` on the responsive container survives inside `callbacks.init`.

**Phase 1 scope (this stage)**: Store + directives + server-rendered More button + `data-wp-init` for observers. Dropdown content (the `<ul>` inside More button) is still JS-rebuilt on every overflow change via a `callbacks.watchOverflow` watcher — eliminated in Phase 2 (doc06).

---

## The key architectural shift: More button moves to PHP

Interactivity API directives only process HTML that existed in the server response at hydration time. The More button is currently created entirely by `dom-builder.js::createMoreButton()` at runtime. For directives like `data-wp-on--click="actions.toggleDropdown"` and `data-wp-bind--aria-expanded="context.isOpen"` to work on the button, PHP must render it.

Approach: after `WP_HTML_Tag_Processor` modifies the `<nav>` tag, use `strrpos($html, '</nav>')` to locate the nav's closing tag and inject the More button HTML just before it.

The More button is always rendered but starts hidden (CSS `display:none`). `callbacks.init` shows it when overflow is detected (writing `context.moreVisible = true`), and `data-wp-style--display` drives visibility.

---

## Files

### New
- **`src/view.js`** — single hand-authored ES module; all behavior inlined (no imports from `src/` siblings since this is buildless). Registered via `wp_register_script_module`.
- **`package.json`** — add `"copy:view": "node -e \"require('fs').copyFileSync('src/view.js', 'build/view.js')\""` and wire it into the existing `build` and `start` scripts.

### Modified
- **`classes/class-block-renderer.php`**:
  - `inject_priority_attributes()`: replace the four `data-*` attributes with `data-wp-interactive="priority-plus-navigation"` + `data-wp-context` (via `wp_interactivity_data_wp_context()`); add `data-wp-init="callbacks.init"`, `data-wp-on-document--keydown="actions.handleKeydown"`, `data-wp-on-document--click="actions.closeOnClickOutside"` to the `<nav>` tag
  - New method `render_more_button( array $attributes ): string` — returns the More button HTML with all directives baked in
  - `inject_priority_attributes()` appends More button HTML before `</nav>` via `strrpos`
  - Add `openSubmenusOnClick` to `collect_attributes()` (read from `$block['attrs']['openSubmenusOnClick']`, default `false`)
- **`classes/class-enqueues.php`**:
  - On `init`: `wp_register_script_module('priority-plus-navigation/view', get_url('build/view.js'), ['@wordpress/interactivity'], $version)`
  - `enqueue_frontend_assets()`: call `wp_enqueue_script_module('priority-plus-navigation/view')`, remove `wp_enqueue_script('priority-plus-navigation')` and `wp_enqueue_style` (style remains classic)
  - `register_frontend_assets()`: remove `wp_register_script` for the classic handle

### Deleted
- `src/priority-plus-navigation.js` — bootstrap replaced by `data-wp-interactive` hydration
- `src/core/PriorityNav.js` — class replaced by the store
- `src/events/event-handlers.js` — replaced by directives on `<nav>` and `callbacks.init`
- `src/events/accordion-handler.js` — logic inlined into `src/view.js`
- Entry `'priority-plus-navigation'` in `webpack.config.js` — classic bundle gone

### Kept (temporarily)
`src/layout/width-calculator.js`, `src/dom/dom-builder.js`, `src/dom/dom-extractor.js`, `src/utils/`, `src/config.js` — logic is **inlined** into `src/view.js` rather than imported. These files can be deleted after the migration is verified. `src/config.js`'s `moreLabel` and `mobileBreakpoint` are now covered by `data-wp-context`; only `chevronIconSvg` might survive as a constant inside `view.js` if the chevron is still JS-rendered (it won't be — it's in the PHP template now). So `src/config.js` can be deleted once confirmed.

---

## `data-wp-context` shape

Set on the `<nav>` server-side by `wp_interactivity_data_wp_context()`:

```json
{
  "moreLabel": "More",
  "overlayMenu": "never",
  "mobileCollapse": true,
  "openSubmenusOnClick": false,
  "visibleCount": 9999,
  "isOpen": false,
  "moreVisible": false,
  "coreOverlayOpen": false
}
```

`visibleCount` and `moreVisible` start as "all visible, button hidden" — `callbacks.init` writes the correct values after the first measurement.

---

## More button PHP template

```php
private function render_more_button( array $attributes ): string {
    $label = esc_html( $attributes['toggle_label'] );
    $chevron = '<svg …>…</svg>'; // inline chevron SVG (moved from src/config.js)
    return sprintf(
        '<div class="priority-plus-navigation-more" style="display:none"
              data-wp-style--display="context.moreVisible ? \'block\' : \'none\'">'
        . '<button class="priority-plus-navigation-more__button"'
        .         ' aria-expanded="false"'
        .         ' aria-haspopup="true"'
        .         ' data-wp-bind--aria-expanded="context.isOpen"'
        .         ' data-wp-on--click="actions.toggleDropdown">'
        .     '<span class="priority-plus-navigation-more__label"'
        .           ' data-wp-text="context.moreLabel">%s</span>'
        .     '%s'
        . '</button>'
        . '<ul role="menu" class="priority-plus-navigation-more__dropdown"'
        .      ' data-wp-class--is-open="context.isOpen">'
        . '</ul>'
        . '</div>',
        $label,
        $chevron
    );
}
```

---

## `src/view.js` store shape

```js
import {
    store,
    getContext,
    getElement,
    withSyncEvent,
} from '@wordpress/interactivity';

// --- inlined utilities (from src/layout/width-calculator.js, src/dom/, src/utils/) ---
function cacheItemWidths(list) { /* … */ }
function checkOverflow(ctx, nav, list, moreContainer, dropdown, itemWidths) { /* … */ }
function buildDropdownContent(dropdown, list, visibleCount, ctx) { /* … */ }
// (hamburger detection, accordion toggling, etc.)

store('priority-plus-navigation', {
    actions: {
        toggleDropdown() {
            const ctx = getContext();
            ctx.isOpen = !ctx.isOpen;
        },
        handleKeydown: withSyncEvent(function (event) {
            const ctx = getContext();
            if (event.key !== 'Escape') return;
            if (ctx.isOpen) {
                ctx.isOpen = false;
                event.preventDefault();
            }
        }),
        closeOnClickOutside(event) {
            const ctx = getContext();
            const { ref } = getElement();
            if (ctx.isOpen && !ref.contains(event.target)) {
                ctx.isOpen = false;
            }
        },
    },
    callbacks: {
        init() {
            const ctx = getContext();
            const { ref } = getElement();

            const list = ref.querySelector('.wp-block-navigation__container');
            const moreContainer = ref.querySelector('.priority-plus-navigation-more');
            const dropdown = moreContainer.querySelector('[role="menu"]');

            // Bail if overlayMenu=always (same guard as current JS)
            if (ctx.overlayMenu === 'always') return;

            const itemWidths = cacheItemWidths(list);

            // ResizeObserver — hosts the measurement kernel
            const ro = new ResizeObserver(() => {
                requestAnimationFrame(() =>
                    checkOverflow(ctx, ref, list, moreContainer, dropdown, itemWidths)
                );
            });
            ro.observe(ref);

            // MutationObserver — hamburger detection (core's store is locked)
            const responsiveContainer = ref
                .closest('.wp-block-navigation')
                ?.querySelector('.wp-block-navigation__responsive-container');
            let mo;
            if (responsiveContainer) {
                mo = new MutationObserver(() => {
                    ctx.coreOverlayOpen =
                        responsiveContainer.classList.contains('is-menu-open') ||
                        responsiveContainer.classList.contains('has-modal-open');
                });
                mo.observe(responsiveContainer, {
                    attributes: true,
                    attributeFilter: ['class', 'aria-hidden'],
                });
            }

            // Initial measurement
            checkOverflow(ctx, ref, list, moreContainer, dropdown, itemWidths);

            // Cleanup — this is what the dead destroy() never provided
            return () => {
                ro.disconnect();
                mo?.disconnect();
            };
        },
    },
});
```

**Notes on `withSyncEvent`**: needed so `event.preventDefault()` in `handleKeydown` fires synchronously. Verify the exact import path when implementing — it's `@wordpress/interactivity` in WP 6.5+.

---

## SCSS / CSS

No changes to frontend SCSS needed initially. The More button's existing CSS classes (`priority-plus-navigation-more`, `is-open`, etc.) are unchanged. The `display:none` initial state is set inline on the div; `data-wp-style--display` overrides it once `context.moreVisible` is set. Verify there are no existing stylesheet rules that fight this (likely fine since the button was always JS-injected before).

---

## Build wiring

After implementation, the npm scripts should look like:

```json
"build": "wp-scripts build && node -e \"require('fs').copyFileSync('src/view.js','build/view.js')\"",
"start": "wp-scripts start & nodemon --watch src/view.js --exec \"cp src/view.js build/view.js\""
```

(Or use a simpler `concurrently` + watch approach — decide during implementation based on what's already in package.json.)

The `priority-plus-navigation` entry is removed from `webpack.config.js`.

---

## What Phase 2 will clean up (doc 06, not this stage)

Once Phase 1 is stable, Phase 2 (server-rendered dropdown) will:
- PHP renders ALL nav items as accordion HTML inside the More button's `<ul>` at server time
- Each item gets `data-wp-class--hidden="context.visibleCount > __index"` (or similar) so JS only needs to write `ctx.visibleCount`, not rebuild innerHTML
- Delete `src/dom/dom-builder.js`, `src/dom/dom-extractor.js`, `src/utils/html-utils.js`
- At that point `buildDropdownContent()` in `view.js` and the entire `dom-extractor.js` logic are gone

---

## Verification

1. `npm run build` (with the updated copy step) — confirm `build/view.js` is present and readable
2. Browser: insert a Priority Plus Navigation block on a page with multiple nav items. Confirm:
   - More button appears when items overflow (ResizeObserver working)
   - More button click opens/closes the dropdown (`context.isOpen` toggling via directive)
   - Escape closes the dropdown (document keydown handler)
   - Click outside closes the dropdown (document click handler)
   - Hamburger menu overlay disables Priority+ (MutationObserver + `context.coreOverlayOpen`)
   - Mobile collapse works at the breakpoint
   - Accordion submenus expand/collapse inside the dropdown
   - Browser console is empty throughout
3. Confirm `<script type="module">` in page source (not a classic `<script>`) — verifies module registration worked
4. Confirm old `priority-plus-navigation.js` is NOT in the page source (classic handle gone)
5. `npm run lint:js` clean

Leave uncommitted for user review.