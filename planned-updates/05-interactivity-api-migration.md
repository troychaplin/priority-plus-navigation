# 05 — Interactivity API Migration: Evaluation, Verdict, and Phased Plan

| | |
|---|---|
| **Priority** | High (strategic centerpiece) |
| **Effort** | 1.5–2 weeks across phases |
| **Release** | v2.0 |
| **Depends on** | 01 (WP 6.8), 02 (Tag Processor), 03 part 2 (Script Modules) |
| **Enables** | 06 (server-rendered dropdown), 08 (a11y final form) |

## The question

Is there a real gain in refactoring the frontend to the Interactivity API, or would it be modernization for its own sake? Short answer: **yes, adopt it — but for specific, nameable reasons, and with one permanent caveat.** This doc is the honest ledger.

## What the Interactivity API does NOT fix

The Priority+ pattern is inherently **imperative measurement**: observe the nav's size, measure item widths, greedily compute how many fit. That's `ResizeObserver` + arithmetic (`src/layout/width-calculator.js`, `PriorityNav.checkOverflow()`), and no directive makes it declarative. No core block's `view.js` does measure-and-collapse — there is no in-core precedent to copy for this part. After the migration, the measurement kernel survives nearly unchanged, hosted inside a `data-wp-init` callback (`callbacks.init` attaching the ResizeObserver via `getElement().ref`, returning a disconnect function as cleanup). Anyone expecting the API to absorb the width math will be disappointed; it won't.

What it does give that kernel: a real lifecycle. The current `PriorityNav.destroy()` (`src/core/PriorityNav.js:609`) is dead code — nothing ever calls it, instances leak observers on DOM removal. `data-wp-init` cleanup returns fix that structurally.

## What it genuinely replaces (ranked by value)

1. **Client-side dropdown rebuilding — the biggest win.** Today `src/dom/dom-extractor.js` scrapes the live DOM and `src/dom/dom-builder.js` regenerates the More-dropdown's innerHTML (hand-rolled `escapeHtml`, recursive accordion markup) **on every overflow change**. With the API, the dropdown is rendered **once, server-side** (doc 06), and the client only flips a `visibleCount` number in context; `data-wp-class` bindings do the rest. Deletes two modules, the escaping utility, rebuild-induced focus loss, and the SSR/hydration mismatch. This alone justifies the migration.
2. **The config channel.** The regex/Tag-Processor-injected `data-more-label` / `data-overlay-menu` / `data-mobile-collapse` attributes become one structured context object emitted with `wp_interactivity_data_wp_context()` and set on the nav via the doc 02 Tag Processor pass:

   ```php
   $processor->set_attribute( 'data-wp-interactive', 'priority-plus-navigation' );
   $processor->set_attribute( 'data-wp-context', wp_interactivity_data_wp_context( array(
       'moreLabel'      => $attributes['more_label'],
       'overlayMenu'    => $attributes['overlay_menu'],
       'mobileCollapse' => $attributes['mobile_collapse'],
       'visibleCount'   => PHP_INT_MAX,
       'isOpen'         => false,
   ) ) );
   ```

   CSS custom properties stay in `style` — they're styling, not state.
3. **Event and ARIA wiring.** `src/events/event-handlers.js` (document-capture click-outside, document Escape listener) and `src/events/accordion-handler.js` (manual `aria-expanded`/`aria-hidden` + inline `!important` styles) map directly onto directives, matching core/navigation's own store shape:
   - More button: `data-wp-on--click="actions.toggleDropdown"`, `data-wp-bind--aria-expanded="context.isOpen"`
   - Escape/keyboard: `data-wp-on--keydown="actions.handleKeydown"` wrapped in **`withSyncEvent`** (required for `event.preventDefault()`/`stopPropagation` in current versions)
   - Click-outside: `data-wp-on-document--click` (or core's focusout pattern)
   - Accordions: per-item `data-wp-context` + `data-wp-class--is-open`, no inline style forcing
4. **Bootstrapping.** The `DOMContentLoaded` scan in `src/priority-plus-navigation.js`, the `data-priority-nav-initialized` double-init guard, and the instance counter all disappear — `data-wp-interactive` regions self-initialize per element, modules are deferred by default, and conditional module enqueue (doc 03) means zero JS where the block isn't used. Bonus: compatibility with client-side navigation/router regions comes for free.

## The permanent caveat: core's store is locked

Core registers `store( 'core/navigation', …, { lock: true } )` (Gutenberg `packages/block-library/src/navigation/view.js`). Third-party code **cannot** read `state.isMenuOpen` or subscribe to core's overlay state — the lock throws. So the current hamburger detection (`MutationObserver` watching the responsive container's `is-menu-open`/`has-modal-open` classes, `PriorityNav.setupResponsiveObserver()` line 316) **must survive the migration** in some form.

Treatment:

- Isolate it as a single `src/view/core-nav-adapter.js` module, attached inside `data-wp-init`, disconnected in the cleanup return. It writes one boolean (`coreOverlayOpen`) into the plugin's own context; everything else reacts through normal bindings.
- Evaluate in phase 3 whether pure CSS can replace it (e.g. suspend Priority+ layout under `.wp-block-navigation__responsive-container.is-menu-open` with CSS alone) — plausible but unproven; do not promise it.
- Flag this as the migration's **version-fragile point**: core's class names are undocumented internals. The doc 09 e2e test must exercise the hamburger interplay on every WP release bump.

## Costs

| Cost | Assessment |
|---|---|
| WP 6.8+ floor | Real. Handled by doc 01's split-release policy (1.x line remains for WP 6.4–6.7). |
| Dual build output (ESM view + classic editor) | Moderate, one-time (doc 03 part 2); `--experimental-modules` flag until wp-scripts stabilizes modules. |
| Debuggability | Directives are harder to step through than plain listeners; mitigated by the store being small and the SSR preview tooling improving. Team learning curve is real but bounded. |
| Editor preview | **Neutral** — the view module never runs in the editor; the React-based editor preview components (`more-button-preview.js`, `dropdown-preview.js`) are unaffected either way. |
| HTML payload | Grows with the doc 06 duplicated dropdown (assessed there), plus context JSON on the nav. Minor. |

## Verdict

**Adopt — fully, but phased — in the plugin's own namespace: `store( 'priority-plus-navigation', … )`.** Never attempt to extend or unlock core's store.

The frontend is exactly the shape the API was built for (state → class/aria bindings, event actions, server-rendered lists), the one imperative kernel fits cleanly in `data-wp-init`, and aligning with core/navigation's own architecture future-proofs the coexistence (both stores hydrate from the same server markup, share one runtime, and never fight over DOM). Rejecting adoption leaves the plugin on a bootstrap/rebuild architecture core has abandoned; stopping at partial adoption (context + events, keeping innerHTML rebuild) forfeits the biggest win and is acceptable only as the transitional phase 1 below, not as an end state.

## Phased plan (each phase shippable)

- **Phase 0 — prerequisites.** Docs 02 (Tag Processor) and 03 (enqueue fix + module registration). No behavior change; module registration can land dark behind the enable check.
- **Phase 1 — hybrid store.** New `src/view.js` entry: `store( 'priority-plus-navigation', { state, actions, callbacks } )`. Config moves from bespoke `data-*` attributes to `data-wp-context` (set server-side via the doc 02 processor). Click-outside, Escape, More-toggle, and accordion aria move to directives. The ResizeObserver + width-calculator and the core-nav-adapter MutationObserver are hosted in `callbacks.init` with cleanup. **The innerHTML dropdown rebuild temporarily remains**, now triggered by a `data-wp-watch` on the computed overflow state. Delete: `src/priority-plus-navigation.js` bootstrap, `src/events/*`, the init guards.
- **Phase 2 — server-rendered dropdown.** Doc 06. Delete `dom-extractor.js`, `dom-builder.js`, most of `html-utils.js`. A11y hardening (doc 08) completes here.
- **Phase 3 — polish.** Evaluate the CSS-only core-nav adapter replacement; consider `getServerState()` needs (likely none — no client-side routing of nav config; record as N/A); delete the dead `destroy()` machinery; rewrite `docs/architecture.md` and `docs/how-it-works.md` for the new pipeline.

## Definition of done (per phase gates)

- [ ] Phase 1: all interaction behavior (open/close, Escape, click-outside, accordions, hamburger interplay, mobile collapse) passes the doc 09 e2e suite with the store-based wiring; no `addEventListener` outside `data-wp-init`-managed code.
- [ ] Phase 2: doc 06 criteria; zero client-side HTML string construction remains in `src/`.
- [ ] Phase 3: docs/ rewritten; adapter decision recorded here with the outcome.
