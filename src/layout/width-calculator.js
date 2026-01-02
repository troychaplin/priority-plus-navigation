/**
 * Width calculation utilities for PriorityNav
 */
import { DEFAULT_GAP } from '../utils/constants.js';
import { isMeasurable, getElementWidth } from '../utils/dom-utils.js';

/**
 * Check if item widths cache is valid
 * @param {Array<number>} itemWidths  - Cached item widths
 * @param {number}        itemsLength - Number of items
 * @return {boolean} True if cache is valid
 */
export function hasValidWidthCache(itemWidths, itemsLength) {
	return (
		itemWidths.length === itemsLength &&
		!itemWidths.some((width) => width === 0)
	);
}

/**
 * Cache the widths of all navigation items
 * Only measures if element is visible and cache is invalid
 * @param {HTMLElement}        list          - Navigation list container
 * @param {Array<HTMLElement>} items         - Navigation items
 * @param {Function}           scheduleRetry - Function to call if measurement fails
 * @return {Array<number>} Array of item widths
 */
export function cacheItemWidths(list, items, scheduleRetry) {
	// Only cache if measurable
	if (!isMeasurable(list)) {
		return [];
	}

	// Show all items for accurate measurement
	items.forEach((item) => {
		item.style.display = '';
	});

	// Force a reflow to ensure accurate measurements
	void list.offsetHeight;

	// Measure all items
	const itemWidths = items.map((item) => {
		const width = getElementWidth(item);
		return width > 0 ? width : 0;
	});

	// If we got zero widths, schedule a retry (but don't retry indefinitely)
	if (itemWidths.some((width) => width === 0) && scheduleRetry) {
		scheduleRetry();
	}

	return itemWidths;
}

/**
 * Cache the more button width if not already cached
 * @param {HTMLElement} moreButton    - More button element
 * @param {HTMLElement} moreContainer - More container element
 * @param {number|null} cachedWidth   - Previously cached width (null if not cached)
 * @return {number} Width of more button in pixels
 */
export function cacheMoreButtonWidth(moreButton, moreContainer, cachedWidth) {
	if (cachedWidth !== null) {
		return cachedWidth;
	}

	// Temporarily show more button to measure it
	const wasHidden = moreContainer.style.display === 'none';
	if (wasHidden) {
		moreContainer.style.display = '';
	}

	// Force a reflow for accurate measurement
	void moreButton.offsetHeight;
	const width = getElementWidth(moreButton);

	// Restore previous state
	if (wasHidden) {
		moreContainer.style.display = 'none';
	}

	return width;
}

/**
 * Get gap value from list or nav styles
 * @param {HTMLElement} list - Navigation list container
 * @param {HTMLElement} nav  - Navigation element
 * @return {number} Gap in pixels
 */
export function getGap(list, nav) {
	const listStyles = window.getComputedStyle(list);
	const navStyles = window.getComputedStyle(nav);
	return (
		parseFloat(listStyles.gap) || parseFloat(navStyles.gap) || DEFAULT_GAP
	);
}
