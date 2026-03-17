/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockVariation } from '@wordpress/blocks';
import { plusCircle } from '@wordpress/icons';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { tokens } from '../tokens';

/**
 * Register Priority Plus Navigation block variation
 */
registerBlockVariation('core/navigation', {
	name: 'priority-plus-navigation',
	title: __('Priority Plus Navigation', 'priority-plus-navigation'),
	description: __(
		'A responsive navigation that automatically moves overflow items to a "More" dropdown.',
		'priority-plus-navigation'
	),
	icon: plusCircle,
	scope: ['inserter', 'transform'],
	attributes: {
		className: 'is-style-priority-plus-navigation',
		overlayMenu: 'never',
		priorityPlusEnabled: true,
		priorityPlusToggleLabel: 'More',
		priorityPlusToggleBackgroundColor: undefined,
		priorityPlusToggleBackgroundColorHover: undefined,
		priorityPlusToggleTextColor: undefined,
		priorityPlusToggleTextColorHover: undefined,
	},
	isActive: (blockAttributes, variationAttributes) => {
		return blockAttributes.className?.includes(
			variationAttributes.className
		);
	},
});

/**
 * Add Priority+ attributes to core/navigation block
 */
addFilter(
	'blocks.registerBlockType',
	'priority-plus-navigation/extend-core-navigation',
	(settings, name) => {
		if (name !== 'core/navigation') {
			return settings;
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				// Priority+ enabled flag
				priorityPlusEnabled: {
					type: 'boolean',
					default: false,
				},
				// Toggle button settings (the "More" button)
				priorityPlusToggleLabel: {
					type: 'string',
					default: 'More',
				},
				priorityPlusToggleIcon: {
					type: 'string',
					default: 'none',
				},
				priorityPlusToggleBackgroundColor: {
					type: 'string',
				},
				priorityPlusToggleBackgroundColorHover: {
					type: 'string',
				},
				priorityPlusToggleTextColor: {
					type: 'string',
				},
				priorityPlusToggleTextColorHover: {
					type: 'string',
				},
				priorityPlusTogglePadding: {
					type: 'object',
					default: undefined,
				},
				priorityPlusToggleBorder: {
					type: 'object',
					default: undefined,
				},
				priorityPlusToggleBorderRadius: {
					type: ['string', 'object'],
					default: undefined,
				},
				// Menu style attributes (the dropdown menu)
				priorityPlusMenuBackgroundColor: {
					type: 'string',
					default: tokens.dropdown.backgroundColor,
				},
				priorityPlusMenuBorder: {
					type: 'object',
					default: tokens.dropdown.border,
				},
				priorityPlusMenuBorderRadius: {
					type: ['string', 'object'],
					default: tokens.dropdown.borderRadius,
				},
				priorityPlusMenuBoxShadow: {
					type: 'string',
					default: tokens.dropdown.boxShadow,
				},
				priorityPlusMenuItemPadding: {
					type: 'object',
					default: tokens.dropdown.item.padding,
				},
				priorityPlusMenuItemHoverBackground: {
					type: 'string',
					default: tokens.dropdown.item.hoverBackground,
				},
				priorityPlusMenuItemTextColor: {
					type: 'string',
					default: tokens.dropdown.item.textColor,
				},
				priorityPlusMenuItemHoverTextColor: {
					type: 'string',
					default: tokens.dropdown.item.hoverTextColor,
				},
				priorityPlusMenuSubmenuIndent: {
					type: 'string',
					default: tokens.dropdown.submenu.indent,
				},
				priorityPlusMenuItemSeparator: {
					type: 'object',
					default: tokens.dropdown.item.separator,
				},
				// Submenu color attributes
				priorityPlusSubmenuBackgroundColor: {
					type: 'string',
					default: tokens.dropdown.submenu.backgroundColor,
				},
				priorityPlusSubmenuItemHoverBackground: {
					type: 'string',
					default: tokens.dropdown.submenu.itemHoverBackground,
				},
				priorityPlusSubmenuItemTextColor: {
					type: 'string',
					default: tokens.dropdown.submenu.itemTextColor,
				},
				priorityPlusSubmenuItemHoverTextColor: {
					type: 'string',
					default: tokens.dropdown.submenu.itemHoverTextColor,
				},
				// Mobile collapse - collapse all items into More button at mobile breakpoint
				priorityPlusMobileCollapse: {
					type: 'boolean',
					default: true,
				},
				// Typography attributes (for preview)
				priorityPlusTypographyFontFamily: {
					type: 'string',
				},
				priorityPlusTypographyFontSize: {
					type: 'string',
				},
				priorityPlusTypographyFontWeight: {
					type: 'string',
				},
				priorityPlusTypographyFontStyle: {
					type: 'string',
				},
			},
		};
	}
);
