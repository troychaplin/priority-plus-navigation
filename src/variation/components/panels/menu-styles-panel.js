/**
 * WordPress dependencies
 */
import {
	ComboboxControl,
	BorderBoxControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import {
	useSettings,
	__experimentalBorderRadiusControl as BorderRadiusControl,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { tokens } from '../../../tokens';

/**
 * Check if border has a value (handles both flat and per-side formats)
 *
 * @param {Object} border - The border value (flat or per-side)
 * @return {boolean} Whether border has a value
 */
function hasBorderBoxValue(border) {
	if (!border) {
		return false;
	}

	// Check for flat border format (color, width, style at top level)
	if (border.color || border.width || border.style) {
		return true;
	}

	// Check for per-side format (top, right, bottom, left)
	const sides = ['top', 'right', 'bottom', 'left'];
	return sides.some((side) => {
		const sideBorder = border[side];
		return (
			sideBorder &&
			(sideBorder.color || sideBorder.width || sideBorder.style)
		);
	});
}

/**
 * Check if border radius has a value (handles both string and object formats)
 *
 * @param {string|Object} borderRadius - The border radius value
 * @return {boolean} Whether border radius has a value
 */
function hasBorderRadiusValue(borderRadius) {
	if (!borderRadius) {
		return false;
	}
	// Handle string format (e.g., '4px')
	if (typeof borderRadius === 'string') {
		return borderRadius !== '';
	}
	// Handle object format (per-corner values)
	if (typeof borderRadius === 'object') {
		return Object.values(borderRadius).some(
			(value) => value && value !== ''
		);
	}
	return false;
}

/**
 * ShadowPresetPicker Component
 *
 * A combobox picker for selecting shadow presets from the theme.
 * Falls back to a "None" option and a default shadow if no theme presets exist.
 *
 * @param {Object}   props          - Component props
 * @param {string}   props.value    - Current shadow value
 * @param {Function} props.onChange - Callback when shadow changes
 * @return {Element} Shadow preset picker component
 */
function ShadowPresetPicker({ value, onChange }) {
	// Get shadow presets from theme settings
	const [themeShadowsRaw, defaultShadowsRaw] = useSettings(
		'shadow.presets.theme',
		'shadow.presets.default'
	);

	// Build options for ComboboxControl (requires value/label format)
	const shadowOptions = useMemo(() => {
		const themeShadows = themeShadowsRaw || [];
		const defaultShadows = defaultShadowsRaw || [];

		const options = [
			{
				value: 'none',
				label: __('None', 'priority-plus-navigation'),
			},
			{
				value: tokens.dropdown.boxShadow,
				label: __('Default', 'priority-plus-navigation'),
			},
		];

		// Add theme shadows first (they take priority)
		if (themeShadows.length > 0) {
			themeShadows.forEach((preset) => {
				options.push({
					value: preset.shadow,
					label: preset.name,
				});
			});
		}

		// Add default WordPress shadows
		if (defaultShadows.length > 0) {
			defaultShadows.forEach((preset) => {
				options.push({
					value: preset.shadow,
					label: preset.name,
				});
			});
		}

		return options;
	}, [themeShadowsRaw, defaultShadowsRaw]);

	// State for filtering options
	const [filteredOptions, setFilteredOptions] = useState(shadowOptions);

	// Handle filter changes for search functionality
	const handleFilterChange = (inputValue) => {
		if (!inputValue) {
			setFilteredOptions(shadowOptions);
			return;
		}
		const lowerInput = inputValue.toLowerCase();
		setFilteredOptions(
			shadowOptions.filter((option) =>
				option.label.toLowerCase().includes(lowerInput)
			)
		);
	};

	// Handle selection - ComboboxControl passes the value directly
	const handleChange = (newValue) => {
		onChange(newValue);
	};

	return (
		<ComboboxControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={__('Shadow', 'priority-plus-navigation')}
			value={value}
			onChange={handleChange}
			options={filteredOptions}
			onFilterValueChange={handleFilterChange}
		/>
	);
}

/**
 * MenuStylesPanel Component
 *
 * Provides controls for menu container styles (border, radius, shadow).
 *
 * @param {Object}   props               - Component props
 * @param {Object}   props.attributes    - Block attributes
 * @param {Function} props.setAttributes - Function to update attributes
 * @return {Element} Menu styles panel component
 */
export function MenuStylesPanel({ attributes, setAttributes }) {
	const {
		priorityPlusMenuBorder,
		priorityPlusMenuBorderRadius,
		priorityPlusMenuBoxShadow,
	} = attributes;

	// Get color palette from theme settings
	const [colors = []] = useSettings('color.palette');

	return (
		<ToolsPanel
			label={__('Priority Plus Menu Styles', 'priority-plus-navigation')}
			resetAll={() => {
				setAttributes({
					priorityPlusMenuBorder: tokens.dropdown.border,
					priorityPlusMenuBorderRadius: tokens.dropdown.borderRadius,
					priorityPlusMenuBoxShadow: tokens.dropdown.boxShadow,
				});
			}}
		>
			{/* Border */}
			<ToolsPanelItem
				hasValue={() => hasBorderBoxValue(priorityPlusMenuBorder)}
				label={__('Menu Border', 'priority-plus-navigation')}
				onDeselect={() =>
					setAttributes({
						priorityPlusMenuBorder: tokens.dropdown.border,
					})
				}
				isShownByDefault
			>
				<BorderBoxControl
					label={__('Border', 'priority-plus-navigation')}
					colors={colors}
					value={priorityPlusMenuBorder}
					onChange={(newBorder) =>
						setAttributes({ priorityPlusMenuBorder: newBorder })
					}
					enableAlpha={true}
					enableStyle={true}
					size="__unstable-large"
				/>
			</ToolsPanelItem>

			{/* Border Radius */}
			<ToolsPanelItem
				hasValue={() =>
					hasBorderRadiusValue(priorityPlusMenuBorderRadius)
				}
				label={__('Border Radius', 'priority-plus-navigation')}
				onDeselect={() =>
					setAttributes({
						priorityPlusMenuBorderRadius:
							tokens.dropdown.borderRadius,
					})
				}
				isShownByDefault
			>
				<BorderRadiusControl
					label={__('Border Radius', 'priority-plus-navigation')}
					values={priorityPlusMenuBorderRadius}
					onChange={(value) =>
						setAttributes({ priorityPlusMenuBorderRadius: value })
					}
				/>
			</ToolsPanelItem>

			{/* Box Shadow */}
			<ToolsPanelItem
				hasValue={() => !!priorityPlusMenuBoxShadow}
				label={__('Shadow', 'priority-plus-navigation')}
				onDeselect={() =>
					setAttributes({
						priorityPlusMenuBoxShadow: tokens.dropdown.boxShadow,
					})
				}
				isShownByDefault
			>
				<ShadowPresetPicker
					value={
						priorityPlusMenuBoxShadow || tokens.dropdown.boxShadow
					}
					onChange={(value) =>
						setAttributes({ priorityPlusMenuBoxShadow: value })
					}
				/>
			</ToolsPanelItem>
		</ToolsPanel>
	);
}
