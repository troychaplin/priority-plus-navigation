# 06 — Server-Rendered Dropdown: Eliminate Client-Side DOM Building

| | |
|---|---|
| **Priority** | High |
| **Effort** | ~1 week |
| **Release** | v2.0 (Interactivity phase 2) |
| **Depends on** | 02 (Tag Processor), 05 phase 1 (store + context); consumes 04 (PHP tokens) |

## Current state

On every overflow change, the frontend rebuilds the More dropdown from scratch:

- `src/dom/dom-extractor.js` — `extractNavItemData()` recursively scrapes labels/URLs/children out of the **live DOM** (cloning nodes, `:scope >` selectors to avoid submenu text contamination).
- `src/dom/dom-builder.js` — `buildDropdownFromOverflow()` regenerates the dropdown `<ul>`'s **innerHTML** (recursive accordion markup, hand-rolled `escapeHtml` from `src/utils/html-utils.js`, literal `›` glyphs, fresh `id`/`aria-controls` counters each rebuild).
- Overflowed originals are hidden with inline `display:none` plus a forced reflow (`PriorityNav.checkOverflow()`).

Consequences: rebuild-induced focus loss (an open accordion vanishes under the user), duplicated escaping/security surface, markup that never matches what the server rendered (hydration mismatch by design), and two of the plugin's most complex modules existing solely to reconstruct information the server already had.

## Proposed architecture

Render the dropdown **once, server-side**, in the `render_block` filter; the client only updates a number.

### Server side (in `Block_Renderer`, post-doc-02)

1. Parse the rendered nav with **`WP_HTML_Processor`** (the tree-aware processor — right tool for extracting/duplicating `<li>` subtrees; fine at the WP 6.8 floor). Collect the top-level `.wp-block-navigation-item` list items.
2. Append inside the nav: the More `<button>` (label/icon from attributes, defaults from doc 04's `build/tokens.php`) and a dropdown `<ul>` containing a **duplicate of every top-level item**, each rewritten for the dropdown context:
   - item index `i` stamped as `data-wp-context='{"index": i}'`
   - visibility binding: `data-wp-class--is-hidden="state.isItemInMain"` (hidden in dropdown when the item still fits in the main row)
   - submenu items become the accordion structure (currently built in JS) — server-rendered, with `data-wp-bind--aria-expanded`, `data-wp-bind--aria-hidden`, `data-wp-on--click="actions.toggleAccordion"`, stable server-generated `id`/`aria-controls` pairs (use the block's anchor or a `wp_unique_id()` per nav)
3. The **original** top-level items get the mirror binding: `data-wp-class--is-overflowed="state.isItemOverflowed"` (with `.is-overflowed { display: none }` in the stylesheet — replacing today's inline `display:none`).
4. Derived state in the store compares `context.index` against `context.visibleCount`:

   ```js
   state: {
       get isItemOverflowed() {
           const { index, visibleCount } = getContext();
           return index >= visibleCount;
       },
       get isItemInMain() { /* inverse */ },
   }
   ```

5. The ResizeObserver kernel (doc 05) now does exactly one write per resize: `context.visibleCount = n`. All rendering falls out of bindings.

### What gets deleted

`src/dom/dom-extractor.js`, `src/dom/dom-builder.js`, most of `src/utils/html-utils.js` (`escapeHtml`, `extractLinkText`, `removeChildTextFromParent`), the rebuild scheduling in `PriorityNav`, and the forced-reflow hacks.

## Details the implementation must get right

- **Duplicate-content accessibility.** Every menu item now exists twice in the DOM. The hidden copy must be removed from the accessibility tree and tab order: `is-hidden`/`is-overflowed` styles must pair with `aria-hidden` + `inert` (bind via `data-wp-bind--inert` / `data-wp-bind--aria-hidden` on the same predicate, or set `visibility: hidden`/`display: none` which removes AT exposure inherently — prefer `display: none` for simplicity and document the choice). Keyboard users must never tab through invisible links. This is the doc 08 acceptance gate.
- **The dropdown starts fully hidden**: initial context `visibleCount = PHP_INT_MAX` (all items in main row, dropdown items all hidden, More button `data-wp-class--is-hidden` when nothing overflows) so no-JS and pre-hydration render states are sane.
- **Mobile collapse mode** (`mobileCollapse` + breakpoint) is just `visibleCount = 0` — no special markup path.
- **Payload growth.** The menu ships twice. For typical menus (5–15 items) this is negligible; for very large mega-menus it doubles a large subtree. Flag in readme/docs; if it ever matters, a `priority_plus_navigation_render_dropdown` filter can let sites opt out per nav. Duplicated links are `aria-hidden`/inert and inside a `<nav>` already crawled once — no meaningful SEO effect.
- **Styling contract.** The dropdown classes generated today by `dom-builder.js` are styled in `src/styles/style.scss` and potentially by themes. Keep the class names identical in the server-rendered markup; any structural change must be called out in v2.0 release notes.
- **Interaction with core's own submenus**: duplicated items containing `wp-block-navigation-submenu` markup carry core's directives (`data-wp-interactive="core/navigation"`, injected by core before our filter runs at priority 10). Strip core's directive attributes from the duplicates with the Tag Processor so the copies belong solely to the plugin's namespace and don't double-register with core's store.

## Risks

- `WP_HTML_Processor` (vs. Tag Processor) has API constraints on tree manipulation; if extraction proves awkward, fall back to rendering duplicates from `$block['innerBlocks']` data instead of parsing HTML — decide during implementation, both are server-side.
- Stable IDs across full-page caches: use deterministic per-nav ids, not `uniqid()`, so cached pages and hydration agree.

## Definition of done

- [ ] No innerHTML/string HTML construction remains in `src/`.
- [ ] Resize across breakpoints updates visibility with **zero** DOM node creation/removal (verify with a MutationObserver in the e2e test).
- [ ] Hidden copies are absent from the accessibility tree and tab order (doc 08 checklist).
- [ ] Open accordion in the dropdown survives a window resize that doesn't change its visibility.
- [ ] Snapshot tests cover the duplicated markup for flat and nested menus.
