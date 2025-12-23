/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import {
	TextControl,
	SelectControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
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
					<ToolsPanel
						label={ __( 'Priority Plus Nav', 'priority-nav' ) }
						resetAll={ () =>
							setAttributes( {
								priorityNavMoreLabel: 'Browse',
								priorityNavMoreIcon: 'none',
								priorityNavMoreBackgroundColor: undefined,
								priorityNavMoreTextColor: undefined,
							} )
						}
					>
						<ToolsPanelItem
							hasValue={ () => !! priorityNavMoreLabel }
							label={ __( 'More Button Label', 'priority-nav' ) }
							onDeselect={ () =>
								setAttributes( {
									priorityNavMoreLabel: 'Browse',
								} )
							}
							isShownByDefault
						>
							<TextControl
								label={ __(
									'More Button Label',
									'priority-nav'
								) }
								value={ priorityNavMoreLabel }
								onChange={ ( value ) =>
									setAttributes( {
										priorityNavMoreLabel: value,
									} )
								}
								help={ __(
									'Text displayed on the "More" button',
									'priority-nav'
								) }
							/>
						</ToolsPanelItem>
						<ToolsPanelItem
							hasValue={ () => !! priorityNavMoreIcon }
							label={ __( 'More Button Icon', 'priority-nav' ) }
							onDeselect={ () =>
								setAttributes( { priorityNavMoreIcon: 'none' } )
							}
							isShownByDefault
						>
							<SelectControl
								label={ __(
									'More Button Icon',
									'priority-nav'
								) }
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
									setAttributes( {
										priorityNavMoreIcon: value,
									} )
								}
							/>
						</ToolsPanelItem>
					</ToolsPanel>

					<PanelColorSettings
						title={ __( 'Priority Plus Button', 'priority-nav' ) }
						colorSettings={ [
							{
								label: __( 'Text Color', 'priority-nav' ),
								value: priorityNavMoreTextColor,
								onChange: ( color ) =>
									setAttributes( {
										priorityNavMoreTextColor:
											color || undefined,
									} ),
								clearable: true,
							},
							{
								label: __( 'Background Color', 'priority-nav' ),
								value: priorityNavMoreBackgroundColor,
								onChange: ( color ) =>
									setAttributes( {
										priorityNavMoreBackgroundColor:
											color || undefined,
									} ),
								clearable: true,
							},
						] }
					/>
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
