/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { InspectorControls, useSetting } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	SelectControl,
	ColorPalette,
	BaseControl,
} from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Add Inspector Controls to core/navigation block
 */
const withPriorityNavControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { name, attributes, setAttributes } = props;

		if ( name !== 'core/navigation' ) {
			return <BlockEdit { ...props } />;
		}

		const {
			priorityNavEnabled,
			priorityNavMoreLabel,
			priorityNavMoreIcon,
			priorityNavMoreBackgroundColor,
			priorityNavMoreTextColor,
		} = attributes;

		// Get color palette from theme
		const colors = useSetting( 'color.palette' ) || [];

		return (
			<>
				{ priorityNavEnabled ? (
					<div className="priority-nav-editor-wrapper">
						<BlockEdit { ...props } />
					</div>
				) : (
					<BlockEdit { ...props } />
				) }

				<InspectorControls group="styles">
					<PanelBody
						title={ __( 'Priority Plus Nav', 'priority-nav' ) }
					>
						<TextControl
							label={ __( 'More Button Label', 'priority-nav' ) }
							value={ priorityNavMoreLabel }
							onChange={ ( value ) =>
								setAttributes( { priorityNavMoreLabel: value } )
							}
							help={ __(
								'Text displayed on the "More" button',
								'priority-nav'
							) }
						/>
						<SelectControl
							label={ __( 'More Button Icon', 'priority-nav' ) }
							value={ priorityNavMoreIcon }
							options={ [
								{
									label: __( 'None', 'priority-nav' ),
									value: 'none',
								},
								{
									label: __(
										'Chevron Down (▼)',
										'priority-nav'
									),
									value: 'chevron',
								},
								{
									label: __( 'Plus (+)', 'priority-nav' ),
									value: 'plus',
								},
								{
									label: __( 'Menu (≡)', 'priority-nav' ),
									value: 'menu',
								},
							] }
							onChange={ ( value ) =>
								setAttributes( { priorityNavMoreIcon: value } )
							}
						/>
						<BaseControl
							id="priority-nav-background-color"
							label={ __(
								'More Button Background Color',
								'priority-nav'
							) }
							help={ __(
								'Background color for the "More" button',
								'priority-nav'
							) }
						>
							<ColorPalette
								value={ priorityNavMoreBackgroundColor }
								onChange={ ( color ) =>
									setAttributes( {
										priorityNavMoreBackgroundColor: color,
									} )
								}
								colors={ colors }
								clearable={ true }
							/>
						</BaseControl>
						<BaseControl
							id="priority-nav-text-color"
							label={ __(
								'More Button Text Color',
								'priority-nav'
							) }
							help={ __(
								'Text color for the "More" button',
								'priority-nav'
							) }
						>
							<ColorPalette
								value={ priorityNavMoreTextColor }
								onChange={ ( color ) =>
									setAttributes( {
										priorityNavMoreTextColor: color,
									} )
								}
								colors={ colors }
								clearable={ true }
							/>
						</BaseControl>
					</PanelBody>
				</InspectorControls>
			</>
		);
	};
}, 'withPriorityNavControls' );

addFilter(
	'editor.BlockEdit',
	'priority-nav/add-priority-nav-controls',
	withPriorityNavControls
);
