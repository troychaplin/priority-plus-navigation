/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Modal, Button } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';

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
			<div className="priority-plus-dropdown-customizer-modal__content">
				<div className="priority-plus-dropdown-customizer-modal__column priority-plus-dropdown-customizer-modal__column--controls">
					<h3>
						{__('Dropdown Style Settings', 'priority-plus-navigation')}
					</h3>
					<p className="description">
						{__(
							'Customize the appearance of the dropdown menu.',
							'priority-plus-navigation'
						)}
					</p>
					{/* Controls will be added in Phase 3 */}
					<div className="priority-plus-dropdown-customizer-modal__placeholder">
						<p>
							{__(
								'Style controls will be added here.',
								'priority-plus-navigation'
							)}
						</p>
						<ul>
							<li>Background Color: {localStyles.backgroundColor}</li>
							<li>Border Color: {localStyles.borderColor}</li>
							<li>Border Width: {localStyles.borderWidth}</li>
							<li>Border Radius: {localStyles.borderRadius}</li>
							<li>Box Shadow: {localStyles.boxShadow}</li>
							<li>Item Spacing: {localStyles.itemSpacing}</li>
							<li>
								Item Hover Background:{' '}
								{localStyles.itemHoverBackgroundColor}
							</li>
							<li>
								Item Hover Text Color:{' '}
								{localStyles.itemHoverTextColor}
							</li>
							<li>Multi-Level Indent: {localStyles.multiLevelIndent}</li>
						</ul>
					</div>
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
		</Modal>
	);
};

export default DropdownCustomizerModal;
