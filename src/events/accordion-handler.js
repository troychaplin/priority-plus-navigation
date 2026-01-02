/**
 * Accordion handling utilities for PriorityNav
 */

/**
 * Toggle an accordion item open/closed
 * @param {HTMLElement} button   - Accordion toggle button
 * @param {HTMLElement} submenu  - Submenu element
 * @param {Object}      instance - PriorityNav instance
 * @param {HTMLElement} dropdown - Dropdown container (for nested accordion lookup)
 */
export function toggleAccordionItem(button, submenu, instance, dropdown) {
	const isExpanded = button.getAttribute('aria-expanded') === 'true';

	if (isExpanded) {
		// Close this accordion
		button.setAttribute('aria-expanded', 'false');
		submenu.style.setProperty('display', 'none', 'important');
		submenu.classList.remove('is-open');
		submenu.setAttribute('aria-hidden', 'true');

		// Remove from open accordions array
		instance.openAccordions = instance.openAccordions.filter(
			(item) => item.button !== button
		);

		// Close any nested accordions
		const nestedAccordions = submenu.querySelectorAll(
			'.priority-plus-navigation-accordion-toggle[aria-expanded="true"]'
		);
		nestedAccordions.forEach((nestedButton) => {
			const nestedSubmenuId = nestedButton.getAttribute('aria-controls');
			// Use scoped lookup within this instance's dropdown to avoid cross-instance collisions
			const nestedSubmenu = dropdown.querySelector(`#${nestedSubmenuId}`);
			if (nestedSubmenu) {
				nestedButton.setAttribute('aria-expanded', 'false');
				nestedSubmenu.style.setProperty('display', 'none', 'important');
				nestedSubmenu.classList.remove('is-open');
				nestedSubmenu.setAttribute('aria-hidden', 'true');
			}
		});
	} else {
		// Open this accordion
		button.setAttribute('aria-expanded', 'true');
		// Force display block with !important via style
		submenu.style.setProperty('display', 'block', 'important');
		submenu.style.setProperty('opacity', '1', 'important');
		submenu.style.setProperty('visibility', 'visible', 'important');
		submenu.style.setProperty('position', 'static', 'important');
		submenu.classList.add('is-open');
		submenu.setAttribute('aria-hidden', 'false');

		// Add to open accordions array
		instance.openAccordions.push({ button, submenu });
	}
}

/**
 * Close all open accordions
 * @param {Object} instance - PriorityNav instance
 */
export function closeAllAccordions(instance) {
	instance.openAccordions.forEach(({ button, submenu }) => {
		button.setAttribute('aria-expanded', 'false');
		submenu.style.setProperty('display', 'none', 'important');
		submenu.classList.remove('is-open');
		submenu.setAttribute('aria-hidden', 'true');
	});
	instance.openAccordions = [];
}
