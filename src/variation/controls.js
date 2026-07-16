/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

import {
	InspectorControls,
	useSettings,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- No stable equivalent exists yet; matches core block UIs.
	__experimentalSpacingSizesControl as SpacingSizesControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- No stable equivalent exists yet; matches core block UIs.
	__experimentalBorderRadiusControl as BorderRadiusControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- No stable equivalent; matches core's own navigation/edit color controls.
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- No stable equivalent; matches core's own navigation/edit color controls.
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from '@wordpress/block-editor';
import {
	TextControl,
	BoxControl,
	Notice,
	Button,
	ToggleControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	BorderBoxControl,
} from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect, useRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { MoreButtonPreview } from './components/more-button-preview';
import { DropdownCustomizerModal } from './components/dropdown-customizer-modal';
import { ColorToolsPanel } from './components/color-tools-panel';
import { tokens } from '../tokens';

/**
 * Add Inspector Controls to core/navigation block.
 *
 * The "Always" overlay option is intentionally left selectable in core's
 * control rather than disabled in the DOM: selecting it is normalized back
 * to "mobile" by an effect below, the inspector Notice explains why, and the
 * server-side renderer treats "always" as Priority+ disabled regardless.
 */
const withPriorityPlusControls = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name, attributes, setAttributes, clientId } = props;

		if (name !== 'core/navigation') {
			return <BlockEdit {...props} />;
		}

		// Only show controls if the Priority+ variation is active.
		// Check for the variation className or explicit priorityPlusEnabled attribute.
		const className = attributes.className || '';
		const isPriorityPlusVariation =
			className.includes('is-style-priority-plus-navigation') ||
			attributes.priorityPlusEnabled === true;

		// If not using the variation, return the block edit without our controls.
		if (!isPriorityPlusVariation) {
			return <BlockEdit {...props} />;
		}

		const {
			priorityPlusToggleLabel,
			priorityPlusToggleBackgroundColor,
			priorityPlusToggleBackgroundColorHover,
			priorityPlusToggleTextColor,
			priorityPlusToggleTextColorHover,
			priorityPlusTogglePadding,
			priorityPlusToggleBorder,
			priorityPlusToggleBorderRadius,
			priorityPlusMobileCollapse = true,
			overlayMenu,
		} = attributes;

		// Ref for the editor wrapper so the MoreButtonPreview can read nav item styles
		const wrapperRef = useRef(null);

		// State for dropdown customizer modal
		const [isDropdownCustomizerOpen, setIsDropdownCustomizerOpen] =
			useState(false);

		// Automatically change overlayMenu from 'always' to 'mobile' when Priority+ is active
		useEffect(() => {
			if (isPriorityPlusVariation && overlayMenu === 'always') {
				setAttributes({ overlayMenu: 'mobile' });
			}
		}, [isPriorityPlusVariation, overlayMenu, setAttributes]);

		// Store typography attribute values for preview
		useEffect(() => {
			if (!isPriorityPlusVariation) {
				return;
			}

			// Store fontSize and fontFamily slug values directly from attributes
			// Also get fontWeight and fontStyle from style object
			const fontWeight = attributes.style?.typography?.fontWeight;
			const fontStyle = attributes.style?.typography?.fontStyle;

			// Only update if values have changed to avoid infinite loops
			if (
				attributes.fontSize !==
					attributes.priorityPlusTypographyFontSize ||
				attributes.fontFamily !==
					attributes.priorityPlusTypographyFontFamily ||
				fontWeight !== attributes.priorityPlusTypographyFontWeight ||
				fontStyle !== attributes.priorityPlusTypographyFontStyle
			) {
				setAttributes({
					priorityPlusTypographyFontFamily: attributes.fontFamily,
					priorityPlusTypographyFontSize: attributes.fontSize,
					priorityPlusTypographyFontWeight: fontWeight,
					priorityPlusTypographyFontStyle: fontStyle,
				});
			}
		}, [
			isPriorityPlusVariation,
			attributes.fontSize,
			attributes.fontFamily,
			attributes.style?.typography?.fontWeight,
			attributes.style?.typography?.fontStyle,
			attributes.priorityPlusTypographyFontFamily,
			attributes.priorityPlusTypographyFontSize,
			attributes.priorityPlusTypographyFontWeight,
			attributes.priorityPlusTypographyFontStyle,
			setAttributes,
		]);

		// Get spacing sizes and color palette from theme settings.
		const [spacingSizes = [], colors = []] = useSettings(
			'spacing.spacingSizes',
			'color.palette'
		);

		// Theme/default color and gradient palettes for the button color dropdowns.
		const colorGradientSettings = useMultipleOriginColorsAndGradients();

		// Helper to check if border has values.
		const hasBorderValue = () => {
			if (!priorityPlusToggleBorder) {
				return false;
			}
			if (
				priorityPlusToggleBorder.color ||
				priorityPlusToggleBorder.width ||
				priorityPlusToggleBorder.style
			) {
				return true;
			}
			return ['top', 'right', 'bottom', 'left'].some((side) => {
				const s = priorityPlusToggleBorder[side];
				return s && (s.color || s.width || s.style);
			});
		};

		// Helper to check if border radius has values.
		const hasBorderRadiusValue = () => {
			if (!priorityPlusToggleBorderRadius) {
				return false;
			}
			if (typeof priorityPlusToggleBorderRadius === 'string') {
				return priorityPlusToggleBorderRadius !== '';
			}
			if (typeof priorityPlusToggleBorderRadius === 'object') {
				return Object.values(priorityPlusToggleBorderRadius).some(
					(v) => v && v !== ''
				);
			}
			return false;
		};

		// Helper to check if padding has values.
		const hasPaddingValue = () => {
			if (!priorityPlusTogglePadding) {
				return false;
			}
			return Object.keys(priorityPlusTogglePadding).length > 0;
		};

		return (
			<>
				<div
					className="priority-plus-navigation-editor-wrapper"
					ref={wrapperRef}
				>
					<BlockEdit {...props} />
					<MoreButtonPreview
						attributes={attributes}
						wrapperRef={wrapperRef}
						clientId={clientId}
					/>
				</div>

				<InspectorControls group="settings">
					<Notice status="info" isDismissible={false}>
						{__(
							'Priority Plus Navigation is not compatible with "Always" overlay menu. The overlay menu is set to "Mobile" to allow Priority+ to work on desktop.',
							'priority-plus-navigation'
						)}
					</Notice>
				</InspectorControls>

				<InspectorControls group="styles">
					<ToolsPanel
						label={__(
							'Priority Plus Settings',
							'priority-plus-navigation'
						)}
						resetAll={() =>
							setAttributes({
								priorityPlusToggleLabel: 'More',
								priorityPlusMenuBackgroundColor:
									tokens.dropdown.backgroundColor,
								priorityPlusMenuBorder: tokens.dropdown.border,
								priorityPlusMenuBorderRadius:
									tokens.dropdown.borderRadius,
								priorityPlusMenuBoxShadow:
									tokens.dropdown.boxShadow,
								priorityPlusMenuItemPadding:
									tokens.dropdown.item.padding,
								priorityPlusMenuItemHoverBackground:
									tokens.dropdown.item.hoverBackground,
								priorityPlusMenuItemTextColor:
									tokens.dropdown.item.textColor,
								priorityPlusMenuItemHoverTextColor:
									tokens.dropdown.item.hoverTextColor,
								priorityPlusMenuSubmenuIndent: {
									left: tokens.dropdown.submenu.indent,
								},
								priorityPlusMenuItemSeparator:
									tokens.dropdown.item.separator,
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
						<ToolsPanelItem
							hasValue={() => !!priorityPlusToggleLabel}
							label={__(
								'Button Label',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								setAttributes({
									priorityPlusToggleLabel: 'More',
								})
							}
							isShownByDefault
						>
							<TextControl
								label={__(
									'Button Label',
									'priority-plus-navigation'
								)}
								value={priorityPlusToggleLabel}
								onChange={(value) =>
									setAttributes({
										priorityPlusToggleLabel: value,
									})
								}
								help={__(
									'Text displayed on the toggle button',
									'priority-plus-navigation'
								)}
							/>
						</ToolsPanelItem>
						<ToolsPanelItem
							hasValue={() => priorityPlusMobileCollapse !== true}
							label={__(
								'Mobile Collapse',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								setAttributes({
									priorityPlusMobileCollapse: true,
								})
							}
							isShownByDefault
						>
							<ToggleControl
								label={__(
									'Collapse all items on mobile',
									'priority-plus-navigation'
								)}
								checked={priorityPlusMobileCollapse}
								onChange={(value) =>
									setAttributes({
										priorityPlusMobileCollapse: value,
									})
								}
								help={__(
									'When enabled, all navigation items collapse into the toggle button at the mobile breakpoint.',
									'priority-plus-navigation'
								)}
							/>
						</ToolsPanelItem>
						<ToolsPanelItem
							hasValue={() => {
								const {
									priorityPlusMenuBackgroundColor,
									priorityPlusMenuBorder,
									priorityPlusMenuBorderRadius,
									priorityPlusMenuBoxShadow,
									priorityPlusMenuItemPadding,
									priorityPlusMenuItemHoverBackground,
									priorityPlusMenuItemHoverTextColor,
									priorityPlusMenuSubmenuIndent,
								} = attributes;
								return (
									!!priorityPlusMenuBackgroundColor ||
									!!priorityPlusMenuBorder ||
									!!priorityPlusMenuBorderRadius ||
									!!priorityPlusMenuBoxShadow ||
									!!priorityPlusMenuItemPadding ||
									!!priorityPlusMenuItemHoverBackground ||
									!!priorityPlusMenuItemHoverTextColor ||
									!!priorityPlusMenuSubmenuIndent
								);
							}}
							label={__(
								'Custom Dropdown',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								setAttributes({
									priorityPlusMenuBackgroundColor:
										tokens.dropdown.backgroundColor,
									priorityPlusMenuBorder:
										tokens.dropdown.border,
									priorityPlusMenuBorderRadius:
										tokens.dropdown.borderRadius,
									priorityPlusMenuBoxShadow:
										tokens.dropdown.boxShadow,
									priorityPlusMenuItemPadding:
										tokens.dropdown.item.padding,
									priorityPlusMenuItemHoverBackground:
										tokens.dropdown.item.hoverBackground,
									priorityPlusMenuItemTextColor:
										tokens.dropdown.item.textColor,
									priorityPlusMenuItemHoverTextColor:
										tokens.dropdown.item.hoverTextColor,
									priorityPlusMenuSubmenuIndent: {
										left: tokens.dropdown.submenu.indent,
									},
									priorityPlusMenuItemSeparator:
										tokens.dropdown.item.separator,
									priorityPlusSubmenuBackgroundColor:
										tokens.dropdown.submenu.backgroundColor,
									priorityPlusSubmenuItemHoverBackground:
										tokens.dropdown.submenu
											.itemHoverBackground,
									priorityPlusSubmenuItemTextColor:
										tokens.dropdown.submenu.itemTextColor,
									priorityPlusSubmenuItemHoverTextColor:
										tokens.dropdown.submenu
											.itemHoverTextColor,
								})
							}
							isShownByDefault
						>
							<Button
								variant="primary"
								onClick={() =>
									setIsDropdownCustomizerOpen(true)
								}
							>
								{__(
									'Customize Dropdown Menu',
									'priority-plus-navigation'
								)}
							</Button>
						</ToolsPanelItem>
					</ToolsPanel>
					<ColorToolsPanel
						label={__(
							'Priority Plus Button Colors',
							'priority-plus-navigation'
						)}
						resetAll={() =>
							setAttributes({
								priorityPlusToggleTextColor: undefined,
								priorityPlusToggleTextColorHover: undefined,
								priorityPlusToggleBackgroundColor: undefined,
								priorityPlusToggleBackgroundColorHover:
									undefined,
							})
						}
					>
						<ColorGradientSettingsDropdown
							__experimentalIsRenderedInSidebar
							settings={[
								{
									label: __(
										'Text Color',
										'priority-plus-navigation'
									),
									colorValue: priorityPlusToggleTextColor,
									onColorChange: (color) =>
										setAttributes({
											priorityPlusToggleTextColor:
												color || undefined,
										}),
									resetAllFilter: () =>
										setAttributes({
											priorityPlusToggleTextColor:
												undefined,
										}),
									clearable: true,
									isShownByDefault: true,
								},
								{
									label: __(
										'Text Hover Color',
										'priority-plus-navigation'
									),
									colorValue:
										priorityPlusToggleTextColorHover,
									onColorChange: (color) =>
										setAttributes({
											priorityPlusToggleTextColorHover:
												color || undefined,
										}),
									resetAllFilter: () =>
										setAttributes({
											priorityPlusToggleTextColorHover:
												undefined,
										}),
									clearable: true,
									isShownByDefault: true,
								},
								{
									label: __(
										'Background Color',
										'priority-plus-navigation'
									),
									colorValue:
										priorityPlusToggleBackgroundColor,
									onColorChange: (color) =>
										setAttributes({
											priorityPlusToggleBackgroundColor:
												color || undefined,
										}),
									resetAllFilter: () =>
										setAttributes({
											priorityPlusToggleBackgroundColor:
												undefined,
										}),
									clearable: true,
									isShownByDefault: true,
								},
								{
									label: __(
										'Background Hover Color',
										'priority-plus-navigation'
									),
									colorValue:
										priorityPlusToggleBackgroundColorHover,
									onColorChange: (color) =>
										setAttributes({
											priorityPlusToggleBackgroundColorHover:
												color || undefined,
										}),
									resetAllFilter: () =>
										setAttributes({
											priorityPlusToggleBackgroundColorHover:
												undefined,
										}),
									clearable: true,
									enableAlpha: true,
									isShownByDefault: true,
								},
							]}
							{...colorGradientSettings}
							gradients={[]}
							disableCustomGradients
						/>
					</ColorToolsPanel>
					<ToolsPanel
						label={__(
							'Priority Plus Button Spacing',
							'priority-plus-navigation'
						)}
						resetAll={() =>
							setAttributes({
								priorityPlusTogglePadding: undefined,
							})
						}
					>
						<ToolsPanelItem
							hasValue={hasPaddingValue}
							label={__(
								'Button Padding',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								setAttributes({
									priorityPlusTogglePadding: undefined,
								})
							}
							isShownByDefault
						>
							{spacingSizes.length > 0 ? (
								<SpacingSizesControl
									values={priorityPlusTogglePadding}
									onChange={(value) =>
										setAttributes({
											priorityPlusTogglePadding: value,
										})
									}
									label={__(
										'Button Padding',
										'priority-plus-navigation'
									)}
									sides={['top', 'right', 'bottom', 'left']}
									units={['px', 'em', 'rem', 'vh', 'vw']}
								/>
							) : (
								<BoxControl
									label={__(
										'Button Padding',
										'priority-plus-navigation'
									)}
									values={priorityPlusTogglePadding}
									onChange={(value) =>
										setAttributes({
											priorityPlusTogglePadding: value,
										})
									}
									sides={['top', 'right', 'bottom', 'left']}
									units={['px', 'em', 'rem', 'vh', 'vw']}
									allowReset={true}
								/>
							)}
						</ToolsPanelItem>
					</ToolsPanel>
					<ToolsPanel
						label={__(
							'Priority Plus Button Border',
							'priority-plus-navigation'
						)}
						resetAll={() =>
							setAttributes({
								priorityPlusToggleBorder: undefined,
								priorityPlusToggleBorderRadius: undefined,
							})
						}
					>
						<ToolsPanelItem
							hasValue={hasBorderValue}
							label={__('Border', 'priority-plus-navigation')}
							onDeselect={() =>
								setAttributes({
									priorityPlusToggleBorder: undefined,
								})
							}
							isShownByDefault
						>
							<BorderBoxControl
								label={__('Border', 'priority-plus-navigation')}
								colors={colors}
								value={priorityPlusToggleBorder}
								onChange={(value) =>
									setAttributes({
										priorityPlusToggleBorder: value,
									})
								}
								enableAlpha={true}
								enableStyle={true}
								size="__unstable-large"
							/>
						</ToolsPanelItem>
						<ToolsPanelItem
							hasValue={hasBorderRadiusValue}
							label={__(
								'Border Radius',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								setAttributes({
									priorityPlusToggleBorderRadius: undefined,
								})
							}
							isShownByDefault
						>
							<BorderRadiusControl
								label={__(
									'Border Radius',
									'priority-plus-navigation'
								)}
								values={priorityPlusToggleBorderRadius}
								onChange={(value) =>
									setAttributes({
										priorityPlusToggleBorderRadius: value,
									})
								}
							/>
						</ToolsPanelItem>
					</ToolsPanel>
				</InspectorControls>

				{/* Render modal conditionally */}
				{isDropdownCustomizerOpen && (
					<DropdownCustomizerModal
						attributes={attributes}
						setAttributes={setAttributes}
						onClose={() => setIsDropdownCustomizerOpen(false)}
					/>
				)}
			</>
		);
	};
}, 'withPriorityPlusControls');

addFilter(
	'editor.BlockEdit',
	'priority-plus-navigation/add-priority-plus-navigation-controls',
	withPriorityPlusControls,
	10
);
