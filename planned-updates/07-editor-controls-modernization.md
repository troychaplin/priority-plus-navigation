# 07 — Editor Controls Modernization

| | |
|---|---|
| **Priority** | Medium |
| **Effort** | 2–3 days |
| **Release** | v1.2 (independent, non-breaking) |
| **Depends on** | — |

## Current state

`src/variation/controls.js` registers two `editor.BlockEdit` HOCs:

1. **`addDisableAlwaysOption`** (line 37, filter priority 5) — after render, it reaches into the inspector with `document.querySelector('.block-editor-block-inspector … [data-value="always"]')` (line 58) to grey out the "Always" option of core's overlay-menu control. This DOM-poking depends on core's private inspector markup and silently breaks whenever the block-editor markup changes; it also fights React (core can re-render and undo the tweak).
2. **`withPriorityPlusControls`** (line 85, priority 10) — the real controls. Uses:
   - **`useSetting`** (lines 173, 176) — deprecated since WP 6.5 in favor of `useSettings` (plural, array signature).
   - **Experimental imports** (lines 10–21): `__experimentalSpacingSizesControl`, `__experimentalBorderRadiusControl`, `__experimentalToolsPanel`, `__experimentalToolsPanelItem`, plus `BorderBoxControl`/`BoxControl` variants elsewhere in `variation/components/`.
   - `.eslintrc.js` disables `@wordpress/no-unsafe-wp-apis` globally to permit all of the above.

## Proposed changes

### 1. Replace the inspector DOM-poking

The intent: when the Priority+ variation is active, `overlayMenu: 'always'` is unsupported (the render filter bails on it, `class-block-renderer.php:93`). Options, in order of preference:

- **Normalize instead of disable.** Delete the HOC. Keep (and rely on) the existing effect in `withPriorityPlusControls` that flips `always` → `mobile`, and surface a `Notice` in the inspector explaining why. Server-side, `is_priority_nav_enabled()` already treats `always` as disabled, so the invariant holds even if the attribute slips through. Zero private-API surface.
- Alternatively, filter core's control via supported block-filter APIs — but core exposes no filter for the overlay control's options, which is precisely why the DOM hack exists. Don't chase this; normalization is the supported answer.

### 2. Migrate `useSetting` → `useSettings`

```js
// before
const spacingSizes = useSetting( 'spacing.spacingSizes' ) || [];
const colors = useSetting( 'color.palette' ) || [];
// after
const [ spacingSizes = [], colors = [] ] = useSettings( 'spacing.spacingSizes', 'color.palette' );
```

Apply across `controls.js` and `variation/components/` (the dropdown-customizer modal also calls `useSetting` for typography presets).

### 3. Audit every `__experimental*` import

Produce a table in the PR: import → stable replacement or keep-with-justification. Known state as of Gutenberg 23.x / WP 6.8-6.9:

| Import | Status |
|---|---|
| `__experimentalToolsPanel` / `ToolsPanelItem` | Still experimental but ubiquitous in core block UIs; keep, justify. |
| `__experimentalSpacingSizesControl` | Still private/experimental (block-editor); keep or replace with `BoxControl` + preset units. |
| `__experimentalBorderRadiusControl` | Still experimental; `BorderBoxControl` graduated in `@wordpress/components` — verify each at implementation time against the pinned WP version. |

Then scope the eslint disable: remove the global `no-unsafe-wp-apis` off-switch and use per-line disables with the justification comment, so new unaudited experimental imports fail lint.

### 4. Consolidate the HOCs

After change 1 deletes `addDisableAlwaysOption`, a single HOC remains — fold its early-return guards so non-variation navigation blocks pay one cheap check.

### 5. Small hygiene items

- `more-button-preview.js` reads nav-item fonts via `getComputedStyle` on editor DOM — acceptable for a preview, but add a defensive fallback for when the selector misses (editor markup drift).
- The typography-mirroring effect (copying core typography attrs into `priorityPlusTypography*`) should be checked for infinite-loop guards (`useEffect` deps) during this pass.

## Risks

- Removing the greyed-out "Always" option changes editor UX slightly (option selectable but auto-normalized + Notice). Call it out in the changelog; behavior on the frontend is unchanged.
- Experimental-API graduation status must be re-verified against the actual WP minimum at implementation time — the table above is a snapshot.

## Definition of done

- [ ] No `document.querySelector` targeting editor internals anywhere in `src/variation/`.
- [ ] No `useSetting` (singular) calls remain.
- [ ] `.eslintrc.js` no longer globally disables `no-unsafe-wp-apis`; remaining experimental imports each carry a per-line disable + justification.
- [ ] Variation controls render and persist correctly in the post editor and site editor (template part nav).
