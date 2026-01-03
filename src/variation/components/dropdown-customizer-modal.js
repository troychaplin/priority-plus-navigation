/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelColorSettings } from '@wordpress/block-editor';
import {
	Modal,
	Button,
	Panel,
	PanelBody,
	PanelRow,
	TextControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './dropdown-customizer-modal.scss';

/**
 * Default dropdown styles
 */
const DEFAULT_STYLES = {
	backgroundColor: '#ffffff',
	borderColor: '#dddddd',
	borderWidth: '1px',
	borderRadius: '4px',
	boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
	itemSpacing: '0.75rem 1.25rem',
	itemHoverBackgroundColor: 'rgba(0, 0, 0, 0.05)',
	itemHoverTextColor: 'inherit',
	multiLevelIndent: '1.25rem',
};

/**
 * Dropdown Customizer Modal Component
 *
 * @param {Object}   props                - Component props
 * @param {Object}   props.dropdownStyles - Current dropdown styles
 * @param {Function} props.onClose        - Close modal callback
 * @param {Function} props.onSave         - Save callback with new styles
 */
const DropdownCustomizerModal = ({ dropdownStyles, onClose, onSave }) => {
	// Initialize local state with current styles or defaults
	const [localStyles, setLocalStyles] = useState(() => ({
		...DEFAULT_STYLES,
		...(dropdownStyles || {}),
	}));

	// Update a specific style property
	const updateStyle = (key, value) => {
		setLocalStyles((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	// Handle save
	const handleSave = () => {
		onSave(localStyles);
	};

	// Handle reset to defaults
	const handleReset = () => {
		setLocalStyles(DEFAULT_STYLES);
	};

	return (
		<Modal
			title={__('Customize Dropdown Styles', 'priority-plus-navigation')}
			onRequestClose={onClose}
			className="priority-plus-dropdown-customizer-modal"
			style={{ maxWidth: '1200px' }}
		>
			<div className="priority-plus-dropdown-customizer-modal__wrapper">
				<div className="priority-plus-dropdown-customizer-modal__content">
				<div className="priority-plus-dropdown-customizer-modal__column priority-plus-dropdown-customizer-modal__column--controls">
					<Panel>
						<PanelColorSettings
							title={__('Colors', 'priority-plus-navigation')}
							colorSettings={[
								{
									label: __('Background Color', 'priority-plus-navigation'),
									value: localStyles.backgroundColor,
									onChange: (color) =>
										updateStyle('backgroundColor', color || DEFAULT_STYLES.backgroundColor),
									clearable: true,
								},
								{
									label: __('Border Color', 'priority-plus-navigation'),
									value: localStyles.borderColor,
									onChange: (color) =>
										updateStyle('borderColor', color || DEFAULT_STYLES.borderColor),
									clearable: true,
								},
								{
									label: __('Item Hover Background', 'priority-plus-navigation'),
									value: localStyles.itemHoverBackgroundColor,
									onChange: (color) =>
										updateStyle('itemHoverBackgroundColor', color || DEFAULT_STYLES.itemHoverBackgroundColor),
									clearable: true,
								},
								{
									label: __('Item Hover Text Color', 'priority-plus-navigation'),
									value: localStyles.itemHoverTextColor,
									onChange: (color) =>
										updateStyle('itemHoverTextColor', color || DEFAULT_STYLES.itemHoverTextColor),
									clearable: true,
								},
							]}
						/>

						<PanelBody
							title={__('Border & Shadow', 'priority-plus-navigation')}
							initialOpen={true}
						>
							<PanelRow>
								<UnitControl
									label={__('Border Width', 'priority-plus-navigation')}
									value={localStyles.borderWidth}
									onChange={(value) =>
										updateStyle('borderWidth', value || DEFAULT_STYLES.borderWidth)
									}
									units={[
										{ value: 'px', label: 'px' },
										{ value: 'em', label: 'em' },
										{ value: 'rem', label: 'rem' },
									]}
								/>
							</PanelRow>

							<PanelRow>
								<UnitControl
									label={__('Border Radius', 'priority-plus-navigation')}
									value={localStyles.borderRadius}
									onChange={(value) =>
										updateStyle('borderRadius', value || DEFAULT_STYLES.borderRadius)
									}
									units={[
										{ value: 'px', label: 'px' },
										{ value: 'em', label: 'em' },
										{ value: 'rem', label: 'rem' },
										{ value: '%', label: '%' },
									]}
								/>
							</PanelRow>

							<PanelRow>
								<TextControl
									label={__('Box Shadow', 'priority-plus-navigation')}
									value={localStyles.boxShadow}
									onChange={(value) =>
										updateStyle('boxShadow', value || DEFAULT_STYLES.boxShadow)
									}
									help={__(
										'CSS box-shadow value',
										'priority-plus-navigation'
									)}
								/>
							</PanelRow>
						</PanelBody>

						<PanelBody
							title={__('Spacing', 'priority-plus-navigation')}
							initialOpen={true}
						>
							<PanelRow>
								<TextControl
									label={__('Item Padding', 'priority-plus-navigation')}
									value={localStyles.itemSpacing}
									onChange={(value) =>
										updateStyle('itemSpacing', value || DEFAULT_STYLES.itemSpacing)
									}
									help={__(
										'CSS padding (e.g., "0.75rem 1.25rem")',
										'priority-plus-navigation'
									)}
								/>
							</PanelRow>

							<PanelRow>
								<UnitControl
									label={__('Multi-Level Indent', 'priority-plus-navigation')}
									value={localStyles.multiLevelIndent}
									onChange={(value) =>
										updateStyle('multiLevelIndent', value || DEFAULT_STYLES.multiLevelIndent)
									}
									help={__('Indentation for each submenu level', 'priority-plus-navigation')}
									units={[
										{ value: 'px', label: 'px' },
										{ value: 'em', label: 'em' },
										{ value: 'rem', label: 'rem' },
									]}
								/>
							</PanelRow>
						</PanelBody>
					</Panel>
				</div>

				<div className="priority-plus-dropdown-customizer-modal__column priority-plus-dropdown-customizer-modal__column--preview">
					<h3>{__('Live Preview', 'priority-plus-navigation')}</h3>
					<p className="description">
						{__(
							'Preview of your dropdown menu styles.',
							'priority-plus-navigation'
						)}
					</p>
					{/* Preview will be added in Phase 4 */}
					<div className="priority-plus-dropdown-customizer-modal__preview-placeholder">
						<p>
							{__(
								'Live preview will be displayed here.',
								'priority-plus-navigation'
							)}
						</p>
					</div>
				</div>
				</div>

				<div className="priority-plus-dropdown-customizer-modal__footer">
					<Button variant="tertiary" onClick={handleReset}>
						{__('Reset to Defaults', 'priority-plus-navigation')}
					</Button>
					<div className="priority-plus-dropdown-customizer-modal__footer-actions">
						<Button variant="secondary" onClick={onClose}>
							{__('Cancel', 'priority-plus-navigation')}
						</Button>
						<Button variant="primary" onClick={handleSave}>
							{__('Save', 'priority-plus-navigation')}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default DropdownCustomizerModal;
