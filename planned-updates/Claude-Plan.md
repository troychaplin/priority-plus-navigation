# Plan: Focused Gutenberg alignment + Interactivity API exploration

## Context

The full modernization roadmap lives in `planned-updates/` (committed as `6f808d9`). The first execution pass overreached: it upgraded build tooling (wp-scripts 32, ESLint flat config, Node 22) and added PHPUnit infrastructure, producing a 1000+ file diff. All of that was reverted; the tree is clean.

**Narrowed scope (user-confirmed):** only two things, in small reviewable stages —
1. **Align the plugin code with current Gutenberg practice** — server rendering, asset loading, editor APIs. No build-tool changes, no test infrastructure. The toolchain stays: wp-scripts 31.6, `.eslintrc.js` as-is, Node 20, existing CI.
2. **Explore whether the Interactivity API is right for this block variation** — beyond the written verdict in `planned-updates/05-interactivity-api-migration.md`, validate it hands-on with a throwaway spike.

Key facts already established (verified in prior session):
- `useSettings`, stable `BorderControl`/`BorderBoxControl` all exist in the currently installed `@wordpress/block-editor` 15.14 / `components` 32.3 — the editor modernization needs **no toolchain change** (build + lint verified passing pre-upgrade).
- The Tag Processor + enqueue changes were previously implemented and verified end-to-end on the Studio site (WP 7.0.1) — re-applying is low-risk, and the exact code is in this conversation's history.
- `build/` is tracked in git, so the editor stage includes ~4 rebuilt artifacts (existing repo policy).
- The Studio site at `/Users/troychaplin/Develop/wp-projects/block-plugins` (WP 7.0.1, plugin active, `studio wp` CLI) is the verification environment.

## Stage A — Server-side alignment: regex → WP_HTML_Tag_Processor

*1 file: `classes/class-block-renderer.php`*

- Rewrite `inject_priority_attributes()` on `WP_HTML_Tag_Processor` (`next_tag` scoped to `NAV` + `class_name: wp-block-navigation`, `get_attribute('style')`, `set_attribute(...)`), matching core's own pattern in `block_core_navigation_add_directives_to_submenu()` (gutenberg `packages/block-library/src/navigation/index.php`).
- `preserve_existing_styles()` becomes a plain string-split of the style value read from the processor; `build_style_parts()` signature changes from `$block_content` to `$existing_style`. `CSS_Converter` untouched.
- Pass raw values to `set_attribute()` (it escapes internally); the style string keeps the exact `'; '`-join + trailing `;` format.

**Verification without committed tests:** before changing anything, run an ad-hoc parity script from the scratchpad (not the repo) via `studio wp eval-file`: render a matrix of attribute combinations through the current regex implementation, save outputs; after the refactor, re-render and diff (normalizing attribute order). Plus a live `do_blocks()` render of a real navigation block checking data attributes, escaping, and style merging.

## Stage B — Asset-loading alignment: register early, enqueue late

*1 file: `classes/class-enqueues.php`*

- New `register_frontend_assets()` on `wp_enqueue_scripts`: `wp_register_script`/`wp_register_style` with the existing `.asset.php` metadata wiring.
- `enqueue_frontend_assets()` (called from the render filter) enqueues the registered handles only, with a fallback registration for contexts where `wp_enqueue_scripts` never fired (REST/CLI). Keep the once-only guard.
- This is core/navigation's own conditional-loading shape (register up front, enqueue from the render callback).

**Verification:** `studio wp eval` — render a Priority+ nav, assert `wp_script_is`/`wp_style_is` registered + enqueued; load a frontend page with a nav in the browser and confirm assets arrive and the nav behaves.

## Stage C — Editor API alignment

*4 source files + rebuilt `build/` artifacts; `.eslintrc.js` untouched*

- `src/variation/controls.js`: delete the `addDisableAlwaysOption` HOC (the `document.querySelector` inspector DOM-poking) and its `addFilter`. The existing normalize effect (`overlayMenu 'always' → 'mobile'`) + inspector Notice + server-side `is_priority_nav_enabled()` guard already cover the behavior. Migrate `useSetting` → `useSettings` (array signature).
- `src/variation/components/dropdown-customizer-modal.js`, `panels/menu-items-panel.js`, `panels/menu-styles-panel.js`: `useSetting` → `useSettings`; `__experimentalBorderControl` → stable `BorderControl`; `__experimentalBorderBoxControl` → stable `BorderBoxControl`. ToolsPanel/ToolsPanelItem/SpacingSizesControl/BorderRadiusControl stay experimental (no stable exports in the installed versions) — leave imports as-is, and leave the global `no-unsafe-wp-apis` eslint disable in place (removing it is deferred tooling hygiene, out of scope).
- readme.txt FAQ line about the greyed-out "Always" option updated to describe the normalize-to-Mobile behavior (rides with this stage since that's when behavior changes).
- `npm run build` regenerates the tracked `build/` files.

**Verification:** editor smoke test in the browser on the Studio site (variation inserts; Settings tab shows the Notice; clicking "Always" flips back to Mobile — confirmed via `wp.data` attribute inspection; Styles panels and the dropdown-customizer modal render; zero console errors). This exact walkthrough passed previously.

## Stage D — Interactivity API: hands-on spike, then decision

*Throwaway branch (`spike/interactivity-api`); nothing merges. No build-tool changes — the spike avoids the bundler entirely.*

The written verdict (doc 05) says "adopt, phased." This stage pressure-tests it with working code:

1. **Hand-authored ES module, no build step:** a small plain-JS `view-spike.js` (no JSX, no imports needing bundling) registered with `wp_register_script_module( 'priority-plus-navigation/spike', <src url>, array( '@wordpress/interactivity' ) )` — WP's import map resolves `@wordpress/interactivity` natively on WP 6.5+. The Studio site runs WP 7.0.1.
2. **Directives via the Stage A processor:** in the render filter, set `data-wp-interactive="priority-plus-navigation"` and a `data-wp-context` (via `wp_interactivity_data_wp_context()`) carrying `moreLabel`/`overlayMenu`/`mobileCollapse`/`isOpen`.
3. **Port a representative slice, not everything:** More-button toggle (`data-wp-on--click`, `data-wp-bind--aria-expanded`), Escape/click-outside (`data-wp-on-document--keydown` with `withSyncEvent`, focusout pattern), and the ResizeObserver measurement kernel hosted in `data-wp-init` with cleanup — the three shapes that decide whether the migration is pleasant or painful. The dropdown innerHTML rebuild stays untouched (its replacement is the v2.0 server-rendered-dropdown design, out of spike scope).
4. **Evaluate against core's navigation view.js** (gutenberg checkout: `packages/block-library/src/navigation/view.js`) for store shape and the locked-store constraint (hamburger detection still needs the MutationObserver adapter — confirm in practice).
5. **Deliverable:** an updated `planned-updates/05-interactivity-api-migration.md` "Spike findings" section with the validated (or revised) verdict, DX notes, and any WP-version gotchas — plus the spike branch left in place for reference. Frontend behavior on the main branch is unchanged.

## Explicitly deferred (from the prior pass — do not re-apply)

- wp-scripts 32 / ESLint flat config / `.nvmrc` bump / `package.json` script changes
- PHPUnit scaffolding, phpcs.xml test exclusions, CI workflow changes
- readme.txt `Requires` headers / plugin-header 6.4 bump (worth doing eventually — `wp_trigger_error` in the bootstrap requires WP 6.4 — but it's metadata, not alignment; note it in planned-updates and leave for a release-prep pass)

## Execution & review flow

One stage per commit on `update/gutenberg-alignment`, pausing after each for review before starting the next (A → B → C → D). Stage diffs: A = 1 file, B = 1 file, C = ~5 source files + ~4 build artifacts, D = separate branch only + one docs file on the main branch.

Finally, update `planned-updates/README.md` with a short "Current staged scope" note reflecting this narrowed plan (rides with Stage A's commit).

## Verification summary

- Stages A/B: ad-hoc parity script + `studio wp eval` render/enqueue assertions + frontend page load in browser.
- Stage C: `npm run build` + `npm run lint:js` (existing toolchain) + browser editor walkthrough.
- Stage D: spike exercised in the browser on the Studio frontend (toggle, Escape, click-outside, resize), findings written up.