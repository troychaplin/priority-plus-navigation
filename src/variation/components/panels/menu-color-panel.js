/**
 * WordPress dependencies
 */
import { PanelColorSettings } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { tokens } from '../../../tokens';

/**
 * ColorPanel Component
 *
 * Provides color controls for menu styling.
 * Colors always show their value (or default) and reset to defaults when cleared.
 *
 * @param {Object}   props               - Component props
 * @param {Object}   props.attributes    - Block attributes
 * @param {Function} props.setAttributes - Function to update attributes
 * @return {Element} Color panel component
 */
export function ColorPanel({ attributes, setAttributes }) {
	const {
		priorityPlusMenuBackgroundColor,
		priorityPlusMenuItemHoverBackground,
		priorityPlusMenuItemTextColor,
		priorityPlusMenuItemHoverTextColor,
	} = attributes;

	return (
		<PanelColorSettings
			title={__('Priority Plus Menu Colors', 'priority-plus-navigation')}
			colorSettings={[
				{
					label: __('Background Color', 'priority-plus-navigation'),
					value:
						priorityPlusMenuBackgroundColor ||
						tokens.dropdown.backgroundColor,
					onChange: (color) =>
						setAttributes({
							priorityPlusMenuBackgroundColor:
								color || tokens.dropdown.backgroundColor,
						}),
					enableAlpha: true,
				},
				{
					label: __(
						'Item Hover Background',
						'priority-plus-navigation'
					),
					value:
						priorityPlusMenuItemHoverBackground ||
						tokens.dropdown.item.hoverBackground,
					onChange: (color) =>
						setAttributes({
							priorityPlusMenuItemHoverBackground:
								color || tokens.dropdown.item.hoverBackground,
						}),
					enableAlpha: true,
				},
				{
					label: __('Item Text Color', 'priority-plus-navigation'),
					value:
						priorityPlusMenuItemTextColor ||
						tokens.dropdown.item.textColor,
					onChange: (color) =>
						setAttributes({
							priorityPlusMenuItemTextColor:
								color || tokens.dropdown.item.textColor,
						}),
					enableAlpha: true,
				},
				{
					label: __(
						'Item Hover Text Color',
						'priority-plus-navigation'
					),
					value:
						priorityPlusMenuItemHoverTextColor ||
						tokens.dropdown.item.hoverTextColor,
					onChange: (color) =>
						setAttributes({
							priorityPlusMenuItemHoverTextColor:
								color || tokens.dropdown.item.hoverTextColor,
						}),
					enableAlpha: true,
				},
			]}
		/>
	);
}
