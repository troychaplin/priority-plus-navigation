/**
 * WordPress dependencies
 */
import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- No stable equivalent; matches core's own navigation/edit color controls.
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- No stable equivalent; matches core's own navigation/edit color controls.
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ColorToolsPanel } from '../color-tools-panel';
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

	const colorGradientSettings = useMultipleOriginColorsAndGradients();

	return (
		<ColorToolsPanel
			label={__(
				'Priority Plus Submenu Colors',
				'priority-plus-navigation'
			)}
			resetAll={() =>
				setAttributes({
					priorityPlusSubmenuBackgroundColor:
						tokens.dropdown.submenu.backgroundColor,
					priorityPlusSubmenuItemHoverBackground:
						tokens.dropdown.submenu.itemHoverBackground,
					priorityPlusSubmenuItemTextColor:
						tokens.dropdown.submenu.itemTextColor,
					priorityPlusSubmenuItemHoverTextColor:
						tokens.dropdown.submenu.itemHoverTextColor,
				})
			}
		>
			<ColorGradientSettingsDropdown
				__experimentalIsRenderedInSidebar
				settings={[
					{
						label: __(
							'Background Color',
							'priority-plus-navigation'
						),
						colorValue:
							priorityPlusSubmenuBackgroundColor ||
							tokens.dropdown.submenu.backgroundColor,
						onColorChange: (color) =>
							setAttributes({
								priorityPlusSubmenuBackgroundColor:
									color ||
									tokens.dropdown.submenu.backgroundColor,
							}),
						resetAllFilter: () =>
							setAttributes({
								priorityPlusSubmenuBackgroundColor:
									tokens.dropdown.submenu.backgroundColor,
							}),
						enableAlpha: true,
						isShownByDefault: true,
					},
					{
						label: __(
							'Item Hover Background',
							'priority-plus-navigation'
						),
						colorValue:
							priorityPlusSubmenuItemHoverBackground ||
							tokens.dropdown.submenu.itemHoverBackground,
						onColorChange: (color) =>
							setAttributes({
								priorityPlusSubmenuItemHoverBackground:
									color ||
									tokens.dropdown.submenu.itemHoverBackground,
							}),
						resetAllFilter: () =>
							setAttributes({
								priorityPlusSubmenuItemHoverBackground:
									tokens.dropdown.submenu.itemHoverBackground,
							}),
						enableAlpha: true,
						isShownByDefault: true,
					},
					{
						label: __(
							'Item Text Color',
							'priority-plus-navigation'
						),
						colorValue:
							priorityPlusSubmenuItemTextColor ||
							tokens.dropdown.submenu.itemTextColor,
						onColorChange: (color) =>
							setAttributes({
								priorityPlusSubmenuItemTextColor:
									color ||
									tokens.dropdown.submenu.itemTextColor,
							}),
						resetAllFilter: () =>
							setAttributes({
								priorityPlusSubmenuItemTextColor:
									tokens.dropdown.submenu.itemTextColor,
							}),
						enableAlpha: true,
						isShownByDefault: true,
					},
					{
						label: __(
							'Item Hover Text Color',
							'priority-plus-navigation'
						),
						colorValue:
							priorityPlusSubmenuItemHoverTextColor ||
							tokens.dropdown.submenu.itemHoverTextColor,
						onColorChange: (color) =>
							setAttributes({
								priorityPlusSubmenuItemHoverTextColor:
									color ||
									tokens.dropdown.submenu.itemHoverTextColor,
							}),
						resetAllFilter: () =>
							setAttributes({
								priorityPlusSubmenuItemHoverTextColor:
									tokens.dropdown.submenu.itemHoverTextColor,
							}),
						enableAlpha: true,
						isShownByDefault: true,
					},
				]}
				{...colorGradientSettings}
				gradients={[]}
				disableCustomGradients
			/>
		</ColorToolsPanel>
	);
}
