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

	const colorGradientSettings = useMultipleOriginColorsAndGradients();

	return (
		<ColorToolsPanel
			label={__('Priority Plus Menu Colors', 'priority-plus-navigation')}
			resetAll={() =>
				setAttributes({
					priorityPlusMenuBackgroundColor:
						tokens.dropdown.backgroundColor,
					priorityPlusMenuItemHoverBackground:
						tokens.dropdown.item.hoverBackground,
					priorityPlusMenuItemTextColor:
						tokens.dropdown.item.textColor,
					priorityPlusMenuItemHoverTextColor:
						tokens.dropdown.item.hoverTextColor,
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
							priorityPlusMenuBackgroundColor ||
							tokens.dropdown.backgroundColor,
						onColorChange: (color) =>
							setAttributes({
								priorityPlusMenuBackgroundColor:
									color || tokens.dropdown.backgroundColor,
							}),
						resetAllFilter: () =>
							setAttributes({
								priorityPlusMenuBackgroundColor:
									tokens.dropdown.backgroundColor,
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
							priorityPlusMenuItemHoverBackground ||
							tokens.dropdown.item.hoverBackground,
						onColorChange: (color) =>
							setAttributes({
								priorityPlusMenuItemHoverBackground:
									color ||
									tokens.dropdown.item.hoverBackground,
							}),
						resetAllFilter: () =>
							setAttributes({
								priorityPlusMenuItemHoverBackground:
									tokens.dropdown.item.hoverBackground,
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
							priorityPlusMenuItemTextColor ||
							tokens.dropdown.item.textColor,
						onColorChange: (color) =>
							setAttributes({
								priorityPlusMenuItemTextColor:
									color || tokens.dropdown.item.textColor,
							}),
						resetAllFilter: () =>
							setAttributes({
								priorityPlusMenuItemTextColor:
									tokens.dropdown.item.textColor,
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
							priorityPlusMenuItemHoverTextColor ||
							tokens.dropdown.item.hoverTextColor,
						onColorChange: (color) =>
							setAttributes({
								priorityPlusMenuItemHoverTextColor:
									color ||
									tokens.dropdown.item.hoverTextColor,
							}),
						resetAllFilter: () =>
							setAttributes({
								priorityPlusMenuItemHoverTextColor:
									tokens.dropdown.item.hoverTextColor,
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
