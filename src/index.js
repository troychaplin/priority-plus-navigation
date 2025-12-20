
import { registerBlockType, createBlock } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import './style.scss';
import './extend-core-navigation'; // Extend core/navigation with Priority+ support
import Edit from './edit';
import save from './save';
import metadata from './block.json';

// Register the block but hide it from inserter (for backward compatibility with existing content)
registerBlockType( metadata.name, {
	edit: Edit,
	save,
	// Hide from inserter - old wrapper block is deprecated in favor of variation
	...metadata,
	transforms: {
		// Only allow transforming TO core/navigation (for migration)
		// Removed "from" transform - users should use the variation instead
		to: [
			{
				type: 'block',
				blocks: [ 'core/navigation' ],
				transform: ( attributes, innerBlocks ) => {
					// Extract the core/navigation block from inside
					if ( innerBlocks.length > 0 && innerBlocks[ 0 ].name === 'core/navigation' ) {
						const navAttributes = innerBlocks[ 0 ].attributes;
						
						// Preserve Priority+ settings by adding them to the core/navigation block
						return createBlock(
							'core/navigation',
							{
								...navAttributes,
								priorityNavEnabled: true,
								priorityNavMoreLabel: attributes.moreLabel || 'More',
								priorityNavMoreIcon: attributes.moreIcon || 'dots'
							},
							innerBlocks[ 0 ].innerBlocks
						);
					}
					// If no navigation block inside, create one with Priority+ enabled
					return createBlock(
						'core/navigation',
						{
							priorityNavEnabled: true,
							priorityNavMoreLabel: attributes.moreLabel || 'More',
							priorityNavMoreIcon: attributes.moreIcon || 'dots'
						}
					);
				}
			}
		]
	}
} );

// Hide the old wrapper block from the inserter
// Using getBlockType filter which runs after registration
addFilter(
	'blocks.getBlockType',
	'priority-nav/hide-wrapper-from-inserter',
	( settings, name ) => {
		if ( name === 'lumen/priority-nav' ) {
			return {
				...settings,
				supports: {
					...settings.supports,
					inserter: false
				}
			};
		}
		return settings;
	}
);
