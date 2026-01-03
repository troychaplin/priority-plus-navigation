/**
 * WordPress dependencies
 */
import {
	Modal,
	Button,
	TextControl,
	__experimentalUnitControl as UnitControl,
	__experimentalBoxControl as BoxControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import {
	PanelColorSettings,
	__experimentalSpacingSizesControl as SpacingSizesControl,
	useSetting,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './dropdown-customizer-modal.scss';
import { DropdownPreview } from './dropdown-preview';

export function DropdownCustomizerModal({
	attributes,
	setAttributes,
	onClose,
}) {
	const { priorityNavDropdownStyles = {} } = attributes;

	// Get spacing sizes from theme
	const spacingSizes = useSetting('spacing.spacingSizes') || [];

	// Helper to update a single style property
	const updateStyle = (key, value) => {
		setAttributes({
			priorityNavDropdownStyles: {
				...priorityNavDropdownStyles,
				[key]: value,
			},
		});
	};

	// Helper to check if a property has a value
	const hasValue = (key) => {
		return !!priorityNavDropdownStyles[key];
	};

	// Helper to reset a property to default
	const resetToDefault = (key, defaultValue) => {
		updateStyle(key, defaultValue);
	};

	// Helper to check if item spacing has values
	const hasItemSpacingValue = () => {
		if (!priorityNavDropdownStyles.itemSpacing) {
			return false;
		}
		// Check if it's an object (SpacingSizesControl format) or string (legacy format)
		if (typeof priorityNavDropdownStyles.itemSpacing === 'object') {
			return (
				Object.keys(priorityNavDropdownStyles.itemSpacing).length > 0
			);
		}
		return !!priorityNavDropdownStyles.itemSpacing;
	};

	return (
		<Modal
			title={__('Customize Dropdown Styles', 'priority-plus-navigation')}
			onRequestClose={onClose}
			className="priority-plus-dropdown-customizer"
			size="fill"
			isDismissible={true}
		>
			<div className="dropdown-customizer-layout">
				<div className="dropdown-customizer-controls">
					{/* DROPDOWN CONTAINER STYLES */}
					<ToolsPanel
						label={__(
							'Dropdown Container',
							'priority-plus-navigation'
						)}
						resetAll={() => {
							updateStyle('backgroundColor', '#ffffff');
							updateStyle('borderColor', '#dddddd');
							updateStyle('borderWidth', '1px');
							updateStyle('borderRadius', '4px');
							updateStyle(
								'boxShadow',
								'0 4px 12px rgba(0, 0, 0, 0.15)'
							);
						}}
					>
						{/* Border Width */}
						<ToolsPanelItem
							hasValue={() => hasValue('borderWidth')}
							label={__(
								'Border Width',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								resetToDefault('borderWidth', '1px')
							}
							isShownByDefault
						>
							<UnitControl
								label={__(
									'Border Width',
									'priority-plus-navigation'
								)}
								value={
									priorityNavDropdownStyles.borderWidth ||
									'1px'
								}
								onChange={(value) =>
									updateStyle('borderWidth', value)
								}
								units={[
									{ value: 'px', label: 'px' },
									{ value: 'rem', label: 'rem' },
									{ value: 'em', label: 'em' },
								]}
							/>
						</ToolsPanelItem>

						{/* Border Radius */}
						<ToolsPanelItem
							hasValue={() => hasValue('borderRadius')}
							label={__(
								'Border Radius',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								resetToDefault('borderRadius', '4px')
							}
							isShownByDefault
						>
							<UnitControl
								label={__(
									'Border Radius',
									'priority-plus-navigation'
								)}
								value={
									priorityNavDropdownStyles.borderRadius ||
									'4px'
								}
								onChange={(value) =>
									updateStyle('borderRadius', value)
								}
								units={[
									{ value: 'px', label: 'px' },
									{ value: 'rem', label: 'rem' },
									{ value: '%', label: '%' },
								]}
							/>
						</ToolsPanelItem>

						{/* Box Shadow */}
						<ToolsPanelItem
							hasValue={() => hasValue('boxShadow')}
							label={__('Box Shadow', 'priority-plus-navigation')}
							onDeselect={() =>
								resetToDefault(
									'boxShadow',
									'0 4px 12px rgba(0, 0, 0, 0.15)'
								)
							}
							isShownByDefault
						>
							<TextControl
								label={__(
									'Box Shadow',
									'priority-plus-navigation'
								)}
								value={
									priorityNavDropdownStyles.boxShadow ||
									'0 4px 12px rgba(0, 0, 0, 0.15)'
								}
								onChange={(value) =>
									updateStyle('boxShadow', value)
								}
								help={__(
									'CSS box-shadow property',
									'priority-plus-navigation'
								)}
							/>
						</ToolsPanelItem>
					</ToolsPanel>

					{/* DROPDOWN CONTAINER COLORS */}
					<PanelColorSettings
						title={__(
							'Dropdown Container Colors',
							'priority-plus-navigation'
						)}
						colorSettings={[
							{
								label: __(
									'Background Color',
									'priority-plus-navigation'
								),
								value: priorityNavDropdownStyles.backgroundColor,
								onChange: (color) =>
									updateStyle(
										'backgroundColor',
										color || '#ffffff'
									),
								clearable: true,
							},
							{
								label: __(
									'Border Color',
									'priority-plus-navigation'
								),
								value: priorityNavDropdownStyles.borderColor,
								onChange: (color) =>
									updateStyle(
										'borderColor',
										color || '#dddddd'
									),
								clearable: true,
							},
						]}
					/>

					{/* DROPDOWN ITEM STYLES */}
					<ToolsPanel
						label={__('Dropdown Items', 'priority-plus-navigation')}
						resetAll={() => {
							updateStyle('itemSpacing', undefined);
							updateStyle(
								'itemHoverBackgroundColor',
								'rgba(0, 0, 0, 0.05)'
							);
							updateStyle('itemHoverTextColor', 'inherit');
							updateStyle('multiLevelIndent', '1.25rem');
						}}
					>
						{/* Item Spacing */}
						<ToolsPanelItem
							hasValue={hasItemSpacingValue}
							label={__(
								'Item Spacing',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								updateStyle('itemSpacing', undefined)
							}
							isShownByDefault
						>
							{spacingSizes.length > 0 ? (
								<SpacingSizesControl
									values={
										priorityNavDropdownStyles.itemSpacing
									}
									onChange={(value) =>
										updateStyle('itemSpacing', value)
									}
									label={__(
										'Item Spacing (Padding)',
										'priority-plus-navigation'
									)}
									sides={['top', 'right', 'bottom', 'left']}
									units={['px', 'em', 'rem', 'vh', 'vw']}
								/>
							) : (
								<BoxControl
									label={__(
										'Item Spacing (Padding)',
										'priority-plus-navigation'
									)}
									values={
										priorityNavDropdownStyles.itemSpacing
									}
									onChange={(value) =>
										updateStyle('itemSpacing', value)
									}
									sides={['top', 'right', 'bottom', 'left']}
									units={['px', 'em', 'rem', 'vh', 'vw']}
									allowReset={true}
								/>
							)}
						</ToolsPanelItem>

						{/* Multi-level Indent */}
						<ToolsPanelItem
							hasValue={() => hasValue('multiLevelIndent')}
							label={__(
								'Multi-level Indent',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								resetToDefault('multiLevelIndent', '1.25rem')
							}
							isShownByDefault
						>
							<UnitControl
								label={__(
									'Multi-level Indent',
									'priority-plus-navigation'
								)}
								value={
									priorityNavDropdownStyles.multiLevelIndent ||
									'1.25rem'
								}
								onChange={(value) =>
									updateStyle('multiLevelIndent', value)
								}
								help={__(
									'Indentation for nested submenu items',
									'priority-plus-navigation'
								)}
								units={[
									{ value: 'px', label: 'px' },
									{ value: 'rem', label: 'rem' },
									{ value: 'em', label: 'em' },
								]}
							/>
						</ToolsPanelItem>
					</ToolsPanel>

					{/* DROPDOWN ITEM HOVER COLORS */}
					<PanelColorSettings
						title={__(
							'Dropdown Item Hover Colors',
							'priority-plus-navigation'
						)}
						colorSettings={[
							{
								label: __(
									'Hover Background Color',
									'priority-plus-navigation'
								),
								value: priorityNavDropdownStyles.itemHoverBackgroundColor,
								onChange: (color) =>
									updateStyle(
										'itemHoverBackgroundColor',
										color || 'rgba(0, 0, 0, 0.05)'
									),
								clearable: true,
							},
							{
								label: __(
									'Hover Text Color',
									'priority-plus-navigation'
								),
								value: priorityNavDropdownStyles.itemHoverTextColor,
								onChange: (color) =>
									updateStyle(
										'itemHoverTextColor',
										color || 'inherit'
									),
								clearable: true,
							},
						]}
					/>
				</div>

				<div className="dropdown-customizer-preview">
					<DropdownPreview
						dropdownStyles={priorityNavDropdownStyles}
					/>
				</div>
			</div>

			<div className="dropdown-customizer-footer">
				<Button
					variant="tertiary"
					isDestructive
					onClick={() => {
						setAttributes({
							priorityNavDropdownStyles: {
								backgroundColor: '#ffffff',
								borderColor: '#dddddd',
								borderWidth: '1px',
								borderRadius: '4px',
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
								itemSpacing: undefined,
								itemHoverBackgroundColor: 'rgba(0, 0, 0, 0.05)',
								itemHoverTextColor: 'inherit',
								multiLevelIndent: '1.25rem',
							},
						});
					}}
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
