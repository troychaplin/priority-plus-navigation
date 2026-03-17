/**
 * Design tokens for Priority Plus Navigation
 *
 * Structured by visual concern. Used as default values for block attributes
 * and as fallbacks in editor UI components.
 */
export const tokens = {
	toggle: {
		border: {
			color: undefined,
			width: undefined,
			style: undefined,
		},
		borderRadius: undefined,
	},

	dropdown: {
		backgroundColor: '#ffffff',
		border: {
			color: '#dddddd',
			width: '1px',
			style: 'solid',
		},
		borderRadius: '4px',
		boxShadow: 'default',

		item: {
			padding: {
				top: '0.75rem',
				right: '1rem',
				bottom: '0.75rem',
				left: '1rem',
			},
			hoverBackground: 'rgba(0, 0, 0, 0.05)',
			textColor: '#191919',
			hoverTextColor: '#191919',
			separator: {
				color: '#f0f0f0',
				width: '1px',
				style: 'solid',
			},
		},

		submenu: {
			indent: '1.25rem',
			backgroundColor: '#ffffff',
			itemHoverBackground: 'rgba(0, 0, 0, 0.05)',
			itemTextColor: '#191919',
			itemHoverTextColor: '#191919',
		},
	},
};
