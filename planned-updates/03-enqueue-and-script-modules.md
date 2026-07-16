# 03 — Asset Loading: Enqueue Fix + Script Modules Migration

| | |
|---|---|
| **Priority** | High |
| **Effort** | 2–3 days total |
| **Release** | Part 1: v1.2 · Part 2: v2.0 |
| **Depends on** | Part 2: doc 01 (WP 6.8 floor) |
| **Prerequisite for** | Part 2 is required by doc 05 |

## Current state

`classes/class-enqueues.php`:

- `init()` (line 51) hooks only `enqueue_block_editor_assets`. There is **no frontend enqueue hook at all**.
- `enqueue_frontend_assets()` (line 93) is invoked as a callback **from inside the `render_block` filter** (wired in `priority-plus-navigation.php`, passed into `Block_Renderer`'s constructor). This achieves conditional loading — assets only load when a Priority+ nav actually renders — but calls `wp_enqueue_script()`/`wp_enqueue_style()` mid-body render, long after `wp_enqueue_scripts` and `wp_head` have fired. The script lands in the footer (fine); the **stylesheet prints in the body** (technically invalid, causes FOUC risk, flagged by validators).
- Everything is classic `wp_enqueue_script` UMD bundles, even though the source is authored as ES modules and webpack down-compiles them.

Core's pattern for the same problem (`core/navigation`, Gutenberg `packages/block-library/src/navigation/index.php:914`): register assets early, then conditionally enqueue **the registered handle** from the render callback — `wp_enqueue_script_module( '@wordpress/block-library/navigation/view' )` gated on the block actually being interactive.

## Part 1 (v1.2): register early, enqueue late

1. Hook `init` or `wp_enqueue_scripts` to **register** (not enqueue) the frontend script and style with `wp_register_script` / `wp_register_style`, keeping the `.asset.php` dependency/version wiring from `Plugin_Paths::get_asset_meta()`.
2. The render-time callback becomes `wp_enqueue_script( 'priority-plus-navigation' )` + `wp_enqueue_style( … )` on the pre-registered handles. Registered-then-late-enqueued scripts print reliably in the footer.
3. For the stylesheet, two acceptable options — pick one and document it:
   - **Accept body-printed style** (current behavior, now at least on a registered handle). Low effort, unchanged UX.
   - **Enqueue on `wp_enqueue_scripts` when detectable**: `has_block( 'core/navigation' )` covers post content but **misses navs in template parts / block themes** — which is exactly why the render-time signal exists today. A hybrid (early enqueue when `has_block()` hits, render-time fallback otherwise) is defensible but adds a code path.
   - Recommendation: keep render-time enqueue for both, on registered handles. Simplicity wins; the style is small.
4. Keep the `$frontend_assets_enqueued` guard so multi-nav pages enqueue once.

## Part 2 (v2.0): Script Modules API

The plugin extends an existing core block and has **no block.json**, so the declarative `viewScriptModule` field is unavailable. That's fine — core/navigation itself doesn't use it either; it registers and conditionally enqueues its module in PHP. Mirror that exactly:

1. On `init`:

   ```php
   wp_register_script_module(
       'priority-plus-navigation/view',
       $this->paths->get_url( 'build/view.js' ),
       array( '@wordpress/interactivity' ),
       $version
   );
   ```

2. From the render filter (only when `is_priority_nav_enabled()`):

   ```php
   wp_enqueue_script_module( 'priority-plus-navigation/view' );
   ```

3. **Build output split** in `webpack.config.js`:
   - `view` entry → ES module output importing `@wordpress/interactivity` as an external module (`import { store } from '@wordpress/interactivity'` stays a real import, resolved by WP's import map). With @wordpress/scripts 32.x this requires the `--experimental-modules` flag; the module build runs as a second compiler pass alongside the classic one.
   - `priority-plus-nav-editor` entry → stays a classic script (`wp_enqueue_script`) since the editor bundle uses `wp.blocks`/`wp.blockEditor` globals.
   - Note: `.asset.php` handling differs for module builds (dependencies include module specifiers); verify `Plugin_Paths::get_asset_meta()` reads the module asset file correctly.
4. Delete the classic frontend registration once doc 05 phase 1 lands — the module replaces it entirely. Until then both paths can coexist behind the feature flag described in doc 05.

## Benefits

- Valid, predictable asset loading; no mid-render `wp_enqueue_style` side effects.
- Modules are deferred by default — no render blocking, no `DOMContentLoaded` dance (doc 05 removes the listener).
- Zero frontend JS on pages without a Priority+ nav (unchanged, but now on a supported pattern).
- Shares WP's single `@wordpress/interactivity` runtime with core blocks instead of shipping bundled duplicates.

## Risks

- `--experimental-modules` is still flag-gated in @wordpress/scripts 32.x; pin the version and re-check when module builds stabilize (the flag's removal is the signal to simplify).
- Module scripts don't exist on WP < 6.5 — Part 2 must not ship before the doc 01 version bump.

## Definition of done

- [ ] Part 1: no `wp_enqueue_*` call happens without a prior `wp_register_*` on an `init`/`wp_enqueue_scripts` hook; W3C validator no longer flags body styles (if the early-style option is chosen).
- [ ] Part 2: frontend loads as `<script type="module">` via the import map; network tab shows `@wordpress/interactivity` loaded once, shared with core navigation.
- [ ] Editor bundle unaffected.
