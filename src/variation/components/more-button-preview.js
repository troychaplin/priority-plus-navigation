/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';

/**
 * Convert WordPress preset value format to CSS custom property format.
 * e.g. "var:preset|spacing|30" → "var(--wp--preset--spacing--30)"
 *
 * @param {string} value - The preset value string
 * @return {string} Converted CSS custom property or original value
 */
function convertPresetValue(value) {
	if (!value || typeof value !== 'string') {
		return value;
	}

	if (value.startsWith('var:preset|')) {
		const matches = value.match(/^var:preset\|([^|]+)\|(.+)$/);
		if (matches) {
			return `var(--wp--preset--${matches[1]}--${matches[2]})`;
		}
	}

	return value;
}

/**
 * A fake "More" button rendered in the editor to visually represent
 * the Priority Plus pattern. Reads computed styles from the actual
 * nav items so the button matches their typography exactly.
 */
export const MoreButtonPreview = ({ attributes, wrapperRef }) => {
	const {
		priorityPlusToggleLabel,
		priorityPlusToggleBackgroundColor,
		priorityPlusToggleTextColor,
		priorityPlusTogglePadding,
	} = attributes;

	const buttonRef = useRef(null);
	const [navFont, setNavFont] = useState({});

	// Read computed font styles from an actual nav item
	useEffect(() => {
		if (!wrapperRef?.current) {
			return;
		}

		const readNavFont = () => {
			const navItem = wrapperRef.current.querySelector(
				'.wp-block-navigation-item__content'
			);
			if (!navItem) {
				return;
			}

			const computed = window.getComputedStyle(navItem);
			setNavFont({
				fontSize: computed.fontSize,
				fontFamily: computed.fontFamily,
				fontWeight: computed.fontWeight,
				fontStyle: computed.fontStyle,
				lineHeight: computed.lineHeight,
			});
		};

		// Read once and again after a short delay for editor paint
		readNavFont();
		const timer = setTimeout(readNavFont, 200);
		return () => clearTimeout(timer);
	}, [
		wrapperRef,
		attributes.fontSize,
		attributes.fontFamily,
		attributes.style?.typography?.fontSize,
		attributes.style?.typography?.fontWeight,
		attributes.style?.typography?.fontStyle,
	]);

	const buttonStyle = {
		display: 'flex',
		alignItems: 'center',
		gap: '0.25em',
		whiteSpace: 'nowrap',
		cursor: 'default',
		border: 'none',
		background: priorityPlusToggleBackgroundColor || 'transparent',
		color: priorityPlusToggleTextColor || 'inherit',
		paddingTop:
			convertPresetValue(priorityPlusTogglePadding?.top) || undefined,
		paddingRight:
			convertPresetValue(priorityPlusTogglePadding?.right) || undefined,
		paddingBottom:
			convertPresetValue(priorityPlusTogglePadding?.bottom) || undefined,
		paddingLeft:
			convertPresetValue(priorityPlusTogglePadding?.left) || undefined,
		fontSize: navFont.fontSize || 'inherit',
		fontFamily: navFont.fontFamily || 'inherit',
		fontWeight: navFont.fontWeight || 'inherit',
		fontStyle: navFont.fontStyle || 'inherit',
		lineHeight: navFont.lineHeight || 'inherit',
	};

	return (
		<span
			ref={buttonRef}
			className="priority-plus-navigation-editor-more-button"
			style={buttonStyle}
			aria-hidden="true"
		>
			<span>
				{priorityPlusToggleLabel ||
					__('More', 'priority-plus-navigation')}
			</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				width="1.25em"
				height="1.25em"
				fill="currentColor"
				aria-hidden="true"
				focusable="false"
			>
				<path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 13.5l4.5-3.1.9 1.2z" />
			</svg>
		</span>
	);
};
