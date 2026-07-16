# 01 — Platform Baseline: Requirements, Metadata, and Tooling

| | |
|---|---|
| **Priority** | High |
| **Effort** | 0.5–1 day |
| **Release** | readme.txt fixes: v1.2 · version bumps: v2.0 |
| **Depends on** | — (gates docs 03.2, 05, 06) |

## Current state

- `priority-plus-navigation.php:7-8` declares `Requires at least: 6.0` and `Requires PHP: 7.4`.
- The bootstrap (`priority-plus-navigation.php:26-29`) calls `wp_trigger_error()`, which **only exists since WP 6.4** — the declared 6.0 minimum is already inaccurate. On WP 6.0–6.3 with a missing autoloader this would fatal on an undefined function instead of surfacing the intended error.
- `readme.txt` is **missing both** the `Requires at least:` and `Requires PHP:` headers entirely; the WP.org directory falls back to the plugin header, but the readme is the canonical source and should carry them.
- `readme.txt` FAQ/description claims the default More-button label is **"Browse"**, but the actual default is **"More"** (`src/config.js:7`, `src/variation/block.js` attribute default, `classes/class-block-renderer.php` `collect_attributes()`). Documentation and code have drifted.
- `package.json` pins `@wordpress/scripts ^31.6.0`; current is 32.x. Module builds (needed for doc 03 part 2) require the `--experimental-modules` flag even on 32.x.
- `Tested up to: 7.0` — verify against the actual latest WP release at each ship date.

## Proposed changes

### v1.2 (non-breaking)

1. Add `Requires at least:` and `Requires PHP:` headers to `readme.txt`, matching the plugin header.
2. Correct the declared WP minimum to **6.4** (honest floor given `wp_trigger_error`), or guard the call with `function_exists()` if 6.0 support genuinely matters. Recommendation: declare 6.4 — WP 6.0 is long past its support window.
3. Fix the "Browse" vs "More" drift. Decide the canonical default (recommendation: **"More"**, matching the code and the common Priority+ convention) and align readme.txt FAQ, description, and any screenshots.
4. Upgrade `@wordpress/scripts` to ^32.x. This is a dev-dependency change with no runtime impact; run the full lint/build/format suite after upgrading and fix any new lint findings.

### v2.0 (breaking)

5. Bump to **`Requires at least: 6.8`** and **`Requires PHP: 8.0`**:
   - The Interactivity API and Script Modules API ship in WP 6.5, but current core patterns the migration copies (`withSyncEvent`, mature module registration, `wp_register_script_module` ergonomics) make 6.8 the honest floor. It also matches what current Gutenberg targets (Gutenberg 23.5 declares `Requires at least: 6.9`; 6.8 keeps one version of slack).
   - PHP 8.0 matches current ecosystem baselines; nothing in the codebase requires 7.4-only syntax. `WP_HTML_Tag_Processor` (doc 02) works on 7.4, so the PHP bump is policy, not necessity — it can be dropped to 7.4 if user data argues for it.
6. State the support policy in readme.txt: sites on WP 6.4–6.7 stay on the 1.x line; 1.x receives security fixes only after 2.0 ships.

## Version discipline going forward

- Plugin header `Version`, readme.txt `Stable tag`, and the `PRIORITY_PLUS_NAVIGATION_VERSION`-style constants (if introduced) must move together; the existing `bump changelog` / `release:` commit pattern should be documented in `CONTRIBUTING` or a release checklist here.
- Re-verify `Tested up to:` on every release.

## Acceptance criteria

- [ ] readme.txt carries `Requires at least`, `Requires PHP`, accurate `Tested up to`, and the corrected default-label copy.
- [ ] Plugin header and readme.txt agree.
- [ ] `npm run build && npm run lint:js && npm run lint:css && composer phpcs` pass on @wordpress/scripts 32.x.
- [ ] v2.0 readme includes the 1.x support-policy paragraph.
