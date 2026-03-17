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
 * Convert border attribute to inline style properties.
 *
 * @param {Object} border - Border attribute (flat or per-side)
 * @return {Object} Inline style properties for border
 */
function getBorderStyles(border) {
	if (!border) {
		return { border: 'none' };
	}

	// Flat format: { color, width, style }
	if (border.color || border.width || border.style) {
		return {
			borderColor: border.color || undefined,
			borderWidth: border.width || undefined,
			borderStyle: border.style || undefined,
		};
	}

	// Per-side format: { top: {...}, right: {...}, bottom: {...}, left: {...} }
	const styles = {};
	const sides = {
		top: 'Top',
		right: 'Right',
		bottom: 'Bottom',
		left: 'Left',
	};
	for (const [side, suffix] of Object.entries(sides)) {
		const s = border[side];
		if (s) {
			if (s.color) {
				styles[`border${suffix}Color`] = s.color;
			}
			if (s.width) {
				styles[`border${suffix}Width`] = s.width;
			}
			if (s.style) {
				styles[`border${suffix}Style`] = s.style;
			}
		}
	}

	return Object.keys(styles).length > 0 ? styles : { border: 'none' };
}

/**
 * Convert border radius attribute to CSS string.
 *
 * @param {string|Object} borderRadius - Border radius value
 * @return {string|undefined} CSS border-radius value
 */
function getBorderRadiusStyle(borderRadius) {
	if (!borderRadius) {
		return undefined;
	}
	if (typeof borderRadius === 'string') {
		return borderRadius;
	}
	if (typeof borderRadius === 'object') {
		const tl = borderRadius.topLeft || '0';
		const tr = borderRadius.topRight || '0';
		const br = borderRadius.bottomRight || '0';
		const bl = borderRadius.bottomLeft || '0';
		return `${tl} ${tr} ${br} ${bl}`;
	}
	return undefined;
}

/**
 * A fake "More" button rendered in the editor to visually represent
 * the Priority Plus pattern. Reads computed styles from the actual
 * nav items so the button matches their typography exactly.
 * @param {Object} root0            - Component props
 * @param {Object} root0.attributes - Block attributes
 * @param {Object} root0.wrapperRef - Ref to the editor wrapper element
 */
export const MoreButtonPreview = ({ attributes, wrapperRef }) => {
	const {
		priorityPlusToggleLabel,
		priorityPlusToggleBackgroundColor,
		priorityPlusToggleTextColor,
		priorityPlusTogglePadding,
		priorityPlusToggleBorder,
		priorityPlusToggleBorderRadius,
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

	const borderStyles = getBorderStyles(priorityPlusToggleBorder);
	const borderRadiusStyle = getBorderRadiusStyle(
		priorityPlusToggleBorderRadius
	);

	const buttonStyle = {
		display: 'flex',
		alignItems: 'center',
		gap: '0.25em',
		whiteSpace: 'nowrap',
		cursor: 'default',
		...borderStyles,
		borderRadius: borderRadiusStyle,
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
			<span
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					marginRight: '-8px',
					lineHeight: 1,
				}}
			>
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
		</span>
	);
};
