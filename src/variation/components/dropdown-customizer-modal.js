/**
 * WordPress dependencies
 */
import { Modal, Button } from '@wordpress/components';
import { useSettings } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './modal.scss';
import { DropdownPreview } from './dropdown-preview';
import { ColorPanel } from './panels/menu-color-panel';
import { SubmenuColorPanel } from './panels/submenu-color-panel';
import { MenuStylesPanel } from './panels/menu-styles-panel';
import { MenuItemsPanel } from './panels/menu-items-panel';
import { tokens } from '../../tokens';

export function DropdownCustomizerModal({
	attributes,
	setAttributes,
	onClose,
}) {
	// Get typography and spacing settings from theme to convert slugs to values
	const [fontSizes = [], fontFamilies = [], spacingSizes = []] = useSettings(
		'typography.fontSizes',
		'typography.fontFamilies',
		'spacing.spacingSizes'
	);

	// Convert typography slugs to actual CSS values
	const typographyStyles = {};

	// Convert fontFamily slug to actual font-family value
	if (attributes.priorityPlusTypographyFontFamily) {
		// Handle different fontFamilies structures
		let allFontFamilies = [];

		// Handle object structure with theme/custom properties
		if (
			fontFamilies &&
			typeof fontFamilies === 'object' &&
			!Array.isArray(fontFamilies)
		) {
			if (fontFamilies.theme && Array.isArray(fontFamilies.theme)) {
				allFontFamilies = allFontFamilies.concat(fontFamilies.theme);
			}
			if (fontFamilies.custom && Array.isArray(fontFamilies.custom)) {
				allFontFamilies = allFontFamilies.concat(fontFamilies.custom);
			}
		}
		// Handle flat array structure
		else if (Array.isArray(fontFamilies)) {
			fontFamilies.forEach((item) => {
				if (item.fontFamilies && Array.isArray(item.fontFamilies)) {
					allFontFamilies = allFontFamilies.concat(item.fontFamilies);
				} else if (item.slug && item.fontFamily) {
					allFontFamilies.push(item);
				}
			});
		}

		const fontFamilyPreset = allFontFamilies.find(
			(font) => font.slug === attributes.priorityPlusTypographyFontFamily
		);

		if (fontFamilyPreset) {
			typographyStyles.fontFamily = fontFamilyPreset.fontFamily;
		}
	}

	// Convert fontSize slug to actual font-size value
	if (attributes.priorityPlusTypographyFontSize) {
		// Handle different fontSize structures
		let allFontSizes = [];
		if (Array.isArray(fontSizes)) {
			fontSizes.forEach((item) => {
				if (item.sizes && Array.isArray(item.sizes)) {
					allFontSizes = allFontSizes.concat(item.sizes);
				} else if (item.slug && item.size) {
					allFontSizes.push(item);
				}
			});
		}

		const fontSizePreset = allFontSizes.find(
			(size) => size.slug === attributes.priorityPlusTypographyFontSize
		);
		if (fontSizePreset) {
			typographyStyles.fontSize = fontSizePreset.size;
		}
	}

	// Use direct values from style object for fontWeight and fontStyle
	if (attributes.priorityPlusTypographyFontWeight) {
		typographyStyles.fontWeight =
			attributes.priorityPlusTypographyFontWeight;
	}
	if (attributes.priorityPlusTypographyFontStyle) {
		typographyStyles.fontStyle = attributes.priorityPlusTypographyFontStyle;
	}

	// Reset all menu styles to defaults
	const resetAllToDefaults = () => {
		setAttributes({
			priorityPlusMenuBackgroundColor: tokens.dropdown.backgroundColor,
			priorityPlusMenuBorder: tokens.dropdown.border,
			priorityPlusMenuBorderRadius: tokens.dropdown.borderRadius,
			priorityPlusMenuBoxShadow: tokens.dropdown.boxShadow,
			priorityPlusMenuItemPadding: tokens.dropdown.item.padding,
			priorityPlusMenuItemHoverBackground:
				tokens.dropdown.item.hoverBackground,
			priorityPlusMenuItemTextColor: tokens.dropdown.item.textColor,
			priorityPlusMenuItemHoverTextColor:
				tokens.dropdown.item.hoverTextColor,
			priorityPlusMenuSubmenuIndent: {
				left: tokens.dropdown.submenu.indent,
			},
			priorityPlusMenuItemSeparator: tokens.dropdown.item.separator,
			priorityPlusSubmenuBackgroundColor:
				tokens.dropdown.submenu.backgroundColor,
			priorityPlusSubmenuItemHoverBackground:
				tokens.dropdown.submenu.itemHoverBackground,
			priorityPlusSubmenuItemTextColor:
				tokens.dropdown.submenu.itemTextColor,
			priorityPlusSubmenuItemHoverTextColor:
				tokens.dropdown.submenu.itemHoverTextColor,
		});
	};

	return (
		<Modal
			title={__(
				'Customize Priority Plus Menu',
				'priority-plus-navigation'
			)}
			onRequestClose={onClose}
			className="priority-plus-dropdown-customizer"
			size="large"
			isDismissible={true}
		>
			<div className="dropdown-customizer-layout">
				<div className="dropdown-customizer-controls">
					<ColorPanel
						attributes={attributes}
						setAttributes={setAttributes}
					/>
					<MenuStylesPanel
						attributes={attributes}
						setAttributes={setAttributes}
					/>
					<SubmenuColorPanel
						attributes={attributes}
						setAttributes={setAttributes}
					/>
					<MenuItemsPanel
						attributes={attributes}
						setAttributes={setAttributes}
						spacingSizes={spacingSizes}
					/>
				</div>
				<div className="dropdown-customizer-preview">
					<DropdownPreview
						attributes={attributes}
						typographyStyles={typographyStyles}
					/>
				</div>
			</div>

			<div className="dropdown-customizer-footer">
				<Button
					variant="tertiary"
					isDestructive
					onClick={resetAllToDefaults}
				>
					{__('Reset to Defaults', 'priority-plus-navigation')}
				</Button>

				<Button variant="primary" onClick={onClose}>
					{__('Done', 'priority-plus-navigation')}
				</Button>
			</div>
		</Modal>
	);
}
