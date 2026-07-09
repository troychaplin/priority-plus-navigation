# 04 — Single Source of Truth for Design Tokens

| | |
|---|---|
| **Priority** | Medium |
| **Effort** | ~2 days |
| **Release** | v2.0 (can ship earlier — it's non-breaking — but pairs naturally with 05/06) |
| **Depends on** | — |
| **Consumed by** | 06 (server-rendered dropdown reads PHP tokens) |

## Current state: the same defaults live in three places

1. **`src/tokens.js`** — the JS "source of truth" feeding attribute defaults in `src/variation/block.js`, reset values in `src/variation/controls.js`, and the dropdown-customizer modal.
2. **Hard-coded PHP** in `classes/class-block-renderer.php` — e.g. the separator defaults `#dddddd / 1px / solid` around line 498 and the always-emitted submenu-color fallbacks (lines 528–540), plus `CSS_Converter::BORDER_DEFAULTS` duplicating the same `#dddddd / 1px / solid`.
3. **SCSS fallbacks** in `src/styles/_variables.scss` — `:root` defaults for the `--wp--custom--priority-plus-navigation--dropdown--*` properties and `.is-style-priority-plus-navigation` defaults for the toggle properties.

Any default change requires three coordinated edits, and drift has already happened (the readme's "Browse" vs. the code's "More" — doc 01 — is the visible symptom of no single source).

## Proposed change

Promote a canonical **`src/tokens.json`** and generate the other consumers at build time:

```
src/tokens.json  ──┬──> src/tokens.js            (thin re-export: import tokens from './tokens.json')
                   ├──> build/tokens.php          (generated: <?php return array( … );)
                   └──> src/styles/_tokens.scss   (generated SCSS map / custom-property defaults)
```

- **JS**: webpack imports JSON natively — `tokens.js` becomes `import tokens from './tokens.json'; export default tokens;` (or consumers import the JSON directly and `tokens.js` is deleted).
- **PHP**: a small Node script (invoked from the `build`/`start` npm scripts, alongside the existing webpack run) emits `build/tokens.php` as a returned array. `Block_Renderer` and `CSS_Converter` `include` it once (memoized in `Plugin_Paths` or a static) and read defaults from it instead of inline literals. Keep the generated file out of git but **in the plugin zip** (`npm run plugin-zip` already ships `build/`).
- **SCSS**: the same script emits `_tokens.scss` (custom-property declarations or an SCSS map) that `_variables.scss` imports; hand-written fallback blocks are deleted.
- Token shape stays what `tokens.js` already defines (`toggle`, `dropdown.item`, `dropdown.submenu` groups) — this is a plumbing change, not a redesign.

### Alternative considered and rejected

Reading defaults from server-registered block attributes (see doc 09) would cover PHP but not SCSS, and attribute defaults themselves need a source — the JSON file is upstream of both.

## Constraints

- **Do not rename any emitted CSS custom property.** The property names are a public theming contract (see README risks). This doc changes where defaults come from, not what they're called.
- Generated files must be reproducible: the generator runs in `build` and `start`, and CI (doc 09) fails if `build/tokens.php` is stale relative to `tokens.json`.
- Doc 06's server-rendered dropdown must take its default labels/values from `build/tokens.php` — flag this in its implementation, not fresh literals.

## Definition of done

- [ ] `grep -rn '#dddddd' classes/` returns nothing; all PHP defaults come from the generated file.
- [ ] `_variables.scss` contains no hand-maintained default values duplicated from tokens.
- [ ] Changing one value in `tokens.json` and rebuilding updates editor defaults, frontend inline styles, and SCSS fallbacks together (manual spot check + one automated test in the doc 09 suite).
- [ ] `docs/styling.md` updated to point at `tokens.json` as the source of truth.
