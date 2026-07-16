# 09 — Configuration Surface, Extensibility, and QA Scaffolding

| | |
|---|---|
| **Priority** | Low (but the QA half should land **before** docs 05/06) |
| **Effort** | 2–3 days |
| **Release** | v1.2 |
| **Depends on** | — |

## Part A: configuration surface

### Current state

`src/config.js` hard-codes runtime behavior at compile time:

```js
moreLabel: 'More',      // line 7 — overridable per-block via attribute
gap: 8,                 // line 8 — item gap assumption used in width math
mobileBreakpoint: 600,  // line 9 — mobile-collapse threshold
```

`gap` and `mobileBreakpoint` are not filterable, not attributes, and not derivable from the theme — a theme with different nav spacing gets silently wrong overflow math, and 600px may not match the theme's own breakpoints.

### Proposed change

Decide per value:

| Value | Recommendation |
|---|---|
| `gap` | **Measure it** instead of configuring it: read the computed `column-gap`/`gap` of the list in the width calculator (one `getComputedStyle` call at measure time). Falls back to the token default. Removes the config knob entirely. |
| `mobileBreakpoint` | **Block attribute** (`priorityPlusMobileBreakpoint`, number, default 600) with an inspector control next to the existing mobile-collapse toggle — site builders differ on breakpoints per nav, so per-block beats global. |
| `moreLabel` icon SVG | PHP filter (`priority_plus_navigation_more_icon`) for swapping the chevron without forking. |

Plus a general server-side filter for the whole config array before it's emitted into `data-wp-context` (post-doc-05):

```php
$context = apply_filters( 'priority_plus_navigation_context', $context, $block );
```

### Server-side attribute registration

The ~28 `priorityPlus*` attributes exist only in the JS `blocks.registerBlockType` filter (`src/variation/block.js:46`); PHP reads raw `$block['attrs']` with hand-maintained defaults in `Block_Renderer::collect_attributes()` (line 147). Register them server-side too, via the `block_type_metadata_settings` (or `register_block_type_args`) filter on `core/navigation`, sourcing defaults from doc 04's generated `build/tokens.php`. Benefits: typed defaults in one place, `collect_attributes()` shrinks to a merge, and REST/`get_block_type` consumers see the real schema. Low urgency — it's an internal-consistency win, not user-facing.

## Part B: QA scaffolding

### Current state

Zero automated tests. The CI workflow (`.github/workflows/build.yml`) builds only. Docs 02, 05, and 06 all lean on test suites that don't exist yet — **this is why Part B should land first** despite the doc's Low priority.

### Proposed scaffolding

1. **PHPUnit** (`composer require --dev yoast/phpunit-polyfills`, `wp-env`'s phpunit container or `wp-phpunit`):
   - `Block_Renderer` output snapshots — the doc 02 parity matrix lives here (attribute combinations × markup variants).
   - `CSS_Converter` unit tests (preset conversion, border/padding shorthand collapse) — pure functions, trivial to cover.
2. **End-to-end** via `wp-env` + Playwright (`@wordpress/e2e-test-utils-playwright`), or WordPress Playground (`@wp-playground/cli` with a blueprint auto-mounting the plugin) if a lighter setup is preferred:
   - Fixture: a nav menu with enough items to overflow, including one submenu.
   - Scenarios at multiple viewport widths (wide / medium / narrow / mobile-collapse): correct item counts in main row vs. dropdown; dropdown open/close via mouse and keyboard; Escape and click-outside; hamburger (core overlay) interplay — the canary for the core-internals dependency flagged in doc 05; accordion toggling inside the dropdown.
   - The doc 08 keyboard walkthrough and axe-core scan run in the same suite.
3. **CI**: extend the existing GitHub workflow with jobs for `phpcs`, `lint:js`, `lint:css`, PHPUnit, Playwright (Playwright can run against `wp-env` in CI), plus the doc 04 generated-tokens freshness check.

### Sequencing note

Land order within v1.2: Part B first → doc 02 (uses the snapshot suite) → everything else. The e2e suite is the regression net that makes the v2.0 rewrite (docs 05/06) safe to ship.

## Definition of done

- [ ] `gap` measured at runtime; `mobileBreakpoint` attribute + control; icon and context filters documented in `docs/`.
- [ ] `priorityPlus*` attributes registered server-side with defaults from generated tokens.
- [ ] `npm test` (or `composer test` + `npm run test:e2e`) runs the full suite locally and in CI.
- [ ] CI is red if generated tokens are stale, lint fails, or any snapshot/e2e scenario regresses.
