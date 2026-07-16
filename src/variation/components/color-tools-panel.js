/**
 * WordPress dependencies
 */
import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- ToolsPanel has no stable export yet; ubiquitous in core block UIs.
	__experimentalToolsPanel as ToolsPanel,
} from '@wordpress/components';

/**
 * ColorToolsPanel Component
 *
 * Replicates the private `ColorToolsPanel` wrapper that core uses for every
 * block's "Color" panel (see Gutenberg's
 * packages/block-editor/src/components/global-styles/color-panel.js — it is
 * not exported from @wordpress/block-editor, so it is reproduced here from
 * public ToolsPanel props). The `hasInnerWrapper` + inner wrapper div +
 * first/last item classes are what give core's color panels their contiguous
 * bordered-group appearance: the inner wrapper's row gap is zeroed by core's
 * `.color-block-support-panel__inner-wrapper` stylesheet rule, and the
 * first/last classes round the outer corners of the item group.
 *
 * @param {Object}   props          - Component props.
 * @param {string}   props.label    - Panel heading.
 * @param {Function} props.resetAll - Callback for the panel's "Reset all".
 * @param {Element}  props.children - Panel contents (color dropdown items).
 * @return {Element} Color tools panel component.
 */
export function ColorToolsPanel({ label, resetAll, children }) {
	return (
		<ToolsPanel
			label={label}
			resetAll={resetAll}
			hasInnerWrapper
			className="color-block-support-panel"
			__experimentalFirstVisibleItemClass="first"
			__experimentalLastVisibleItemClass="last"
		>
			<div className="color-block-support-panel__inner-wrapper">
				{children}
			</div>
		</ToolsPanel>
	);
}
