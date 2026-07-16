# 08 — Accessibility Hardening

| | |
|---|---|
| **Priority** | Medium-High |
| **Effort** | 2–3 days |
| **Release** | Semantics fixes: v1.2 possible · final form: v2.0 (with 05/06) |
| **Depends on** | Final form: 05, 06 |

## Current state

The frontend has genuine a11y plumbing (aria-expanded/aria-controls on accordions, Escape handling, click-outside) but several structural problems:

1. **`role="menu"` on a list of links** (`src/dom/dom-builder.js`, `createMoreButton()` builds `<ul role="menu">`). WAI-ARIA `menu`/`menuitem` roles are for application-style menus with full arrow-key/typeahead keyboard contracts — which this dropdown doesn't (and shouldn't) implement. For site navigation, the correct pattern is a **disclosure**: `<button aria-expanded aria-controls>` + a plain `<ul>` of links. This matches core/navigation's submenu pattern exactly.
2. **No focus return.** Closing the dropdown via Escape or click-outside leaves focus wherever it was (or drops it to `<body>` when the focused node is hidden). Escape-close should return focus to the More button.
3. **No focus-loss handling on rebuild.** The innerHTML rebuild (doc 06's target) can destroy the focused element mid-interaction — solved structurally by doc 06, listed here for the test checklist.
4. **`aria-hidden` + inline `!important` styles on accordions** (`src/events/accordion-handler.js`) — forcing `display/opacity/visibility/position` inline; should be class-driven.
5. **Hidden overflow items** are `display:none`-inline; after doc 06 there will be duplicated items whose hidden copies must be fully out of the accessibility tree and tab order.
6. **`destroy()` never runs** (`src/core/PriorityNav.js:609`) — observers/listeners leak when navs are removed from the DOM (relevant in client-side-navigation themes). Resolved structurally by doc 05's `data-wp-init` cleanup.
7. Decorative glyphs: the accordion arrow is a literal `›` text node; the chevron SVG lacks `aria-hidden="true"` verification.

## Proposed changes

### Semantics (can ship in v1.2 within the current architecture)

- Drop `role="menu"` / `role="menuitem"`; keep `<button aria-expanded aria-controls="…">` + plain `<ul>`/`<li>`/`<a>`. Update `src/styles/style.scss` selectors if any keyed off the roles.
- `aria-haspopup`: remove or set to `true` only with the menu role gone (`aria-haspopup="menu"` would be wrong for a disclosure); plain disclosure buttons don't need it.
- Mark all decorative icons `aria-hidden="true" focusable="false"`.

### Focus management (final form with 05/06)

- **Escape** closes the dropdown/accordions and returns focus to the More button (store action sets `context.isOpen = false` then focuses `getElement()`-captured button ref; mirror core/navigation's `previousFocus` handling).
- **Click-outside** closes without stealing focus.
- **No focus trap for the dropdown.** Core traps focus only for the modal overlay case; the More dropdown is a disclosure, not a modal — Tab should walk out of it naturally (and closing-on-focusout, core's `handleMenuFocusout` pattern, is the polish step).
- If the plugin's overlay-menu mode ever presents modally, reuse core's conventions: `has-modal-open` class on `<html>` for CSS scroll lock, trap only then.

### Hidden-content integrity (with doc 06)

- Hidden duplicated items: `display: none` (removes from AT + tab order inherently) via the `is-hidden`/`is-overflowed` classes — no inline styles, no `!important`.
- Verify no `aria-hidden="true"` element ever contains the active focus (WCAG 4.1.2 violation pattern).

### Lifecycle

- Delete `destroy()` and the manual listener bookkeeping once doc 05's `data-wp-init` cleanup return owns disconnection.

## Acceptance criteria

**Keyboard-only walkthrough (scripted in the doc 09 e2e suite):**

- [ ] Tab reaches the More button; Enter/Space toggles it; `aria-expanded` reflects state.
- [ ] Tab walks into the open dropdown through every visible link, then out the other side.
- [ ] No hidden (overflowed/duplicated) link ever receives tab focus at any viewport width.
- [ ] Escape inside the dropdown closes it and focus lands on the More button.
- [ ] Accordion toggles operate with Enter/Space and update `aria-expanded`.
- [ ] Hamburger (core overlay) open/close never strands focus in the Priority+ dropdown.

**Screen-reader smoke checklist (manual, VoiceOver + one of NVDA/JAWS):**

- [ ] More button announces name + expanded/collapsed state, and **not** "menu" application semantics.
- [ ] Dropdown announces as a plain list of links; item count matches visible items only.
- [ ] No double-announcement of menu items (doc 06 duplicates must be silent when hidden).

**Automated:**

- [ ] axe-core scan (via Playwright) reports no violations on the rendered nav in closed, open, overflowed, and mobile-collapsed states.
