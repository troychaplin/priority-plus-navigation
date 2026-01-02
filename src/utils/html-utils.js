/* global Node */

/**
 * HTML utility functions for PriorityNav
 */

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @return {string} Escaped HTML
 */
export function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Extract text content from a link element
 * @param {HTMLElement} linkElement - Link element to extract text from
 * @return {string} Extracted text
 */
export function extractLinkText(linkElement) {
	if (!linkElement) {
		return '';
	}

	// Get the label element if it exists (WordPress navigation uses this)
	const label = linkElement.querySelector('.wp-block-navigation-item__label');
	if (label) {
		return label.textContent.trim();
	}

	// No label - extract only direct text nodes, not from nested elements
	// Clone link and remove all child elements to get only text
	const linkClone = linkElement.cloneNode(true);
	const allChildren = linkClone.querySelectorAll('*');
	allChildren.forEach((child) => child.remove());
	let text = linkClone.textContent.trim();

	// If that didn't work, try getting first text node only
	if (!text) {
		const textNodes = Array.from(linkElement.childNodes).filter(
			(node) => node.nodeType === Node.TEXT_NODE
		);
		if (textNodes.length > 0) {
			text = textNodes
				.map((node) => node.textContent.trim())
				.filter((t) => t)
				.join(' ');
		}
	}

	return text;
}

/**
 * Remove child text from parent text to avoid contamination
 * @param {string}      parentText       - Parent item text
 * @param {HTMLElement} submenuContainer - Submenu container element
 * @return {string} Cleaned parent text
 */
export function removeChildTextFromParent(parentText, submenuContainer) {
	if (!parentText || !submenuContainer) {
		return parentText;
	}

	const childTexts = [];
	submenuContainer.querySelectorAll('li a').forEach((childLink) => {
		const childText = childLink.textContent.trim();
		if (childText && parentText.includes(childText)) {
			childTexts.push(childText);
		}
	});

	// Remove child texts from parent text if they're found
	if (childTexts.length > 0) {
		let cleanedText = parentText;
		childTexts.forEach((childText) => {
			cleanedText = cleanedText.replace(childText, '').trim();
		});
		return cleanedText;
	}

	return parentText;
}
