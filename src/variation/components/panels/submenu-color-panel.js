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
 * SubmenuColorPanel Component
 *
 * Provides color controls for submenu styling (nested accordion items).
 * Colors always show their value (or default) and reset to defaults when cleared.
 *
 * @param {Object}   props               - Component props
 * @param {Object}   props.attributes    - Block attributes
 * @param {Function} props.setAttributes - Function to update attributes
 * @return {Element} Submenu color panel component
 */
export function SubmenuColorPanel({ attributes, setAttributes }) {
	const {
		priorityPlusSubmenuBackgroundColor,
		priorityPlusSubmenuItemHoverBackground,
		priorityPlusSubmenuItemTextColor,
		priorityPlusSubmenuItemHoverTextColor,
	} = attributes;

	return (
		<PanelColorSettings
			title={__(
				'Priority Plus Submenu Colors',
				'priority-plus-navigation'
			)}
			colorSettings={[
				{
					label: __('Background Color', 'priority-plus-navigation'),
					value:
						priorityPlusSubmenuBackgroundColor ||
						tokens.dropdown.submenu.backgroundColor,
					onChange: (color) =>
						setAttributes({
							priorityPlusSubmenuBackgroundColor:
								color ||
								tokens.dropdown.submenu.backgroundColor,
						}),
					enableAlpha: true,
				},
				{
					label: __(
						'Item Hover Background',
						'priority-plus-navigation'
					),
					value:
						priorityPlusSubmenuItemHoverBackground ||
						tokens.dropdown.submenu.itemHoverBackground,
					onChange: (color) =>
						setAttributes({
							priorityPlusSubmenuItemHoverBackground:
								color ||
								tokens.dropdown.submenu.itemHoverBackground,
						}),
					enableAlpha: true,
				},
				{
					label: __('Item Text Color', 'priority-plus-navigation'),
					value:
						priorityPlusSubmenuItemTextColor ||
						tokens.dropdown.submenu.itemTextColor,
					onChange: (color) =>
						setAttributes({
							priorityPlusSubmenuItemTextColor:
								color || tokens.dropdown.submenu.itemTextColor,
						}),
					enableAlpha: true,
				},
				{
					label: __(
						'Item Hover Text Color',
						'priority-plus-navigation'
					),
					value:
						priorityPlusSubmenuItemHoverTextColor ||
						tokens.dropdown.submenu.itemHoverTextColor,
					onChange: (color) =>
						setAttributes({
							priorityPlusSubmenuItemHoverTextColor:
								color ||
								tokens.dropdown.submenu.itemHoverTextColor,
						}),
					enableAlpha: true,
				},
			]}
		/>
	);
}
