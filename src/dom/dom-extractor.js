/**
 * DOM extraction utilities for PriorityNav
 */
import {
	extractLinkText,
	removeChildTextFromParent,
} from '../utils/html-utils.js';

/**
 * Extract data from a navigation list item
 * @param {HTMLElement} item - Navigation list item element
 * @return {Object} Extracted navigation item data
 */
export function extractNavItemData(item) {
	const data = {
		text: '',
		url: '#',
		hasSubmenu: false,
		children: [],
	};

	// Check for submenu FIRST - if it exists, we need to get text differently
	const submenuContainer = item.querySelector(
		':scope > .wp-block-navigation__submenu-container'
	);

	// Find the link element
	let linkElement = item.querySelector(':scope > a');
	if (!linkElement) {
		linkElement = item.querySelector(
			':scope > .wp-block-navigation-item__content a'
		);
	}

	if (!linkElement) {
		// Fallback: try to get text from item directly, but exclude submenu text
		if (submenuContainer) {
			// Clone item, remove submenu, then get text
			const clone = item.cloneNode(true);
			const cloneSubmenu = clone.querySelector(
				'.wp-block-navigation__submenu-container'
			);
			if (cloneSubmenu) {
				cloneSubmenu.remove();
			}
			data.text = clone.textContent.trim();
		} else {
			data.text = item.textContent.trim();
		}

		if (submenuContainer) {
			data.hasSubmenu = true;
			const childItems = submenuContainer.querySelectorAll(':scope > li');
			childItems.forEach((childItem) => {
				data.children.push(extractNavItemData(childItem));
			});
		}

		return data;
	}

	// Extract text from link
	data.text = extractLinkText(linkElement);

	// Ensure we don't have submenu text mixed in (safety check)
	if (submenuContainer && data.text) {
		data.text = removeChildTextFromParent(data.text, submenuContainer);
	}

	data.url = linkElement.getAttribute('href') || '#';

	// Extract children if submenu exists
	if (submenuContainer) {
		data.hasSubmenu = true;

		// Extract children recursively
		const childItems = submenuContainer.querySelectorAll(':scope > li');
		childItems.forEach((childItem) => {
			data.children.push(extractNavItemData(childItem));
		});
	}

	return data;
}
