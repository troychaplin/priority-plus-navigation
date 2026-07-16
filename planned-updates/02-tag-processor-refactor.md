# 02 — Replace Regex HTML Rewriting with WP_HTML_Tag_Processor

| | |
|---|---|
| **Priority** | High |
| **Effort** | 2–3 days |
| **Release** | v1.2 (non-breaking) |
| **Depends on** | — |
| **Prerequisite for** | 05 (directive injection), 06 (server-rendered dropdown) |

## Current state

`classes/class-block-renderer.php` modifies the rendered `core/navigation` output with regular expressions:

- `inject_priority_attributes()` (line 193) builds a `<nav …>` match pattern, **strips any existing `style` attribute** with `preg_replace` (line 220), and appends `data-more-label`, `data-more-icon`, `data-overlay-menu`, `data-mobile-collapse`, and a rebuilt `style` attribute via a second `preg_replace` (line 222).
- `preserve_existing_styles()` (line 254) regex-extracts the current inline style (`preg_match` at line 255) so WP-generated nav styles survive the strip-and-rebuild.

Regex HTML manipulation is fragile against attribute ordering, quoting variants, entities in attribute values, and markup changes from core or other `render_block` filters running earlier. WordPress core stopped doing this: `core/navigation` itself injects its Interactivity directives into saved markup with `WP_HTML_Tag_Processor` (see `block_core_navigation_add_directives_to_submenu()` in Gutenberg's `packages/block-library/src/navigation/index.php` — `next_tag()` / `get_attribute()` / `set_attribute()` / `get_updated_html()`).

## Proposed change

Rewrite the injection layer of `Block_Renderer` on `WP_HTML_Tag_Processor` (available since WP 6.2 — safe for the v1.2 minimum):

```php
private function inject_priority_attributes( string $block_content, array $attributes ): string {
    $processor = new WP_HTML_Tag_Processor( $block_content );

    if ( ! $processor->next_tag( array( 'tag_name' => 'NAV' ) ) ) {
        return $block_content;
    }

    $processor->set_attribute( 'data-more-label', $attributes['more_label'] );
    $processor->set_attribute( 'data-overlay-menu', $attributes['overlay_menu'] );
    // … remaining data attributes …

    $existing_style = (string) $processor->get_attribute( 'style' );
    $processor->set_attribute( 'style', $this->merge_styles( $existing_style, $attributes ) );

    return $processor->get_updated_html();
}
```

Notes:

- `preserve_existing_styles()` collapses into a `get_attribute( 'style' )` read — no regex extraction, no strip-and-re-add. The style merge logic (`build_style_parts()`, `add_toggle_styles()`, `add_menu_styles()`) keeps producing the same CSS custom-property strings.
- **`CSS_Converter` is untouched.** It converts values (presets, borders, padding), not markup.
- Optionally scope the `next_tag` to the nav carrying `wp-block-navigation` via `class_name` matching, mirroring the current regex's intent; in practice the first `<nav>` of a `core/navigation` render is the block wrapper.
- No behavior change is intended: same attributes, same style string, same class contract.

## Parity requirement (the real work)

The swap must be provably output-identical, modulo attribute ordering. Build a PHPUnit data provider (lands in the doc 09 test suite) covering:

- nav with / without an existing `style` attribute (WP emits one when the nav has layout/colors)
- each attribute family present and absent: toggle colors, hover colors, padding (flat + per-side), border (flat + per-side), radius (string + per-corner), dropdown styling set, submenu colors
- `overlayMenu` values `never` / `mobile` / `always` (the `always` case must still short-circuit in `is_priority_nav_enabled()`, line 93)
- preset values (`var:preset|spacing|30`) passing through `CSS_Converter::convert_preset_value()`
- markup quirks: single-quoted attributes, entities in `aria-label`, another filter having already added attributes to the nav

Snapshot the regex implementation's output for the matrix **before** the refactor, then assert the Tag Processor implementation matches (normalizing attribute order).

## Risks

- Subtle output diffs where the regex silently tolerated malformed input — the snapshot matrix is the mitigation; treat any diff as a decision point, not an auto-accept.
- `WP_HTML_Tag_Processor::set_attribute()` escapes values; the regex path built raw strings. Verify style strings containing `var()` and semicolons round-trip identically.

## Definition of done

- [ ] No `preg_match` / `preg_replace` remains in `class-block-renderer.php`.
- [ ] Snapshot parity suite green across the attribute matrix.
- [ ] `docs/architecture.md` render-pipeline section updated.
